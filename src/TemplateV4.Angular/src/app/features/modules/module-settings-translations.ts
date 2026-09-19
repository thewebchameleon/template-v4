export const moduleSettingsDictionary: Record<string, [string, string]> = {
  moduleDependencyBlockers: [
    'Module dependencies block this change:',
    'Module-afhanklikhede blokkeer hierdie verandering:',
  ],

  supportSettings: ['Support settings', 'Ondersteuningsinstellings'],
  supportSettingsHelp: [
    'Configure Support features and choose where new enquiry notifications are delivered.',
    'Stel Ondersteuningskenmerke op en kies waarheen nuwe navraagkennisgewings gestuur word.',
  ],
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

  moduleMissingDependencies: [
    'Enable the required modules first:',
    'Aktiveer eers die vereiste modules:',
  ],

  modulesHelp: [
    'Enable or disable modules for everyone in this application.',
    'Aktiveer of deaktiveer modules vir almal in hierdie toepassing.',
  ],

  supportEnquiriesFeature: ['Contact Form', 'Kontakvorm'],
  supportEnquiriesFeatureHelp: [
    'Accept public website enquiries. Existing enquiries and queued notifications remain available when disabled.',
    'Aanvaar openbare webwerfnavrae. Bestaande navrae en kennisgewings in die tou bly beskikbaar wanneer dit gedeaktiveer is.',
  ],
  supportTicketsFeature: ['Tickets', 'Kaartjies'],
  supportTicketsFeatureHelp: [
    'Enable requester tickets, conversations, agent triage, categories and attachments. Disabling preserves existing data.',
    'Aktiveer versoekerkaartjies, gesprekke, agenthantering, kategorieë en aanhegsels. Deaktivering behou bestaande data.',
  ],
  supportNotificationEmail: [
    'Enquiry notification recipient',
    'Ontvanger van navraagkennisgewings',
  ],
  supportNotificationHelp: [
    'Send new enquiry notifications to this address. It is never shown on the public website.',
    'Stuur nuwe navraagkennisgewings na hierdie adres. Dit word nooit op die openbare webwerf vertoon nie.',
  ],
  supportRecipientRequired: [
    'Set a notification recipient before the public contact form can accept enquiries.',
    'Stel ’n kennisgewingontvanger in voordat die openbare kontakvorm navrae kan aanvaar.',
  ],
  supportFeaturesSaved: ['Support features saved.', 'Ondersteuningskenmerke gestoor.'],
  demoActiveWarning: [
    'Demo expiry is active for the organisation’s files, even while the File Storage library is disabled. Turn it off to stop scheduling further demo deletions. Already scheduled deletions cannot be undone.',
    'Demo-verval is aktief vir die organisasie se lêers, selfs wanneer die Lêerbergingbiblioteek gedeaktiveer is. Skakel dit af om verdere demo-verwyderings te stop. Reeds geskeduleerde verwyderings kan nie ongedaan gemaak word nie.',
  ],
  demoConfirmTitle: ['Enable demo mode', 'Aktiveer demomodus'],
  demoConfirmWarning: [
    'This starts expiry for all existing and new organisation files and empty folders. Expired items are permanently deleted. Cleanup continues when the File Storage library is disabled. Disabling demo mode later cannot restore deleted items or cancel deletions already scheduled.',
    'Dit begin verval vir alle bestaande en nuwe organisasielêers en leë vouers. Verstreke items word permanent verwyder. Opruiming gaan voort wanneer die Lêerbergingbiblioteek gedeaktiveer is. Latere deaktivering van demomodus herstel nie verwyderde items of kanselleer reeds geskeduleerde verwyderings nie.',
  ],
  demoPasswordHelp: [
    'Enter your administrator password to confirm. Verification is limited to five attempts per 15 minutes.',
    'Voer jou administrateurwagwoord in om te bevestig. Verifikasie is beperk tot vyf pogings per 15 minute.',
  ],
  demoEnableFailed: [
    'Demo mode was not enabled. Check your password; if the attempt limit was reached, wait 15 minutes before retrying.',
    'Demomodus is nie geaktiveer nie. Kontroleer jou wagwoord; indien die poginglimiet bereik is, wag 15 minute voordat jy weer probeer.',
  ],
};
