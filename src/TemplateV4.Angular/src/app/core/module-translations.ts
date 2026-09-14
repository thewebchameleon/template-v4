export const moduleDictionary: Record<string, [string, string]> = {
  moduleConflict: [
    'Another administrator changed these settings. Review the latest values before trying again.',
    'Nog ’n administrateur het hierdie instellings verander. Hersien die jongste waardes voordat jy weer probeer.',
  ],
  moduleDisableBlockers: [
    'Disable these dependent modules first:',
    'Deaktiveer eers hierdie afhanklike modules:',
  ],
  moduleMissingState: [
    'Module setup is incomplete. Ask your deployment administrator to run the Database Migrator.',
    'Module-opstelling is onvolledig. Vra jou ontplooiingsadministrateur om die databasemigreerder uit te voer.',
  ],
  moduleNoSwitches: [
    'No runtime module switches are available in this deployment.',
    'Geen looptydmoduleskakelaars is in hierdie ontplooiing beskikbaar nie.',
  ],
  moduleActivationSaved: [
    'Module availability updated. Accepted work and scheduled cleanup continue.',
    'Modulebeskikbaarheid bygewerk. Aanvaarde werk en geskeduleerde opruiming gaan voort.',
  ],
  demoActiveWarning: [
    'Demo expiry is active for everyone’s personal files, even while My Files is disabled. Turn it off to stop scheduling further demo deletions. Already scheduled deletions cannot be undone.',
    'Demo-verval is aktief vir almal se persoonlike lêers, selfs wanneer My Files gedeaktiveer is. Skakel dit af om verdere demo-verwyderings te stop. Reeds geskeduleerde verwyderings kan nie ongedaan gemaak word nie.',
  ],
  demoConfirmTitle: ['Enable demo mode', 'Aktiveer demomodus'],
  demoConfirmWarning: [
    'This starts expiry for all existing and new personal files and empty folders, for every user. Expired items are permanently deleted. Cleanup continues when My Files is disabled. Disabling demo mode later cannot restore deleted items or cancel deletions already scheduled.',
    'Dit begin verval vir alle bestaande en nuwe persoonlike lêers en leë vouers, vir elke gebruiker. Verstreke items word permanent verwyder. Opruiming gaan voort wanneer My Files gedeaktiveer is. Latere deaktivering van demomodus herstel nie verwyderde items of kanselleer reeds geskeduleerde verwyderings nie.',
  ],
  demoPasswordHelp: [
    'Enter your administrator password to confirm. Verification is limited to five attempts per 15 minutes.',
    'Voer jou administrateurwagwoord in om te bevestig. Verifikasie is beperk tot vyf pogings per 15 minute.',
  ],
  demoEnableFailed: [
    'Demo mode was not enabled. Check your password; if the attempt limit was reached, wait 15 minutes before retrying.',
    'Demomodus is nie geaktiveer nie. Kontroleer jou wagwoord; indien die poginglimiet bereik is, wag 15 minute voordat jy weer probeer.',
  ],
  capabilityLoadFailed: [
    'We could not check module availability.',
    'Ons kon nie modulebeskikbaarheid nagaan nie.',
  ],
  capabilityLoadHelp: [
    'Check your connection and retry to continue to your requested page.',
    'Kontroleer jou verbinding en probeer weer om na jou aangevraagde bladsy te gaan.',
  ],
  capabilityUnavailable: [
    'This module is currently unavailable.',
    'Hierdie module is tans onbeskikbaar.',
  ],
  invoicingRetained: [
    'New invoicing work is disabled. Existing documents remain available for viewing and permitted settlement or correction.',
    'Nuwe faktureringswerk is gedeaktiveer. Bestaande dokumente bly beskikbaar vir besigtiging en toegelate vereffening of regstelling.',
  ],
  'permission.invoicing.issue': [
    'Issue documents and accept quotations',
    'Reik dokumente uit en aanvaar kwotasies',
  ],
  'permission.invoicing.settle': ['Record invoice payments', 'Teken faktuurbetalings aan'],
  'permission.invoicing.correct': [
    'Credit invoices and record refunds',
    'Krediteer fakture en teken terugbetalings aan',
  ],
  'permissionGroup.invoicing': ['Commercial invoicing', 'Kommersiële fakturering'],
  'audit.module.my-files_enabled': ['My Files module enabled', 'Lêermodule geaktiveer'],
  'audit.module.my-files_disabled': ['My Files module disabled', 'Lêermodule gedeaktiveer'],
  moduleDependencyBlockers: [
    'Module dependencies block this change:',
    'Module-afhanklikhede blokkeer hierdie verandering:',
  ],
  moduleMissingDependencies: [
    'Enable the required modules first:',
    'Aktiveer eers die vereiste modules:',
  ],
  modules: ['Modules', 'Modules'],
  modulesHelp: [
    'Enable or disable modules for everyone in this application.',
    'Aktiveer of deaktiveer modules vir almal in hierdie toepassing.',
  ],
  'my-filesModuleHelp': [
    'Personal file libraries, folders and storage allowances.',
    'Persoonlike lêerbiblioteke, vouers en bergingtoelaes.',
  ],
  enableFilesModule: ['Enable My Files', 'Aktiveer Lêers'],
  'my-filesModuleDisableHelp': [
    'Disabling My Files hides file pages and storage settings and blocks file access for everyone. Existing files are preserved and become available again when enabled. Changes apply immediately.',
    'Deaktivering versteek lêerbladsye en berginginstellings en blokkeer lêertoegang vir almal. Bestaande lêers word behou en is weer beskikbaar wanneer dit geaktiveer word. Veranderinge word onmiddellik toegepas.',
  ],
  moduleUnavailable: [
    'This module is unavailable in this deployment. Contact your deployment administrator to make it available.',
    'Hierdie module is nie in hierdie ontplooiing beskikbaar nie. Kontak jou ontplooiingsadministrateur om dit beskikbaar te maak.',
  ],
  filesModuleEnabled: [
    'My Files enabled for this application.',
    'Lêers is vir hierdie toepassing geaktiveer.',
  ],
  filesModuleDisabled: [
    'My Files disabled. Existing files are preserved.',
    'Lêers is gedeaktiveer. Bestaande lêers word behou.',
  ],
};
