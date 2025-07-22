using Microsoft.AspNetCore.Mvc;
using NameGame.Websockets.Dispatchers;
using NameGame.Websockets.Dispatchers.Interfaces;
using NameGame.Websockets.Services;

namespace NameGame.Websockets.Controllers;

[ApiController]
[Route("api/ws")]
public class WebsocketController(
    IWebSocketService webSocketService,
    ILogger<WebsocketController> logger)
    : ControllerBase
{
    private IWebSocketService WebSocketService { get; } = webSocketService;

    private ILogger<WebsocketController> Logger { get; } = logger;

    [HttpGet("game/{id}/guess-stream")]
    public async Task SubscribeToGuessesAsync(
        string id,
        [FromServices] IGuessDispatcher dispatcher,
        CancellationToken cancellationToken)
    {
        this.Logger.LogDebug(
            "Websocket request to subscribe to guesses for game {GameId}",
            id);

        var webSocket = await this.WebSocketService.AcceptWebSocketAsync(
            this.HttpContext);

        if (webSocket is null)
        {
            this.Logger.LogWarning(
                "Websocket request to subscribe to guesses for game {GameId} failed",
                id);
            return;
        }

        await dispatcher.SubscribeToGuessesAsync(
            id,
            webSocket,
            cancellationToken);
    }

    [HttpGet("game/{id}/standings")]
    public async Task SubscribeToStandingsAsync(
        string id,
        [FromServices] IStandingsDispatcher dispatcher,
        CancellationToken cancellationToken)
    {
        this.Logger.LogDebug(
            "Websocket request to subscribe to standings for game {GameId}",
            id);

        var webSocket = await this.WebSocketService.AcceptWebSocketAsync(
            this.HttpContext);

        if (webSocket is null)
        {
            this.Logger.LogWarning(
                "Websocket request to subscribe to standings for game {GameId} failed",
                id);

            return;
        }

        await dispatcher.SubscribeToStandingsAsync(
            id,
            webSocket,
            cancellationToken);
    }

    [HttpGet("game/{id}/status")]
    public async Task SubscribeToGameStatusAsync(
        string id,
        [FromServices] IStatusDispatcher dispatcher,
        CancellationToken cancellationToken)
    {
        this.Logger.LogDebug(
            "Websocket request to subscribe to game status for game {GameId}",
            id);

        var webSocket = await this.WebSocketService.AcceptWebSocketAsync(
            this.HttpContext);

        if (webSocket is null)
        {
            this.Logger.LogWarning(
                "Websocket request to subscribe to game status for game {GameId} failed",
                id);

            return;
        }

        await dispatcher.SubscribeToGameStatusAsync(
            id,
            webSocket,
            cancellationToken);
    }
}