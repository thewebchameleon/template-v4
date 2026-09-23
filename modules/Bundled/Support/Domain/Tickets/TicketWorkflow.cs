namespace TemplateV4.Domain.Support;

public static class TicketWorkflow
{
    public static readonly string[] States = ["Draft", "Open", "InProgress", "WaitingOnRequester", "Resolved", "Closed"];
    public static readonly string[] Priorities = ["Low", "Normal", "High", "Critical"];
    public static bool CanTransition(string from, string to, bool agent) => States.Contains(to) &&
        (from == to || (from == "Draft" ? to == "Open" :
            to != "Draft" && (agent ? from != "Closed" || to == "Open" :
            (from is "Resolved" or "Closed") && to == "Open")));
}
