namespace NameGame.Models.Requests;

public record GuessResult(
    string Id,
    string User,
    string Guess,
    double Score);