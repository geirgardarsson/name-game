using NameGame.Websockets.Dispatchers;
using NameGame.Websockets.Dispatchers.Interfaces;
using NameGame.Websockets.Services;

namespace NameGame.Websockets.Extensions;

public static class IServiceCollectionExtensions
{
    public static IServiceCollection AddWebSocketServices(
        this IServiceCollection services)
    {
        services
            .AddSingleton<IGuessDispatcher, GuessDispatcher>()
            .AddSingleton<IStandingsDispatcher, StandingsDispatcher>()
            .AddScoped<IWebSocketService, WebsocketService>();

        return services;
    }
}