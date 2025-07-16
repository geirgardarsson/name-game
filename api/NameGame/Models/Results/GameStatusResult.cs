using NameGame.Models.Enums;

namespace NameGame.Models.Results;

public record GameStatusResult(
    string GameId,
    string? GameHandle,
    GameStatus Status,
    WinnerResult? Winner = null);