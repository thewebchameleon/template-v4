using Microsoft.AspNetCore.Builder;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class ModuleOwnershipTests
{
    private static readonly string[] BusinessModules = ["Cms", "Crm", "Invoicing", "Support", "Website"];

    [Theory]
    [InlineData("baseline")]
    [InlineData("minimal")]
    public void Composition_retains_scoped_store_aliases_even_when_modules_are_disabled(string preset)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ModulesPreset"] = preset,
            ["ConnectionStrings:app"] = "Host=localhost;Database=ownership;Username=unused",
            ["DataProtection:KeyPath"] = Path.Combine(Path.GetTempPath(), "templatev4-ownership")
        });
        builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, []);
        builder.Services.AddScoped<TemplateV4.SharedKernel.IExecutionContext, BackgroundExecutionContext>();
        using var provider = builder.Services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true, ValidateOnBuild = true });
        using var first = provider.CreateScope();
        using var second = provider.CreateScope();
        var crm = first.ServiceProvider.GetRequiredService<TemplateV4.Application.Crm.ICrm>();
        Assert.Same(crm, first.ServiceProvider.GetRequiredService<TemplateV4.Application.Crm.ICrmCustomers>());
        Assert.NotSame(crm, second.ServiceProvider.GetRequiredService<TemplateV4.Application.Crm.ICrm>());
        Assert.Same(first.ServiceProvider.GetRequiredService<TemplateV4.Application.Invoicing.IInvoicing>(),
            first.ServiceProvider.GetRequiredService<TemplateV4.Application.Invoicing.ICommercialDocuments>());
    }

    [Fact]
    public void Business_modules_use_contracts_instead_of_each_others_implementations()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "framework.json"))) directory = directory.Parent;
        Assert.NotNull(directory);
        var root = Path.Combine(directory.FullName, "src", "TemplateV4.Infrastructure");
        var trees = Directory.EnumerateFiles(root, "*.cs", SearchOption.AllDirectories)
            .Where(file => !Path.GetRelativePath(root, file).Split(Path.DirectorySeparatorChar).Any(part => part is "bin" or "obj"))
            .Select(file => CSharpSyntaxTree.ParseText(File.ReadAllText(file), path: Path.GetRelativePath(root, file).Replace('\\', '/')))
            .Append(CSharpSyntaxTree.ParseText("global using System; global using System.Collections.Generic; global using System.IO; global using System.Linq; global using System.Net.Http; global using System.Threading; global using System.Threading.Tasks;"));
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Where(file => Path.GetFileName(file) != "TemplateV4.Infrastructure.dll")
            .Select(file => MetadataReference.CreateFromFile(file));
        var compilation = CSharpCompilation.Create("ModuleOwnership", trees, references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        // This source-only compilation does not run the SDK's generated-regex implementation.
        Assert.Empty(compilation.GetDiagnostics().Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error && !GeneratedRegexImplementation(compilation, diagnostic)));
        var violations = Violations(compilation);
        Assert.True(violations.Length == 0, string.Join(Environment.NewLine, violations));
    }

    [Fact]
    public void Boundary_check_catches_aliases_and_generic_table_access_but_allows_contracts()
    {
        var compilation = CSharpCompilation.Create("BoundaryProbe",
        [
            CSharpSyntaxTree.ParseText("namespace Example; public class CrmRow {}", path: "Crm/Persistence/Rows.cs"),
            CSharpSyntaxTree.ParseText("namespace Contracts; public interface ICustomers {} public class Db { public Example.CrmRow[] Rows => null; }", path: "Contracts/ICustomers.cs"),
            CSharpSyntaxTree.ParseText("using Row = Example.CrmRow; class Bad { Row Read() => new(); T Set<T>() => default; void Query() { Set<Row>(); } }", path: "Invoicing/Bad.cs"),
            CSharpSyntaxTree.ParseText("class Inferred { void Query(Contracts.Db db) { var rows = db.Rows; } }", path: "Support/Inferred.cs"),
            CSharpSyntaxTree.ParseText("class Good { Contracts.ICustomers customers; }", path: "Support/Good.cs")
        ], [MetadataReference.CreateFromFile(typeof(object).Assembly.Location)],
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        Assert.Empty(compilation.GetDiagnostics().Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error));
        var violations = Violations(compilation);
        Assert.NotEmpty(violations);
        Assert.Contains(violations, violation => violation.Contains("Invoicing/Bad.cs", StringComparison.Ordinal));
        Assert.Contains(violations, violation => violation.Contains("Support/Inferred.cs", StringComparison.Ordinal));
        Assert.DoesNotContain(violations, violation => violation.Contains("Support/Good.cs", StringComparison.Ordinal));
    }

    [Fact]
    public void Permission_catalog_contains_every_module_declaration_once()
    {
        var declarations = typeof(Permissions).GetFields().Where(field => field.IsLiteral && field.FieldType == typeof(string))
            .Select(field => (string)field.GetRawConstantValue()!).Order().ToArray();
        Assert.Equal(declarations.Length, declarations.Distinct().Count());
        Assert.Equal(declarations, Permissions.All.Order().ToArray());
    }

    private static string[] Violations(CSharpCompilation compilation)
    {
        var violations = new HashSet<string>(StringComparer.Ordinal);
        foreach (var tree in compilation.SyntaxTrees.Where(tree => BusinessModules.Contains(Owner(tree))))
        {
            var model = compilation.GetSemanticModel(tree);
            foreach (var name in tree.GetRoot().DescendantNodes().OfType<SimpleNameSyntax>())
            {
                if (name.Ancestors().OfType<UsingDirectiveSyntax>().Any()) continue;
                var symbol = model.GetSymbolInfo(name).Symbol;
                IEnumerable<ITypeSymbol?> types = symbol switch
                {
                    INamedTypeSymbol type => [type],
                    IMethodSymbol method => new ITypeSymbol?[] { method.ContainingType, method.ReturnType }.Concat(method.TypeArguments),
                    IFieldSymbol field => [field.ContainingType, field.Type],
                    IPropertySymbol property => [property.ContainingType, property.Type],
                    _ => []
                };
                foreach (var type in types.SelectMany(ReferencedTypes))
                    foreach (var location in type.Locations)
                    {
                        if (location.SourceTree is not { } target) continue;
                        if (Owner(target) != Owner(tree) && BusinessModules.Contains(Owner(target)))
                            violations.Add($"{tree.FilePath}:{name.GetLocation().GetLineSpan().StartLinePosition.Line + 1} accesses {type} owned by {Owner(target)}. Use an Application contract.");
                    }
            }
        }
        return violations.Order().ToArray();
    }

    private static string Owner(SyntaxTree tree) => tree.FilePath.Split('/')[0];

    private static IEnumerable<INamedTypeSymbol> ReferencedTypes(ITypeSymbol? type)
    {
        if (type is IArrayTypeSymbol array) return ReferencedTypes(array.ElementType);
        return type is INamedTypeSymbol named ? new[] { named }.Concat(named.TypeArguments.SelectMany(ReferencedTypes)) : [];
    }

    private static bool GeneratedRegexImplementation(CSharpCompilation compilation, Diagnostic diagnostic)
    {
        if (diagnostic.Id != "CS8795" || diagnostic.Location.SourceTree is not { } tree) return false;
        var method = tree.GetRoot().FindNode(diagnostic.Location.SourceSpan).FirstAncestorOrSelf<MethodDeclarationSyntax>();
        return method is not null && compilation.GetSemanticModel(tree).GetDeclaredSymbol(method)!.GetAttributes()
            .Any(attribute => attribute.AttributeClass?.ToDisplayString() == "System.Text.RegularExpressions.GeneratedRegexAttribute");
    }
}
