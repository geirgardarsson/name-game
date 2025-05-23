using NameGame.Models.Requests;

namespace NameGame.Application.Queues.Interfaces;

public interface IStandingsQueue
{
    ValueTask EnqueueUpdateStandingsAsync(
        AddGuessInput incomingGuess,
        CancellationToken cancellationToken);

    IAsyncEnumerable<AddGuessInput> ReadAllAsync(
        CancellationToken cancellationToken);

}