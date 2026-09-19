export const moduleDictionary = {
    'audit.module.file-storage_enabled': ['File Storage module enabled', 'Lêerbergingmodule geaktiveer'],
    'audit.module.file-storage_disabled': ['File Storage module disabled', 'Lêerbergingmodule gedeaktiveer'],
    moduleDependencyBlockers: [
        'Module dependencies block this change:',
        'Module-afhanklikhede blokkeer hierdie verandering:',
    ],
    modules: ['Modules', 'Modules'],
    modulesHelp: [
        'Enable or disable modules for everyone in this application.',
        'Aktiveer of deaktiveer modules vir almal in hierdie toepassing.',
    ],
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
moduleDictionary['audit.module.my-files_enabled'] = moduleDictionary['audit.module.file-storage_enabled'];
moduleDictionary['audit.module.my-files_disabled'] = moduleDictionary['audit.module.file-storage_disabled'];
