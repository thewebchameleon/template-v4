using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace templatev4.API;

public sealed class JwtOpenApi : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Components ??= new();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Use a five-minute access token returned by login. Browser cookie endpoints also require CSRF protection."
        };
        foreach (var path in document.Paths)
        {
            if (!path.Key.StartsWith("/api/v1/", StringComparison.Ordinal)) continue;
            var secured = !path.Key.StartsWith("/api/v1/auth/", StringComparison.Ordinal)
                || path.Key.StartsWith("/api/v1/auth/sessions", StringComparison.Ordinal) || path.Key == "/api/v1/auth/culture";
            if (!secured || path.Value.Operations is null) continue;
            foreach (var operation in path.Value.Operations.Values)
                operation.Security = [new OpenApiSecurityRequirement { [new OpenApiSecuritySchemeReference("Bearer", document)] = [] }];
        }
        return Task.CompletedTask;
    }
}
