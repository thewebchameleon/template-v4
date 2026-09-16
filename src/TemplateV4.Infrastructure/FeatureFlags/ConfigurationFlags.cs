using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace TemplateV4.Infrastructure;

public sealed class ConfigurationFlags(IConfiguration configuration, IHostEnvironment environment) : IFeatureFlags
{
    public bool Enabled(string feature, IExecutionContext context)
    {
        var section = configuration.GetSection($"Features:{feature}");
        if (context.ActorId is not null && bool.TryParse(section[$"Users:{context.ActorId}"], out var user)) return user;
        if (bool.TryParse(section[$"Environments:{environment.EnvironmentName}"], out var env)) return env;
        return section.GetValue<bool>("Enabled");
    }
}
