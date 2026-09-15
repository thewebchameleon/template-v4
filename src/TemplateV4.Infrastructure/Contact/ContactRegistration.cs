using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Contact;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddContact(IServiceCollection services) => services.AddScoped<IContact, Contact.ContactStore>();
}
