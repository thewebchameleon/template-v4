using System.Text.Json;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace TemplateV4.ApiService;

public sealed class ContentSchemaOpenApi : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
    {
        if (context.JsonTypeInfo.Type == typeof(Dictionary<string, JsonElement>))
        {
            schema.Type = JsonSchemaType.Object;
            schema.AdditionalPropertiesAllowed = true;
            schema.AdditionalProperties = new OpenApiSchema();
            schema.Description = "Values keyed by the collection's stable field keys. Values follow its versioned field schema.";
        }
        return Task.CompletedTask;
    }
}
