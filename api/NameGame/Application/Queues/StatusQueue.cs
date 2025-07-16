using System.Threading.Channels;
using NameGame.Application.Queues.Interfaces;
using NameGame.Models.Messages;

namespace NameGame.Application.Queues;

public class StatusQueue : IStatusQueue
{
    private readonly Channel<GameEvent> _channel =
        Channel.CreateUnbounded<GameEvent>(
            new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });

    public ValueTask EnqueueUpdateStatusAsync(
        GameEvent gameEvent,
        CancellationToken cancellationToken)
    {
        return _channel.Writer.WriteAsync(gameEvent, cancellationToken);
    }

    public IAsyncEnumerable<GameEvent> ReadAllAsync(
        CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
