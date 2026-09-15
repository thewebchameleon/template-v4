using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddAuditHistory(IServiceCollection services)
    {
        services.AddScoped<IAuditHistory, AuditHistory>();
        services.AddScoped<IHandler<GetAuditDetail, AuditDetail>, AuditDetailHandler>();
        services.AddScoped<IHandler<AuditQuery, Page<AuditItem>>, AuditQueryHandler>();
        services.AddSingleton<IValidator<AuditQuery>, AuditQueryValidator>();
    }
}
