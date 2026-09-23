using TemplateV4.BackgroundWorker;
namespace TemplateV4.Bundled.CommercialBilling;
public static class ModuleWorker
{
    public static void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHostedService<CommercialBillingReconciler>();
    }
}
