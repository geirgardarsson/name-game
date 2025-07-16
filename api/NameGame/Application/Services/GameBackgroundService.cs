using Microsoft.EntityFrameworkCore;
using NameGame.Application.Queues.Interfaces;
using NameGame.Application.Score;
using NameGame.Data.Contexts;
using NameGame.Data.Extensions;
using NameGame.Models;
using NameGame.Models.Enums;
using NameGame.Models.Messages;
using NameGame.Models.Requests;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers;

namespace NameGame.Application.Services;

public class GameBackgroundService(
    ILogger<GameBackgroundService> logger,
    IGuessQueue guessQueue,
    IGuessDispatcher guessDispatcher,
    IStandingsQueue standingsQueue,
    IStatusQueue statusQueue,
    IDbContextFactory<NameGameDbContext> dbContextFactory)
    : BackgroundService
{
    private ILogger<GameBackgroundService> Logger { get; } = logger;

    private IGuessQueue GuessQueue { get; } = guessQueue;

    private IGuessDispatcher GuessDispatcher { get; } = guessDispatcher;

    private IStandingsQueue StandingsQueue { get; } = standingsQueue;

    private IStatusQueue StatusQueue { get; } = statusQueue;

    private NameGameDbContext DbContext { get; } = dbContextFactory.CreateDbContext();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Logger.LogInformation("Game background service is starting.");

        try
        {
            await foreach (var item in GuessQueue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await this.HandleGuessAsync(item, stoppingToken);

                    Logger.LogInformation("Item stored in database. Guess: {guess}", item.Guess);
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, "Error processing item: {Item}", item);
                }
            }
        }
        catch (OperationCanceledException)
        {
            Logger.LogInformation("Game background service is stopping.");
        }
    }

    private async Task HandleGuessAsync(
        AddGuessInput input,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games.GetGameByIdAsync(
            input.GameId,
            cancellationToken);

        var score = GuessScoreCalculator.CalculateScore(input.Guess, game.Answer);

        var guess = new GuessEntity
        {
            GameId = game.Id,
            User = input.User,
            Guess = input.Guess,
            Score = score.Score,
            HintIndicesJson = score.HintsIndices,
        };

        this.DbContext.Guesses.Add(guess);

        await this.DbContext.SaveChangesAsync(cancellationToken);

        var guessResult = new GuessResult(
            guess.Id,
            guess.GameId,
            guess.User,
            guess.Guess,
            guess.Score,
            guess.Score * 100,
            guess.CreatedAt,
            score.HintsIndices);

        if (guess.Score == 1)
        {
            this.Logger.LogInformation("Correct answer. Winner: {user}", guess.User);

            game.Status = GameStatus.Finished;

            await this.DbContext.SaveChangesAsync(cancellationToken);

            await this.StatusQueue.EnqueueUpdateStatusAsync(
                new GameEvent
                {
                    GameId = game.Id,
                    GameHandle = game.Handle,
                    Event = GameEventType.GameFinished,
                    Guess = guessResult
                },
                cancellationToken);
        }

        await this.GuessDispatcher.PublishGuessAsync(
            guessResult,
            cancellationToken);

        await this.StandingsQueue.EnqueueUpdateStandingsAsync(
            guessResult,
            cancellationToken);
    }
}