namespace TemplateV4.Application.Users;

// Navigation indicators never authorize operations; owners recheck their scoped grants.
public interface IAccessIndicators
{
    Task<string[]> Read(Guid actor, CancellationToken ct);
}

// Owners of collection-scoped grants participate in existing role delegation checks.
public interface IScopedRoleDelegation
{
    Task<bool> CanDelegate(Guid actor, Guid[] roleIds, CancellationToken ct);
}
