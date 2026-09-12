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

            "support.not_found" => af ? "Hierdie kaartjie is nie beskikbaar nie." : "This support ticket is unavailable.",
            "support.category_invalid" => af ? "Kies ’n aktiewe kategorie." : "Choose an active category.",
            "support.assignee_invalid" => af ? "Kies ’n aktiewe ondersteuningsagent." : "Choose an active support agent.",
            "support.reopen_required" => af ? "Heropen die kaartjie om voort te gaan." : "Reopen the ticket before continuing.",
            "support.attachment_limit" => af ? "Die kaartjie se aanhangsellimiet is bereik." : "This ticket has reached its attachment limit.",
            "support.category_limit" => af ? "Die limiet van 100 kategorieë is bereik." : "The limit of 100 categories has been reached.",
            "support.last_category" => af ? "Hou minstens een aktiewe kategorie." : "Keep at least one active category.",
            "modules.conflict" => af ? "Module-instellings het verander. Herlaai die gestoorde instellings en probeer weer." : "Module settings changed. Reload the saved settings and try again.",
            "modules.unavailable" => af ? "Hierdie module is nie in hierdie ontplooiing beskikbaar nie." : "This module is unavailable in this deployment.",
            "modules.unknown" => af ? "Kies 'n ondersteunde module." : "Choose a supported module.",
            "appearance.conflict" => af ? "Konfigurasie het verander. Herlaai die gestoorde instellings en probeer weer." : "Configuration changed. Reload the saved settings and try again.",
            "files.invalid_name" => af ? "Gebruik 'n naam van 1–180 karakters sonder skuinsstrepe of beheertekens." : "Use a name of 1–180 characters without slashes or control characters.",
            "files.folder_not_empty" => af ? "Verwyder eers die inhoud van hierdie vouer." : "Delete the contents of this folder first.",
            "files.settings_conflict" => af ? "Berginginstellings het verander. Herlaai en probeer weer." : "Storage settings changed. Reload and try again.",
            "files.invalid_type" => af ? "Kies ’n ondersteunde lêer waarvan die inhoud by die lêertipe pas." : "Choose a supported file whose content matches its file type.",

            "files.too_large" => af ? "Lêers mag nie groter as 20 MB wees nie." : "Files must be 20 MB or smaller.",

            "files.empty" => af ? "Kies ’n lêer wat nie leeg is nie." : "Choose a file that is not empty.",

            "files.quota" => af ? "Jou bergingtoelaag is vol." : "Your storage allowance is full. Deleted files count until retention cleanup completes.",

            "audit.not_found" => af ? "Hierdie ouditinskrywing is nie beskikbaar nie." : "This audit entry is no longer available.",

            "files.not_found" => af ? "Hierdie lêer is nie beskikbaar nie." : "This file is no longer available.",

            "privacy.same_email" => af ? "Kies ’n ander e-posadres." : "Choose a different email address.",

            "privacy.email_unavailable" => af ? "Hierdie e-posadres is nie beskikbaar nie." : "This email address is not available.",

            "invitation.wait" => af ? "Wag twee minute voordat jy weer probeer." : "Wait two minutes before trying again.",

            "invitation.not_pending" => af ? "Hierdie uitnodiging is nie meer hangende nie." : "This invitation is no longer pending. Refresh the list.",

            "auth.action_invalid" => af ? "Hierdie skakel is ongeldig of het verval." : "This link is invalid or expired. Request a new link.",

            "user.last_administrator" => af ? "Voeg ’n ander aktiewe administrateur by." : "Add another active administrator before continuing.",

            "user.self_lockout" => af ? "’n Ander administrateur moet hierdie verandering hersien." : "Another administrator must review this account change.",

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

            "role.protected" => af ? "Ingeboude rolle kan nie verander word nie." : "Built-in roles cannot be changed.",

            "role.invalid" => af ? "Gebruik ’n geldige rolnaam en toestemmings. Bestuur gebruikers vereis Bekyk gebruikers." : "Use a valid role name and permissions. Manage users requires View users.",

            "role.exists" => af ? "Hierdie rolnaam bestaan reeds." : "A role with this name already exists.",

            "role.not_found" => af ? "Die rol bestaan nie meer nie." : "This role no longer exists.",

            "role.delegation_denied" => af ? "Jy kan slegs toegang bestuur wat binne jou eie toestemmings val." : "You can manage only access within your own permissions.",

            "role.self_edit" => af ? "’n Ander administrateur moet ’n rol wat aan jou toegeken is, wysig." : "Another administrator must edit a role assigned to you.",

            "concurrency.conflict" => af ? "Die rekord het verander. Herlaai dit." : "The record changed. Reload it.",

            "profile.name_invalid" => af ? "Voer 'n vertoonnaam van hoogstens 120 karakters en name van hoogstens 100 karakters in." : "Enter a display name up to 120 characters and names up to 100 characters.",
            "profile.phone_invalid" => af ? "Gebruik 'n internasionale telefoonnommer, byvoorbeeld +27821234567." : "Use an international phone number, for example +27821234567.",
            "profile.time_zone_invalid" => af ? "Kies 'n ondersteunde tydsone." : "Choose a supported time zone.",
            "profile.avatar_invalid" => af ? "Kies 'n geldige profielfoto van hoogstens 256 by 256 pixels en 256 KiB." : "Choose a valid profile photo up to 256 by 256 pixels and 256 KiB.",
            "culture.unsupported" => af ? "Kies 'n ondersteunde taal." : "Choose a supported language.",
            _ => af ? "Die versoek kon nie voltooi word nie." : "The request could not be completed."

        };

    }

}
