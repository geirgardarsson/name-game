using System.Net.WebSockets;
using NameGame.Models.Results;

namespace NameGame.Websockets.Dispatchers.Interfaces;

public interface IStandingsDispatcher
{
    Task PublishStandingsAsync(
        StandingsResult standings,
        CancellationToken cancellationToken);

    Task SubscribeToStandingsAsync(
        string id,
        WebSocket webSocket,
        CancellationToken cancellationToken);
}