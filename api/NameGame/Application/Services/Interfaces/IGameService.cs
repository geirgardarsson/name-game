using NameGame.Models.Requests;
using NameGame.Models.Results;

namespace NameGame.Application.Services.Interfaces;

public interface IGameService
{
    Task<CreateGameResult> CreateGameAsync(
        CreateGameRepuest createGameRepuest,
        CancellationToken cancellationToken);

    Task<StartGameResult> StartGameAsync(
        string id,
        CancellationToken cancellationToken);

    Task SubmitGuessAsync(
        AddGuessInput input,
        CancellationToken cancellationToken);

    Task<StandingsResult> CalculateStandings(
        AddGuessInput incomingGuess,
        CancellationToken cancellationToken);
}