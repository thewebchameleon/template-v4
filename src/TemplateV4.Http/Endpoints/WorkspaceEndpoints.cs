namespace TemplateV4.ApiService.Endpoints;

public static class WorkspaceEndpoints
{
    public static RouteGroupBuilder MapWorkspaceEndpoints(this RouteGroupBuilder group)
    {
        group.MapAuditEndpoints();
        group.MapInvitationEndpoints();
        group.MapOperationsOverviewEndpoints();
        group.MapNotificationEndpoints();
        group.MapMyFilesEndpoints();
        group.MapWebPushEndpoints();
        group.MapPrivacyEndpoints();
        return group;
    }
}
