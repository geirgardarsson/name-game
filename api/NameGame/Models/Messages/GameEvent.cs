using NameGame.Models.Enums;
using NameGame.Models.Results;

namespace NameGame.Models.Messages;

public class GameEvent
{
    public required string GameId { get; set; }

    public string? GameHandle { get; set; }

    public required GameEventType Event { get; set; }

    public GuessResult? Guess { get; set; }
}