using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using NameGame.Models.Results;
using NameGame.Websockets.Dispatchers.Interfaces;

namespace NameGame.Websockets.Dispatchers;

public class StatusDispatcher(
    ILogger<StatusDispatcher> logger) : IStatusDispatcher
{
    private ILogger<StatusDispatcher> Logger { get; } = logger;

    private Dictionary<string, ConcurrentBag<WebSocket>> GameClients { get; } = [];

    private JsonSerializerOptions JsonSerializerOptions { get; } =
        new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter() }
        };

    public async Task PublishGameStatusAsync(GameStatusResult status, CancellationToken cancellationToken)
    {
        if (!this.GameClients.TryGetValue(status.GameId, out var clients) || clients.IsEmpty)
        {
            this.Logger.LogDebug("No clients subscribed to status for game {gameId}.", status.GameId);
            return;
        }

        this.Logger.LogDebug("Dispatching status to {numClients} clients", clients.Count);

        var serialized = JsonSerializer.Serialize(status, this.JsonSerializerOptions);
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

    public async Task SubscribeToGameStatusAsync(string gameId, WebSocket webSocket, CancellationToken cancellationToken)
    {
        this.Logger.LogDebug("Receiving new websocket connection for status subscription.");

        if (!this.GameClients.TryGetValue(gameId, out var clients))
        {
            clients = [];
        }

        clients.Add(webSocket);

        this.GameClients[gameId] = clients;

        this.Logger.LogDebug(
            "Subscribed client to status for game {gameId}. Total clients: {numClients}",
            gameId,
            clients.Count);

        var buffer = new byte[1024 * 4];

        while (webSocket.State is WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                this.Logger.LogDebug("Client closed connection.");
                clients.TryTake(out _);

                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", cancellationToken);
            }
        }
    }
}
