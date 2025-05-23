using NameGame.Application.Queues.Interfaces;
using NameGame.Application.Services.Interfaces;
using NameGame.Models.Requests;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers.Interfaces;

namespace NameGame.Application.Services;

public class StandingsBackgroundService(
    ILogger<StandingsBackgroundService> logger,
    IStandingsQueue standingsQueue,
    IStandingsDispatcher standingsDispatcher,
    IGameService gameService)
    : BackgroundService
{
    private ILogger<StandingsBackgroundService> Logger { get; } = logger;

    private IStandingsQueue StandingsQueue { get; } = standingsQueue;

    private IStandingsDispatcher StandingsDispatcher { get; } = standingsDispatcher;

    private IGameService GameService { get; } = gameService;

    private Dictionary<string, StandingsResult> Standings { get; } = [];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        this.Logger.LogInformation("Standings background service is starting.");

        try
        {
            await foreach (var item in this.StandingsQueue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await this.UpdateStandingsAsync(item, stoppingToken);
                }
                catch (Exception ex)
                {
                    this.Logger.LogError(ex, "Error processing update-standings item.");
                }
            }
        }
        catch (OperationCanceledException)
        {
            this.Logger.LogInformation("Standings background service is stopping");
        }
    }

    private async Task UpdateStandingsAsync(
        AddGuessInput newGuess,
        CancellationToken cancellationToken)
    {
        var newStandings = await this.GameService.CalculateStandings(
            newGuess,
            cancellationToken);

        if (this.Standings.TryGetValue(newGuess.GameId, out var currentStandings)
            && currentStandings.Equals(newStandings))
        {
            this.Logger.LogInformation("Standings are the same. No need to update.");
            return;
        }

        this.Standings[newGuess.GameId] = newStandings;

        await this.StandingsDispatcher.PublishStandingsAsync(
            newStandings,
            cancellationToken);
    }
}