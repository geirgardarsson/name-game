using Microsoft.EntityFrameworkCore;
using NameGame.Application.Queues.Interfaces;
using NameGame.Application.Services.Interfaces;
using NameGame.Data.Contexts;
using NameGame.Data.Entities;
using NameGame.Data.Extensions;
using NameGame.Exceptions;
using NameGame.Models.Enums;
using NameGame.Models.Messages;
using NameGame.Models.Requests;
using NameGame.Models.Results;

namespace NameGame.Application.Services;

public class GameService(
    ILogger<GameService> logger,
    IGuessQueue guessQueue,
    IDbContextFactory<NameGameDbContext> dbContextFactory,
    IConfiguration configuration,
    IStatusQueue statusQueue)
    : IGameService
{
    private ILogger<GameService> Logger { get; } = logger;

    private IGuessQueue GuessQueue { get; } = guessQueue;

    private NameGameDbContext DbContext { get; } = dbContextFactory.CreateDbContext();

    private IStatusQueue StatusQueue { get; } = statusQueue;

    private int TopPlayersLimit { get; }
        = configuration.GetValue<int?>("TopPlayersLimit") ?? 10;

    public async Task<CreateGameResult> CreateGameAsync(
        CreateGameRepuest createGameRepuest,
        CancellationToken cancellationToken)
    {
        var newgame = new GameEntity
        {
            Answer = createGameRepuest.Answer,
            Status = createGameRepuest.StartNow
                ? GameStatus.Active
                : GameStatus.Setup,
            EnableHints = createGameRepuest.EnableHints,
        };

        await this.DbContext.Games.AddAsync(newgame, cancellationToken);

        await this.DbContext.SaveChangesAsync(cancellationToken);

        this.Logger.LogInformation("New game created. Handle: {handle}", newgame.Handle);

        return new CreateGameResult(
            newgame.Id,
            newgame.Handle,
            newgame.Status);
    }

    public async Task<StartGameResult> StartGameAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games.GetGameByIdAsync(
            id,
            cancellationToken);

        game.Status = GameStatus.Active;

        await this.DbContext.SaveChangesAsync(cancellationToken);

        await this.StatusQueue.EnqueueUpdateStatusAsync(
            new GameEvent
            {
                GameId = game.Id,
                Event = GameEventType.GameStarted
            },
            cancellationToken);

        this.Logger.LogInformation("Game started! [{handle}]", game.Handle);

        return new StartGameResult(game.Id, game.Handle, game.Status);
    }

    public async Task<GetGameResult> GetGameAsync(
        string gameId,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games.GetGameByIdAsync(
            gameId,
            cancellationToken);

        var standings = await this.DbContext.Guesses.CalculateStandings(
            gameId,
            this.TopPlayersLimit,
            cancellationToken);

        return new GetGameResult(gameId, game.Status, game.Handle, standings);
    }

    public async Task<GetGameResult> GetGameByHandle(
        string handle,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games.GetGameByHandleAsync(
            handle,
            cancellationToken);

        var standings = await this.DbContext.Guesses.CalculateStandings(
            game.Id,
            this.TopPlayersLimit,
            cancellationToken);

        return new GetGameResult(game.Id, game.Status, game.Handle, standings);
    }

    public async Task SubmitGuessAsync(
        AddGuessInput input,
        CancellationToken cancellationToken)
    {
        this.Logger.LogDebug("Receiving a new guess. {user} guessed: {guess}", input.User, input.Guess);

        var game = await this.DbContext.Games
            .FirstOrDefaultAsync(g => g.Id == input.GameId, cancellationToken)
                ?? throw new GameNotFoundException(input.GameId);

        if (game.Status is not GameStatus.Active)
        {
            throw new GameNotActiveException(game);
        }

        if (await this.DbContext.Guesses.AnyAsync(g =>
            g.GameId == input.GameId
            && g.Guess == input.Guess, cancellationToken))
        {
            throw new GuessAlreadySubmittedException(input.GameId, input.Guess);
        }

        await this.GuessQueue.EnqueueGuessAsync(input, cancellationToken);
    }

    public async Task<ICollection<GuessResult>> GetGuessesAsync(
        string gameId,
        GetGuessesFilter filter,
        CancellationToken cancellationToken)
    {
        var guesses = await this.DbContext.Guesses
            .Where(g => g.GameId == gameId)
            .OrderByDescending(g => g.CreatedAt)
            .Take(filter.Limit)
            .ToListAsync(cancellationToken);

        return [.. guesses.Select(g => new GuessResult(
            g.Id,
            g.GameId,
            g.User,
            g.Guess,
            g.Score,
            g.Score * 100,
            g.CreatedAt,
            g.HintIndicesJson))];
    }

    public async Task<GameStatusResult> GetGameStatusAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games.GetGameByIdAsync(id, cancellationToken);

        WinnerResult? winner = null;

        if (game.Status != GameStatus.Finished)
        {
            return new GameStatusResult(game.Id, game.Handle, game.Status, winner);
        }

        var topGuess = await this.DbContext.Guesses
            .Where(g => g.GameId == id && g.Score == 1)
            .FirstOrDefaultAsync(cancellationToken);

        if (topGuess == null)
        {
            this.Logger.LogWarning("Game is finished but no top guess found. Game ID: {gameId}", id);

            return new GameStatusResult(game.Id, game.Handle, game.Status, winner);
        }

        winner = new WinnerResult(topGuess.User, game.Answer);

        return new GameStatusResult(game.Id, game.Handle, game.Status, winner);
    }
}