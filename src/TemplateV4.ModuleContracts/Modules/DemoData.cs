namespace TemplateV4.Application.Modules;

public interface IDemoDataContributor
{
    string ModuleId { get; }
    int Order { get; }
    Task Seed(CancellationToken cancellationToken);
}

public static class DemoDataIds
{
    public static readonly Guid Participant = new("8ad94c4a-58c0-4a86-852f-499bf6329e01");
    public static readonly Guid Customer = new("8ad94c4a-58c0-4a86-852f-499bf6329e02");
    public static readonly Guid Contact = new("8ad94c4a-58c0-4a86-852f-499bf6329e03");
    public static readonly Guid Deal = new("8ad94c4a-58c0-4a86-852f-499bf6329e04");
    public static readonly Guid Article = new("8ad94c4a-58c0-4a86-852f-499bf6329e05");
    public static readonly Guid Ticket = new("8ad94c4a-58c0-4a86-852f-499bf6329e06");
    public static readonly Guid Invoice = new("8ad94c4a-58c0-4a86-852f-499bf6329e07");
    public static readonly Guid Vehicle = new("8ad94c4a-58c0-4a86-852f-499bf6329e08");
    public static readonly Guid Quotation = new("8ad94c4a-58c0-4a86-852f-499bf6329e0d");
}
