namespace TemplateV4.Domain.Support;

public static class TicketWorkflow
{
    public static readonly string[] States = ["Open", "InProgress", "WaitingOnRequester", "Resolved", "Closed"];
    public static readonly string[] Priorities = ["Low", "Normal", "High", "Urgent"];
    public static bool CanTransition(string from, string to, bool agent) => States.Contains(to) &&
        (from == to || (agent ? from != "Closed" || to == "Open" :
            (from is "Resolved" or "Closed") && to == "Open"));
}
