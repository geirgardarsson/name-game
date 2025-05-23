using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers.Interfaces;

namespace NameGame.Websockets.Dispatchers;

public class StandingsDispatcher(
    ILogger<StandingsDispatcher> logger)
    : IStandingsDispatcher
{
    private ILogger<StandingsDispatcher> Logger { get; } = logger;

    private Dictionary<string, ConcurrentBag<WebSocket>> GameClients { get; } = [];

    public async Task PublishStandingsAsync(
        StandingsResult standings,
        CancellationToken cancellationToken)
    {
        if (!this.GameClients.TryGetValue(standings.GameId, out var clients)
            || clients.IsEmpty)
        {
            return;
        }

        this.Logger.LogInformation("Dispatching standings to {numclients} clients", clients.Count);

        var serialized = JsonSerializer.Serialize(standings);
        var buffer = Encoding.UTF8.GetBytes(serialized);

        var subscriptionTasks = new List<Task>();

        foreach (var client in clients)
        {
            if (client.State is WebSocketState.Open)
            {
                subscriptionTasks.Add(client.SendAsync(
                    new ArraySegment<byte>(buffer),
                    WebSocketMessageType.Text,
                    endOfMessage: true,
                    cancellationToken));
            }
        }

        await Task.WhenAll(subscriptionTasks);
    }

    public async Task SubscribeToStandingsAsync(
        string id,
        WebSocket webSocket,
        CancellationToken cancellationToken)
    {
        this.Logger.LogInformation("Receiving new websocket connection.");

        if (!this.GameClients.TryGetValue(id, out var clients))
        {
            clients = [];
        }

        clients.Add(webSocket);

        var buffer = new byte[1024 * 4];

        while (webSocket.State is WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                cancellationToken);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                this.Logger.LogInformation("Client closed connection.");

                clients.TryTake(out _);

                await webSocket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Closing",
                    cancellationToken);
            }
        }
    }
}