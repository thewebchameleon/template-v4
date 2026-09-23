using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed class WebPushSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string EndpointHash { get; set; } = "";
    public string Endpoint { get; set; } = "";
    public string P256dh { get; set; } = "";
    public string Auth { get; set; } = "";
}
