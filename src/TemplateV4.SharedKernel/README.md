# TemplateV4.SharedKernel

Provider-independent contracts and the typed CQRS dispatcher for .NET 10. This package has no dependency on the template's user management, database, ASP.NET Core or Quartz.

Implement IUnitOfWork and IExecutionContext in your application. Register IHandler<TRequest,TResponse>, validators and decorators explicitly. Commands execute within IUnitOfWork; queries do not. Permission authorization precedes validation and execution. The reference implementation and PostgreSQL tests live in the template repository.

Treat namespace/type names, error codes, dispatcher ordering and serialized persisted responses as compatibility contracts. Version packages independently of a consuming application. See `documentation/docs/packages.md` in the repository for copy and package upgrade paths.
