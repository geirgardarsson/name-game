using NameGame.Application.Queues.Interfaces;
using NameGame.Models.Enums;
using NameGame.Models.Messages;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers.Interfaces;

namespace NameGame.Application.Services;

public class StatusBackgroundService(
    ILogger<StatusBackgroundService> logger,
    IStatusQueue statusQueue,
    IStatusDispatcher statusDispatcher)
    : BackgroundService
{
    private ILogger<StatusBackgroundService> Logger { get; } = logger;

    private IStatusQueue StatusQueue { get; } = statusQueue;

    private IStatusDispatcher StatusDispatcher { get; } = statusDispatcher;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        this.Logger.LogDebug("Status background service is starting.");

        try
        {
            await foreach (var gameEvent in this.StatusQueue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    this.Logger.LogDebug(
                        "Processing game event. Type: {eventType}, GameId: {gameId}",
                        gameEvent.Event,
                        gameEvent.GameId);

                    var gameStatus = this.GetGameStatus(gameEvent);

                    await this.StatusDispatcher.PublishGameStatusAsync(
                        gameStatus,
                        stoppingToken);
                }
                catch (Exception ex)
                {
                    this.Logger.LogError(ex, "Error processing status update.");
                }
            }
        }
        catch (OperationCanceledException)
        {
            this.Logger.LogDebug("Status background service is stopping.");
        }
    }

    private GameStatusResult GetGameStatus(GameEvent gameEvent)
    {
        if (gameEvent.Event is GameEventType.GameStarted)
        {
            return new GameStatusResult(
                gameEvent.GameId,
                gameEvent.GameHandle,
                GameStatus.Active);
        }

        var guess = gameEvent.Guess!;

        var winner = new WinnerResult(guess.User, guess.Guess);

        return new GameStatusResult(
            gameEvent.GameId,
            gameEvent.GameHandle,
            GameStatus.Finished,
            winner);
    }
}