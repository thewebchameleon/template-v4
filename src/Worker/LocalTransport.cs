using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Infrastructure.Persistence;
using templatev4.Infrastructure.Security;

namespace templatev4.Worker;

public sealed class LocalTransport(FrameworkDb db, UserManager<AppUser> users, AccountService accounts, IEmailSender email, TimeProvider time, IEnumerable<IIntegrationConsumer> consumers) : IIntegrationTransport
{
    public async Task Publish(MessageEnvelope message, CancellationToken ct)
    {
        if (await db.Inbox.AnyAsync(x => x.Id == message.Id, ct)) return;
        switch (message.Type)
        {
            case "users.created.v1":
                var created = JsonSerializer.Deserialize<UserCreated>(message.Payload)!;
                var user = await users.FindByIdAsync(created.UserId.ToString()) ?? throw new InvalidOperationException("User missing.");
                await accounts.QueueAction(user, EmailTemplate.Verification, created.Culture, ct);
                db.Audit.Add(new() { Action = "user.invitation_queued", SubjectId = user.Id, ActorId = message.ActorId, TraceParent = message.TraceParent, At = time.GetUtcNow() });
                break;
            case "email.requested.v1":
                var request = JsonSerializer.Deserialize<EmailRequest>(message.Payload)!;
                var recipient = await users.FindByIdAsync(request.UserId.ToString()) ?? throw new InvalidOperationException("Recipient missing.");
                await email.Send(recipient.Email!, request, message.Id, ct);
                break;
            case "maintenance.requested.v1":
                var job = JsonSerializer.Deserialize<JobRequested>(message.Payload)!;
                if (!await db.JobRuns.AnyAsync(x => x.Id == job.RequestId, ct))
                    db.JobRuns.Add(new() { Id = job.RequestId, Culture = job.Culture, ActorId = message.ActorId, TraceParent = message.TraceParent, AvailableAt = time.GetUtcNow() });
                break;
            default:
                var consumer = consumers.SingleOrDefault(x => x.Contract == message.Type) ?? throw new InvalidOperationException("Unknown integration contract.");
                await consumer.Handle(message, ct);
                break;
        }
        db.Inbox.Add(new() { Id = message.Id, CompletedAt = time.GetUtcNow() });
    }
}
