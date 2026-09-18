using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using TemplateV4.Application.ApiKeys;

namespace TemplateV4.ApiService;

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
        document.Components.SecuritySchemes["ApiKey"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "ApiKey",
            Description = "Use the one-time credential from Administration > API Keys: Authorization: ApiKey tv4_<id>.<secret>."
        };
        return Task.CompletedTask;
    }
}

public sealed class JwtOperationOpenApi : IOpenApiOperationTransformer
{
    public Task TransformAsync(OpenApiOperation operation, OpenApiOperationTransformerContext context, CancellationToken cancellationToken)
    {
        var metadata = context.Description.ActionDescriptor.EndpointMetadata;
        var authorization = metadata.OfType<IAuthorizeData>().ToArray();
        if (authorization.Length > 0 && !metadata.OfType<IAllowAnonymous>().Any())
            operation.Security = [new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(authorization.Any(x => ApiScopes.All.Contains(x.Policy, StringComparer.Ordinal) ||
                    (x.AuthenticationSchemes ?? "").Split(',').Contains(ApiKeyAuthentication.Scheme)) ? "ApiKey" : "Bearer", context.Document)] = []
            }];

        var path = (context.Description.RelativePath ?? "").TrimEnd('/');
        var method = context.Description.HttpMethod;
        if (method is not null && !HttpMethods.IsGet(method) && (path.StartsWith("api/v1/auth/", StringComparison.Ordinal) || path == "api/v1/bootstrap"))
        {
            operation.Parameters ??= [];
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "X-CSRF-TOKEN",
                In = ParameterLocation.Header,
                Required = true,
                Description = "Anonymous-bound antiforgery token returned by GET /api/v1/auth/csrf. The browser must also send an exact allowed Origin.",
                Schema = new OpenApiSchema { Type = JsonSchemaType.String }
            });
        }
        return Task.CompletedTask;
    }
}
