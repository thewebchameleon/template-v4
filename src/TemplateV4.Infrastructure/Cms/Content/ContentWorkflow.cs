using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class ContentStore
{
    public async Task<Result<ContentItem>> Transition(string key, Guid id, ContentTransition request, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentItem>();
        await using var tx = await db.Database.BeginTransactionAsync(ct); await MutationLock(ct);
        if (!await RuntimeEnabled(ct)) return Missing<ContentItem>();
        var permission = request.Action switch { "submit" => Permissions.CmsWrite, "approve" or "changes" => Permissions.CmsReview, "publish" or "unpublish" => Permissions.CmsPublish, _ => "" };
        if (!await Can(key, permission, ct)) return Denied<ContentItem>();
        if (request.Comment?.Length > 2000) return Invalid<ContentItem>();
        var row = await db.Set<ContentItemRow>().SingleOrDefaultAsync(x => x.Id == id && x.Collection == key, ct);
        var collection = await Find(key, ct);
        if (row is null || collection is null) return Missing<ContentItem>();
        if (row.Version != request.Version) return Conflict<ContentItem>();
        var revision = await db.Set<ContentRevisionRow>().SingleAsync(x => x.Id == row.DraftRevisionId, ct);
        var workflow = Decode<ContentWorkflow>(collection.Workflow);
        switch (request.Action)
        {
            case "submit":
                if (row.State != "Draft") return Invalid<ContentItem>("cms.workflow_state");
                // Each submission has an immutable revision, even when resubmitting unchanged content.
                var submitted = new ContentRevisionRow { ItemId = row.Id, SchemaId = revision.SchemaId, AuthorId = revision.AuthorId ?? context.ActorId,
                    Values = revision.Values, Workflow = Encode(workflow), CreatedAt = time.GetUtcNow() };
                db.Add(submitted);
                var links = await db.Set<ContentRelationRow>().Where(x => x.RevisionId == revision.Id).ToArrayAsync(ct);
                db.AddRange(links.Select(x => new ContentRelationRow { RevisionId = submitted.Id, TargetId = x.TargetId, Path = x.Path }));
                revision = submitted; row.DraftRevisionId = revision.Id;
                if (!workflow.Required) row.State = "Approved";
                else
                {
                    var userIds = workflow.Users ?? []; var roleIds = workflow.Roles ?? [];
                    var candidates = await db.Users.Where(x => userIds.Contains(x.Id) || db.UserRoles.Any(r => r.UserId == x.Id && roleIds.Contains(r.RoleId))).Select(x => x.Id).ToArrayAsync(ct);
                    // An empty reviewer selection means all currently authorized reviewers.
                    if (userIds.Length == 0 && roleIds.Length == 0) candidates = await db.Users.Select(x => x.Id).ToArrayAsync(ct);
                    var reviewers = new List<Guid>();
                    foreach (var candidate in candidates) if (candidate != context.ActorId && candidate != revision.AuthorId && await Allowed(candidate, key, Permissions.CmsReview, ct)) reviewers.Add(candidate);
                    if (reviewers.Count < workflow.Approvals) return Invalid<ContentItem>("cms.reviewers_required");
                    foreach (var reviewer in reviewers)
                    {
                        var review = new ContentReviewRow { RevisionId = revision.Id, ReviewerId = reviewer }; db.Add(review);
                        await actionItems.AddAssignedReview("Cms", review.Id, reviewer, "CMS: " + row.Title[..Math.Min(150, row.Title.Length)],
                            "/cms/collections/" + key + "/items/" + id, ct);
                    }
                    row.State = "InReview";
                }
                break;
            case "approve": case "changes":
                if (row.State != "InReview" || revision.AuthorId == context.ActorId) return Invalid<ContentItem>("cms.workflow_state");
                var reviewRow = await db.Set<ContentReviewRow>().SingleOrDefaultAsync(x => x.RevisionId == revision.Id && x.ReviewerId == context.ActorId && x.State == "Pending", ct);
                if (reviewRow is null) return Denied<ContentItem>();
                reviewRow.State = request.Action == "approve" ? "Approved" : "ChangesRequested"; reviewRow.Comment = request.Comment;
                await actionItems.ResolveReview("Cms", reviewRow.Id, context.ActorId!.Value, ct);
                workflow = Decode<ContentWorkflow>(revision.Workflow!);
                if (request.Action == "changes") { row.State = "Draft"; await CloseReviews(revision.Id, ct); }
                else
                {
                    var approved = await db.Set<ContentReviewRow>().Where(x => x.RevisionId == revision.Id && x.State == "Approved").Select(x => x.ReviewerId).ToArrayAsync(ct);
                    var valid = 1;
                    foreach (var reviewer in approved) if (await Allowed(reviewer, key, Permissions.CmsReview, ct)) valid++;
                    if (valid >= workflow.Approvals) { row.State = "Approved"; await CloseReviews(revision.Id, ct); }
                }
                break;
            case "publish":
                if (revision.Workflow is not null) workflow = Decode<ContentWorkflow>(revision.Workflow);
                if (workflow.Required && row.State != "Approved") return Invalid<ContentItem>("cms.approval_required");
                if (row.State == "InReview") return Invalid<ContentItem>("cms.approval_required");
                if (revision.Workflow is not null && Decode<ContentWorkflow>(revision.Workflow).Required)
                {
                    var required = Decode<ContentWorkflow>(revision.Workflow).Approvals;
                    var approvals = await db.Set<ContentReviewRow>().Where(x => x.RevisionId == revision.Id && x.State == "Approved").Select(x => x.ReviewerId).ToArrayAsync(ct);
                    var validApprovals = 0;
                    foreach (var approver in approvals) if (approver != revision.AuthorId && await Allowed(approver, key, Permissions.CmsReview, ct)) validApprovals++;
                    if (validApprovals < required) return Invalid<ContentItem>("cms.approval_required");
                }
                break;
            case "unpublish":
                row.PublishedRevisionId = null;
                if (row.State == "Published") row.State = revision.Workflow is not null ? "Approved" : "Draft";
                break;
        }
        var publish = request.Action == "publish" || row.State == "Approved" && workflow.AutoPublish && request.Action is "submit" or "approve";
        if (publish)
        {
            var targets = Decode<Dictionary<string, System.Text.Json.JsonElement>>(revision.Values);
            var schema = await db.Set<ContentSchemaRow>().SingleAsync(x => x.Id == revision.SchemaId, ct);
            if (!await PublishedReferences(Decode<ContentField[]>(schema.Fields), targets, ct)) return Invalid<ContentItem>("cms.references_unpublished");
            // Publication uses only the reviewed revision, never another item's draft.
            row.PublishedRevisionId = revision.Id; row.PublishedAt ??= time.GetUtcNow(); row.PublishedUpdatedAt = time.GetUtcNow(); row.State = "Published";
        }
        row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        await ProjectArticle(row, revision, publish, ct); Audit(row.Id, "cms.item." + request.Action);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<ContentItem>.Success(await ItemView(row, ct));
    }

    private async Task<bool> PublishedReferences(ContentField[] fields, Dictionary<string, System.Text.Json.JsonElement> values, CancellationToken ct)
    {
        foreach (var field in fields.Where(x => x.Type is "reference" or "group"))
        {
            if (!values.TryGetValue(field.Key, out var value) || value.ValueKind == System.Text.Json.JsonValueKind.Null) continue;
            var entries = field.Multiple ? value.EnumerateArray().ToArray() : [value];
            foreach (var entry in entries)
            {
                var data = Decode<Dictionary<string, System.Text.Json.JsonElement>>(entry.GetRawText());
                if (field.Type == "reference" && !await db.Set<ContentItemRow>().AnyAsync(x => x.Id == data["id"].GetGuid() && x.PublishedRevisionId != null, ct)) return false;
                if (!await PublishedReferences(field.Fields ?? [], data, ct)) return false;
            }
        }
        return true;
    }
}
