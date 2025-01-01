using NameGame.Application.Queues;
using NameGame.Application.Queues.Interfaces;
using NameGame.Application.Services;
using NameGame.Application.Services.Interfaces;

namespace NameGame.Application.Extensions;

public static class IServiceCollectionExtensions
{
    public static IServiceCollection AddGameServices(
        this IServiceCollection services)
    {
        services
            .AddSingleton<IGuessingService, GuessingService>()
            .AddSingleton<IGuessQueue, GuessQueue>()
            .AddHostedService<GameBackgroundService>()
            .AddScoped<IGameService, GameService>();

        return services;
    }
}