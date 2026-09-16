export const moduleDictionary: Record<string, [string, string]> = {
  'audit.module.support_features_changed': [
    'Support features changed',
    'Ondersteuningskenmerke verander',
  ],
  'permission.crm.manage': ['Manage business records', 'Bestuur besigheidsrekords'],
  'permission.organisation.files.manage': ['Manage shared files', 'Bestuur gedeelde lêers'],
  'permissionGroup.crm': ['CRM', 'CRM'],
  'permissionGroup.organisation': ['Organisation', 'Organisasie'],
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
  'audit.module.file-storage_enabled': [
    'File Storage module enabled',
    'Lêerbergingmodule geaktiveer',
  ],
  'audit.module.file-storage_disabled': [
    'File Storage module disabled',
    'Lêerbergingmodule gedeaktiveer',
  ],
  modules: ['Modules', 'Modules'],
  moduleSettings: ['Module settings', 'Module-instellings'],
  expandModules: ['Expand module settings', 'Vou module-instellings oop'],
  collapseModules: ['Collapse module settings', 'Vou module-instellings toe'],
  settings: ['Settings', 'Instellings'],
  'file-storageModuleHelp': [
    'Organisation file libraries, folders and storage allowances.',
    'Organisasielêerbiblioteke, vouers en bergingtoelaes.',
  ],
  enableFileStorageModule: ['Enable File Storage', 'Aktiveer Lêerberging'],
  'file-storageModuleDisableHelp': [
    'Disabling File Storage hides file pages and storage settings and blocks file access for everyone. Existing files are preserved and become available again when enabled. Changes apply immediately.',
    'Deaktivering versteek lêerbladsye en berginginstellings en blokkeer lêertoegang vir almal. Bestaande lêers word behou en is weer beskikbaar wanneer dit geaktiveer word. Veranderinge word onmiddellik toegepas.',
  ],
  moduleUnavailable: [
    'This module is unavailable in this deployment. Contact your deployment administrator to make it available.',
    'Hierdie module is nie in hierdie ontplooiing beskikbaar nie. Kontak jou ontplooiingsadministrateur om dit beskikbaar te maak.',
  ],
  fileStorageModuleEnabled: [
    'File Storage enabled for this application.',
    'Lêerberging is vir hierdie toepassing geaktiveer.',
  ],
  fileStorageModuleDisabled: [
    'File Storage disabled. Existing files are preserved.',
    'Lêerberging is gedeaktiveer. Bestaande lêers word behou.',
  ],
};

// Retained audit records keep their original action identifiers.
moduleDictionary['audit.module.my-files_enabled'] =
  moduleDictionary['audit.module.file-storage_enabled'];
moduleDictionary['audit.module.my-files_disabled'] =
  moduleDictionary['audit.module.file-storage_disabled'];
