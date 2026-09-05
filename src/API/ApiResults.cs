using System.Diagnostics;
using templatev4.Application;

namespace templatev4.API;

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
            "auth.mfa_required" => af ? "Jou sekuriteitsbeleid vereis 'n verifikasiefaktor." : "Your security policy requires a verification factor.",
            "auth.mfa_setup_required" => af ? "Voltooi faktoropstelling op jou profiel." : "Complete factor setup on your profile.",
            "validation.failed" => af ? "Gaan die ingevoerde waardes na." : "Check the supplied values.",
            "authorization.denied" => af ? "Jy het nie toestemming nie." : "You do not have permission.",
            "concurrency.conflict" => af ? "Die rekord het verander. Herlaai dit." : "The record changed. Reload it.",
            _ => af ? "Die versoek kon nie voltooi word nie." : "The request could not be completed."
        };
    }
}
