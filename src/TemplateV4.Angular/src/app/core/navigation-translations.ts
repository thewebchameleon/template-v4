import { adminDictionary } from './admin-translations';
import { moduleDictionary } from '../features/modules/module-translations';
import { configurationDictionary } from '../features/configuration/configuration-translations';
import { workspaceDictionary } from './workspace-translations';

// Shell labels must be available before any feature route resolver runs.
export const navigationDictionary = {
  crm: ['CRM', 'CRM'],
  invoicing: ['Commercial Billing', 'Kommersiële fakturering'],
  quotes: ['Quotes', 'Kwotasies'],
  invoices: ['Invoices', 'Fakture'],
  newQuote: ['New quote', 'Nuwe kwotasie'],
  newInvoice: ['New invoice', 'Nuwe faktuur'],
  cms: ['CMS', 'CMS'],
  cmsCollections: ['Collections', 'Versamelings'],
  cmsNewCollection: ['New collection', 'Nuwe versameling'],
  cmsSchema: ['Schema and settings', 'Skema en instellings'],
  organisation: ['Organisation', 'Organisasie'],
  files: ['Files', 'Lêers'],
  supportTickets: ['Support tickets', 'Ondersteuningskaartjies'],
  support: ['Support', 'Ondersteuning'],
  configuration: configurationDictionary['configuration'],
  modules: moduleDictionary['modules'],
  privateModules: ['Private modules', 'Privaat modules'],
  auditHistory: workspaceDictionary['auditHistory'],
  backgroundJobs: adminDictionary['backgroundJobs'],
  systemHealth: workspaceDictionary['systemHealth'],
  apiKeys: ['API Keys', 'API-sleutels'],
  paymentMethods: adminDictionary['paymentMethods'],
  commercialBilling: adminDictionary['commercialBilling'],
  commercialBillingSettings: adminDictionary['commercialBillingSettings'],
  contact: ['Retained enquiries', 'Behoue navrae'],
  users: ['Users', 'Gebruikers'],
  invitations: workspaceDictionary['invitations'],
  roles: adminDictionary['roles'],
  security: ['Account security', 'Rekeningsekuriteit'],
  registrationRequests: ['Registration requests', 'Registrasieversoeke'],
  privacyRequests: workspaceDictionary['privacyRequests'],
} satisfies Record<string, [string, string]>;

export type NavigationLabel = keyof typeof navigationDictionary;
