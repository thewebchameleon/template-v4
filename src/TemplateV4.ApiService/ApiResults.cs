using System.Diagnostics;
using TemplateV4.Application;

namespace TemplateV4.ApiService;

public static class ApiResults
{
    public static IResult ToHttp<T>(this Result<T> result) => result.IsSuccess ? Results.Ok(result.Value) : Failure(result.Error!);
    public static IResult Failure(AppError error)
    {
        var status = error.Kind switch { ErrorKind.Validation => 400, ErrorKind.Unauthorized => 401, ErrorKind.Forbidden => 403, ErrorKind.NotFound => 404, ErrorKind.Conflict => 409, _ => 500 };
        return Results.Problem(statusCode: status, type: $"urn:templatev4:error:{error.Code}", title: Message(error.Code),
            extensions: new Dictionary<string, object?> { ["code"] = error.Code, ["traceId"] = Activity.Current?.TraceId.ToString(), ["errors"] = error.Details });
    }
    private static string Message(string code)
    {
        var af = System.Globalization.CultureInfo.CurrentUICulture.Name == "af-ZA";
        return code switch
        {
            "auth.invalid_credentials" => af ? "Die aanmeldbesonderhede is ongeldig." : "The sign-in details are invalid.",
            "auth.factor_invalid" => af ? "Die wagwoord of kode is ongeldig. Gebruik 'n nuwe kode en begin aanmelding weer indien nodig." : "The password or code is invalid. Use a fresh code and restart sign-in if necessary.",
            "auth.reauthentication_required" => af ? "Meld af en weer aan voordat jy sekuriteitsfaktore verander." : "Sign out and sign in again before changing security factors.",
            "auth.challenge_expired" => af ? "Die verifikasieversoek het verval. Begin aanmelding weer." : "The verification request expired. Start sign-in again.",
            "auth.email_code_cooldown" => af ? "Wag voordat jy nog 'n e-poskode aanvra." : "Wait before requesting another email code.",
            "auth.email_code_locked" => af ? "E-poskodeverifikasie is tydelik gesluit. Gebruik 'n ander metode of probeer later weer." : "Email-code verification is temporarily locked. Use another method or try again later.",
            "auth.mfa_required" => af ? "Jou sekuriteitsbeleid vereis 'n verifikasiefaktor." : "Your security policy requires a verification factor.",
            "auth.mfa_setup_required" => af ? "Voltooi faktoropstelling op jou profiel." : "Complete factor setup on your profile.",
            "validation.failed" => af ? "Gaan die ingevoerde waardes na." : "Check the supplied values.",
            "authorization.denied" => af ? "Jy het nie toestemming nie." : "You do not have permission.",
            "concurrency.conflict" => af ? "Die rekord het verander. Herlaai dit." : "The record changed. Reload it.",
            _ => af ? "Die versoek kon nie voltooi word nie." : "The request could not be completed."
        };
    }
}
