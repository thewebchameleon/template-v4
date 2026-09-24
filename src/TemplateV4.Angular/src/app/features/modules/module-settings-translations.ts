export const moduleSettingsDictionary: Record<string, [string, string]> = {
  moduleDependencyBlockers: [
    'Module dependencies block this change:',
    'Module-afhanklikhede blokkeer hierdie verandering:',
  ],

  supportSettings: ['Support settings', 'Ondersteuningsinstellings'],
  supportSettingsHelp: [
    'Configure the Support ticket feature.',
    'Stel die Ondersteuningskaartjiekenmerk op.',
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

  supportTicketsFeature: ['Tickets', 'Kaartjies'],
  supportTicketsFeatureHelp: [
    'Enable requester tickets, conversations, agent triage, categories and attachments. Disabling preserves existing data.',
    'Aktiveer versoekerkaartjies, gesprekke, agenthantering, kategorieë en aanhegsels. Deaktivering behou bestaande data.',
  ],
  supportFeaturesSaved: ['Support features saved.', 'Ondersteuningskenmerke gestoor.'],
  demoActiveWarning: [
    'Demo mode is active. Only files added after this demo run started can expire. Set TEMPLATEV4_DEMO_MODE=false and run the Database Migrator to turn it off.',
    'Demomodus is aktief. Slegs lêers wat ná die begin van hierdie demonstrasielopie bygevoeg is, kan verval. Stel TEMPLATEV4_DEMO_MODE=false en laat die Databasemigreerder loop om dit af te skakel.',
  ],
};
