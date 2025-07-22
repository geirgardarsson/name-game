using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using NameGame.Models.Results;

namespace NameGame.Websockets.Dispatchers;

public class GuessDispatcher(
    ILogger<GuessDispatcher> logger)
    : IGuessDispatcher
{
    private ILogger<GuessDispatcher> Logger { get; } = logger;

    private Dictionary<string, ConcurrentBag<WebSocket>> GameClients { get; } = [];

    private JsonSerializerOptions JsonSerializerOptions { get; } =
        new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter() }
        };

    public async Task PublishGuessAsync(
        GuessResult guess,
        CancellationToken cancellationToken)
    {
        if (!this.GameClients.TryGetValue(guess.GameId, out var clients)
            || clients.IsEmpty)
        {
            this.Logger.LogDebug(
                "No clients subscribed to game {GameId} for guesses",
                guess.GameId);

            return;
        }

        this.Logger.LogDebug("Dispatching guess to {numclients} clients", clients.Count);

        var serialized = JsonSerializer.Serialize(
            guess,
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

    public async Task SubscribeToGuessesAsync(
        string id,
        WebSocket webSocket,
        CancellationToken cancellationToken)
    {
        this.Logger.LogDebug("Receiving new websocket connection.");

        if (!this.GameClients.TryGetValue(id, out var clients))
        {
            clients = [];
        }

        clients.Add(webSocket);

        this.GameClients[id] = clients;

        var buffer = new byte[1024 * 4];

        while (webSocket.State is WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer),
                cancellationToken);

            if (result.MessageType is WebSocketMessageType.Close)
            {
                this.Logger.LogDebug("Closing websocket connection...");

                clients.TryTake(out _);

                await webSocket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Closed by server",
                    cancellationToken);
            }
        }
    }
}