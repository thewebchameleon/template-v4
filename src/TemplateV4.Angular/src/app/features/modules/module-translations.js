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
moduleDictionary['audit.module.my-files_enabled'] = moduleDictionary['audit.module.file-storage_enabled'];
moduleDictionary['audit.module.my-files_disabled'] = moduleDictionary['audit.module.file-storage_disabled'];
