using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers.Interfaces;

namespace NameGame.Websockets.Dispatchers;

public class StandingsDispatcher(
    ILogger<StandingsDispatcher> logger)
    : IStandingsDispatcher
{
    private ILogger<StandingsDispatcher> Logger { get; } = logger;

    private Dictionary<string, ConcurrentBag<WebSocket>> GameClients { get; } = [];

    private JsonSerializerOptions JsonSerializerOptions { get; } =
        new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter() }
        };

    public async Task PublishStandingsAsync(
        StandingsResult standings,
        CancellationToken cancellationToken)
    {
        if (!this.GameClients.TryGetValue(standings.GameId, out var clients)
            || clients.IsEmpty)
        {
            this.Logger.LogDebug(
                "No clients subscribed to standings for game {gameId}.",
                standings.GameId);
            return;
        }

        this.Logger.LogDebug("Dispatching standings to {numclients} clients", clients.Count);

        var serialized = JsonSerializer.Serialize(
            standings,
            this.JsonSerializerOptions);

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
        this.Logger.LogDebug("Receiving new websocket connection for standings subscription.");

        if (!this.GameClients.TryGetValue(id, out var clients))
        {
            clients = [];
        }

        clients.Add(webSocket);

        this.GameClients[id] = clients;

        this.Logger.LogDebug(
            "Subscribed client to standings for game {gameId}. Total clients: {numClients}",
            id,
            clients.Count);

        var buffer = new byte[1024 * 4];

        while (webSocket.State is WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                cancellationToken);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                this.Logger.LogDebug("Client closed connection.");

                clients.TryTake(out _);

                await webSocket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Closing",
                    cancellationToken);
            }
        }
    }
}