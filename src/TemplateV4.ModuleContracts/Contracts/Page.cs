namespace TemplateV4.Application.Users;

public sealed record Page<T>(IReadOnlyList<T> Items, int Total, int PageNumber, int PageSize);
