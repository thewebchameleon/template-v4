using System.Diagnostics;

namespace templatev4.Application;

public enum ErrorKind { Validation, Unauthorized, Forbidden, NotFound, Conflict }
public sealed record AppError(string Code, ErrorKind Kind, Dictionary<string, string[]>? Details = null);
public readonly record struct Unit;
public sealed record Result<T>(T? Value, AppError? Error)
{
    public bool IsSuccess => Error is null;
    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Fail(string code, ErrorKind kind, Dictionary<string, string[]>? details = null) => new(default, new(code, kind, details));
}
public static class Result
{
    public static Result<Unit> Success() => Result<Unit>.Success(new());
    public static Result<Unit> Fail(string code, ErrorKind kind) => Result<Unit>.Fail(code, kind);
}

public interface IRequest<T> { }
public interface ICommand<T> : IRequest<T> { }
public interface IQuery<T> : IRequest<T> { }
public interface IAuthorizedRequest { string Permission { get; } }
public interface IIdempotentRequest { string? IdempotencyKey { get; } }
public interface IHandler<in TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    Task<Result<TResponse>> Handle(TRequest request, CancellationToken cancellationToken);
}
public interface IValidator<in TRequest> { Dictionary<string, string[]> Validate(TRequest request); }
public interface IPipeline<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    Task<Result<TResponse>> Execute(TRequest request, Func<Task<Result<TResponse>>> next, CancellationToken cancellationToken);
}
public interface IExecutionContext
{
    Guid? ActorId { get; }
    IReadOnlySet<string> Permissions { get; }
    string Culture { get; }
    string? TenantId { get; }
    string? TraceParent { get; }
}
public interface IUnitOfWork
{
    Task<Result<T>> Execute<T>(Func<Task<Result<T>>> action, string? key, string fingerprint, CancellationToken cancellationToken);
}
public sealed class Dispatcher<TRequest, TResponse>(IHandler<TRequest, TResponse> handler,
    IEnumerable<IValidator<TRequest>> validators, IEnumerable<IPipeline<TRequest, TResponse>> pipelines,
    IExecutionContext execution, IUnitOfWork transactions) where TRequest : IRequest<TResponse>
{
    public static readonly ActivitySource ActivitySource = new("templatev4.Cqrs");
    public Task<Result<TResponse>> Send(TRequest request, CancellationToken cancellationToken = default)
    {
        return Dispatch();
        async Task<Result<TResponse>> Dispatch()
        {
            using var activity = ActivitySource.StartActivity(typeof(TRequest).Name);
            if (request is IAuthorizedRequest secured && !execution.Permissions.Contains(secured.Permission))
                return Result<TResponse>.Fail("authorization.denied", ErrorKind.Forbidden);
            var errors = validators.SelectMany(v => v.Validate(request)).GroupBy(x => x.Key)
                .ToDictionary(x => x.Key, x => x.SelectMany(y => y.Value).Distinct().ToArray());
            if (errors.Count > 0) return Result<TResponse>.Fail("validation.failed", ErrorKind.Validation, errors);
            Func<Task<Result<TResponse>>> next = () => handler.Handle(request, cancellationToken);
            foreach (var pipeline in pipelines.Reverse())
            {
                var inner = next;
                next = () => pipeline.Execute(request, inner, cancellationToken);
            }
            if (request is not ICommand<TResponse>) return await next();
            var fingerprint = System.Text.Json.JsonSerializer.Serialize(request);
            return await transactions.Execute(next, (request as IIdempotentRequest)?.IdempotencyKey, typeof(TRequest).FullName + ":" + fingerprint, cancellationToken);
        }
    }
}

public interface IIntegrationEvent { }
public sealed class IntegrationContracts
{
    private readonly Dictionary<Type, string> names = [];
    public IntegrationContracts Register<T>(string name) where T : IIntegrationEvent
    {
        if (string.IsNullOrWhiteSpace(name) || names.ContainsValue(name)) throw new ArgumentException("Duplicate or empty integration contract.", nameof(name));
        names.Add(typeof(T), name); return this;
    }
    public string Name<T>() where T : IIntegrationEvent => names.TryGetValue(typeof(T), out var name) ? name : throw new InvalidOperationException("Unregistered integration contract.");
}
public interface IIntegrationConsumer
{
    string Contract { get; }
    Task Handle(MessageEnvelope message, CancellationToken cancellationToken);
}
public interface IEventOutbox { void Add<T>(T message) where T : IIntegrationEvent; }
public sealed record MessageEnvelope(Guid Id, string Type, string Payload, string Culture, string? TraceParent, Guid? ActorId);
public interface IIntegrationTransport { Task Publish(MessageEnvelope message, CancellationToken cancellationToken); }
public interface IFeatureFlags { bool Enabled(string feature, IExecutionContext context); }
public interface IFileStorage
{
    Task Write(string key, Stream content, CancellationToken cancellationToken);
    Task<Stream> Read(string key, CancellationToken cancellationToken);
}
