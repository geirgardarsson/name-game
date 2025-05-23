using Microsoft.EntityFrameworkCore;
using NameGame.Application.Queues.Interfaces;
using NameGame.Application.Services.Interfaces;
using NameGame.Data.Contexts;
using NameGame.Data.Entities;
using NameGame.Exceptions;
using NameGame.Models.Enums;
using NameGame.Models.Requests;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers;

namespace NameGame.Application.Services;

public class GameService(
    ILogger<GameService> logger,
    IGuessDispatcher guessDispatcher,
    IGuessQueue guessQueue,
    NameGameDbContext dbContext,
    IConfiguration configuration)
    : IGameService
{
    private ILogger<GameService> Logger { get; } = logger;

    private IGuessDispatcher GuessDispatcher { get; } = guessDispatcher;

    private IGuessQueue GuessQueue { get; } = guessQueue;

    private NameGameDbContext DbContext { get; } = dbContext;

    private IConfiguration Configuration { get; } = configuration;

    private int TopPlayersLimit { get; }
        = configuration.GetValue<int?>("TopPlayersLimit") ?? 10;

    public async Task<CreateGameResult> CreateGameAsync(
        CreateGameRepuest createGameRepuest,
        CancellationToken cancellationToken)
    {
        var newgame = new GameEntity
        {
            Answer = createGameRepuest.Answer,
            Status = GameStatus.Setup
        };

        await this.DbContext.Games.AddAsync(newgame, cancellationToken);

        await this.DbContext.SaveChangesAsync(cancellationToken);

        this.Logger.LogInformation("New game created. Handle: {handle}", newgame.Handle);

        return new CreateGameResult(newgame.Id, newgame.Status);
    }

    public async Task<StartGameResult> StartGameAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var game = await this.DbContext.Games
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken)
            ?? throw new GameNotFoundException(id);

        game.Status = GameStatus.Active;

        await this.DbContext.SaveChangesAsync(cancellationToken);

        this.Logger.LogInformation("Game started! [{handle}]", game.Handle);

        return new StartGameResult(game.Id, game.Handle, game.Status);
    }

    public async Task SubmitGuessAsync(
        AddGuessInput input,
        CancellationToken cancellationToken)
    {
        this.Logger.LogInformation("Receiving a new guess. {user} guessed: {guess}", input.User, input.Guess);

        await GuessDispatcher.PublishGuessAsync(input, cancellationToken);

        await GuessQueue.EnqueueGuessAsync(input, cancellationToken);
    }

    public async Task<StandingsResult> CalculateStandings(
        AddGuessInput incomingGuess,
        CancellationToken cancellationToken)
    {
        this.Logger.LogInformation(
            "calculating standings. top player limit is {limit}",
            this.TopPlayersLimit);

        var topGuesses = await this.DbContext.Guesses
            .Where(g => g.GameId == incomingGuess.GameId)
            .OrderByDescending(g => g.Score)
            .Take(this.TopPlayersLimit)
            .Select(g => new GuessResult(
                g.Id,
                g.User,
                g.Guess,
                g.Score))
            .ToListAsync(cancellationToken: cancellationToken);

        return new StandingsResult(incomingGuess.GameId, topGuesses);
    }
}