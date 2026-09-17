export const updateDictionary: Record<string, [string, string]> = {
  'releaseComponent_license-unavailable': [
    'License unavailable or expired — contact your provider to renew access.',
    'Lisensie onbeskikbaar of verval — kontak jou verskaffer om toegang te hernu.',
  ],
  'releaseComponent_license-frozen': [
    'Installed version retained; renew update rights for newer versions.',
    'Geïnstalleerde weergawe behou; hernu opdateringsregte vir nuwer weergawes.',
  ],
  deploymentHealth: ['Deployment health', 'Ontplooiingsgesondheid'],
  deploymentHealthHelp: [
    'Installed components, release availability and upgrade guidance.',
    'Geïnstalleerde komponente, weergawebeskikbaarheid en opgraderingsriglyne.',
  ],
  releaseCheckStatus: ['Release checks', 'Weergawekontroles'],
  releaseManualDeployment: [
    'Redeploy your application to install eligible updates. Updates are never installed automatically.',
    'Herontplooi jou toepassing om geskikte opdaterings te installeer. Opdaterings word nooit outomaties geïnstalleer nie.',
  ],
  releaseLicenseRequired: [
    'Renew update rights before installing this version.',
    'Hernu opdateringsregte voordat jy hierdie weergawe installeer.',
  ],
  releaseFeed_disabled: [
    'Update checks have not been configured for this installation.',
    'Opdateringskontroles is nog nie vir hierdie installasie opgestel nie.',
  ],
  releaseFeed_pending: [
    'Waiting for the first release check for this deployment.',
    'Wag vir die eerste weergawekontrole vir hierdie ontplooiing.',
  ],
  releaseFeed_ok: ['Release information is up to date.', 'Weergawe-inligting is op datum.'],
  releaseFeed_unavailable: [
    'The release service could not be reached or verified. The last successful results are shown; checks will retry automatically.',
    'Die weergawe-diens kon nie bereik of geverifieer word nie. Die laaste suksesvolle resultate word gewys; kontroles sal outomaties herhaal.',
  ],
  releaseFeed_stale: [
    'Release information is out of date. Ask your deployment administrator to check the update service.',
    'Weergawe-inligting is verouderd. Vra jou ontplooiingsadministrateur om die opdateringsdiens na te gaan.',
  ],
  releaseLastChecked: ['Last successful check', 'Laaste suksesvolle kontrole'],
  releaseFoundation: ['Foundation', 'Fondasie'],
  releaseInstalled: ['Installed', 'Geïnstalleer'],
  releaseAvailable: ['Available', 'Beskikbaar'],
  releaseComponent_current: ['No newer release reported', 'Geen nuwer weergawe aangemeld nie'],
  releaseComponent_available: ['Update available', 'Opdatering beskikbaar'],
  releaseComponent_blocked: [
    'Requires compatible component updates',
    'Vereis versoenbare komponentopdaterings',
  ],
  releaseComponent_unreleased: [
    'Unreleased development version',
    'Onuitgereikte ontwikkelingsweergawe',
  ],
  releaseBreaking: ['Breaking changes', 'Onversoenbare veranderinge'],
  releaseBreakingHelp: [
    'Review the release notes before upgrading.',
    'Hersien die weergawenotas voordat jy opgradeer.',
  ],
  releaseRequirements: ['Compatibility requirements', 'Versoenbaarheidsvereistes'],
  releaseMigrationNotes: ['Migration guidance', 'Migrasieriglyne'],
  releaseNotes: ['Read release notes', 'Lees weergawenotas'],
  notificationReleaseAvailable: [
    'A foundation or business-module update is available',
    '’n Fondasie- of besigheidsmoduleopdatering is beskikbaar',
  ],
  notificationReleaseAvailableHelp: [
    'Review available versions and compatibility in Deployment health under System Health.',
    'Hersien beskikbare weergawes en versoenbaarheid in Ontplooiingsgesondheid onder Stelselgesondheid.',
  ],
};
