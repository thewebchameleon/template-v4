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
  'commercial-billing': ['Commercial Billing', 'Kommersiële intekeningfakturering'],
  'commercial-billingModuleHelp': [
    'Subscription trials and checkouts, quotes and invoices. Disabling stops new work while existing subscriptions, cancellations, payment reconciliation and financial corrections remain available.',
    'Intekeningproeftydperke en betalings, kwotasies en fakture. Deaktivering stop nuwe werk terwyl bestaande intekeninge, kansellasies, betalingsversoening en finansiële regstellings beskikbaar bly.',
  ],
  invoicingSettings: ['Invoicing settings', 'Faktuurinstellings'],
  modules: ['Modules', 'Modules'],
  moduleSettings: ['Module settings', 'Module-instellings'],
  expandModules: ['Expand module settings', 'Vou module-instellings oop'],
  collapseModules: ['Collapse module settings', 'Vou module-instellings toe'],
  settings: ['Settings', 'Instellings'],
  'file-storageModuleHelp': [
    'File library navigation and pages. Core storage, attachments, links and administration stay available.',
    'Lêerbiblioteeknavigasie en -bladsye. Kernberging, aanhegsels, skakels en administrasie bly beskikbaar.',
  ],
  enableFileStorageModule: ['Enable File Storage', 'Aktiveer Lêerberging'],
  'file-storageModuleDisableHelp': [
    'Disabling File Storage hides the library navigation and pages. Core storage, attachments, public links and storage settings continue. Existing files are preserved. Changes apply immediately.',
    'Deaktivering van Lêerberging versteek die biblioteeknavigasie en -bladsye. Kernberging, aanhegsels, openbare skakels en berginginstellings gaan voort. Bestaande lêers word behou. Veranderinge word onmiddellik toegepas.',
  ],
  moduleUnavailable: [
    'This module is unavailable in this deployment. Contact your deployment administrator to make it available.',
    'Hierdie module is nie in hierdie ontplooiing beskikbaar nie. Kontak jou ontplooiingsadministrateur om dit beskikbaar te maak.',
  ],
  fileStorageModuleEnabled: [
    'File Storage library enabled for this application.',
    'Die Lêerbergingbiblioteek is vir hierdie toepassing geaktiveer.',
  ],
  fileStorageModuleDisabled: [
    'File Storage library disabled. Core storage and existing files remain available.',
    'Die Lêerbergingbiblioteek is gedeaktiveer. Kernberging en bestaande lêers bly beskikbaar.',
  ],
};

// Retained audit records keep their original action identifiers.
moduleDictionary['audit.module.my-files_enabled'] =
  moduleDictionary['audit.module.file-storage_enabled'];
moduleDictionary['audit.module.my-files_disabled'] =
  moduleDictionary['audit.module.file-storage_disabled'];
