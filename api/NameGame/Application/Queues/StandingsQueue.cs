using System.Threading.Channels;
using NameGame.Application.Queues.Interfaces;
using NameGame.Models.Requests;

namespace NameGame.Application.Queues;

public class StandingsQueue : IStandingsQueue
{
    private readonly Channel<AddGuessInput> _channel =
        Channel.CreateUnbounded<AddGuessInput>(
            new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });

    public ValueTask EnqueueUpdateStandingsAsync(
        AddGuessInput incomingGuess,
        CancellationToken cancellationToken)
    {
        return _channel.Writer.WriteAsync(incomingGuess, cancellationToken);
    }

    public IAsyncEnumerable<AddGuessInput> ReadAllAsync(
        CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}