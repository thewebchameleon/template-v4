export const actionItemDictionary: Record<string, [string, string]> = {
  actionSourceCms: ['CMS review', 'CMS-hersiening'],

  actionQueueRegistration: ['Registration approvals', 'Registrasiegoedkeurings'],
  actionQueuePrivacy: ['Privacy reviews', 'Privaatheidshersienings'],
  signupApprovalHelp: [
    'Create an account, verify your email, then wait for administrator approval before signing in.',
    'Skep ’n rekening, bevestig jou e-pos en wag dan vir administrateursgoedkeuring voordat jy aanmeld.',
  ],
  registrationApprovalSent: [
    'If this address can be registered, you will receive an email to verify it. After verification, an administrator must approve your registration. You will receive the decision by email.',
    'Indien hierdie adres geregistreer kan word, sal jy ’n e-pos ontvang om dit te bevestig. Daarna moet ’n administrateur jou registrasie goedkeur. Jy sal die besluit per e-pos ontvang.',
  ],
  actionItemsHelp: [
    'Work that needs your input. Open the relevant page to respond.',
    'Werk wat jou insette nodig het. Maak die toepaslike bladsy oop om te reageer.',
  ],
  createActionItem: ['Create action item', 'Skep aksie-item'],
  actionTitle: ['Title', 'Titel'],
  actionLink: ['Application page', 'Toepassingsbladsy'],
  actionLinkHelp: [
    'Use an internal page path, such as /dashboard. Assignment does not grant access to that page.',
    'Gebruik ’n interne bladsypad, soos /dashboard. Toewysing verleen nie toegang tot daardie bladsy nie.',
  ],
  actionAssignment: ['Assigned to', 'Toegewys aan'],
  actionWorkQueue: ['Work queue', 'Werkry'],
  actionFindPerson: ['Search people by name', 'Soek mense volgens naam'],
  actionChoosePerson: ['Choose a person', 'Kies ’n persoon'],
  actionChooseQueue: ['Choose a queue', 'Kies ’n werkry'],
  actionQueueHelp: [
    'The queue identifies the responsible reviewers. Initially, administrators with review access handle these queues.',
    'Die werkry identifiseer die verantwoordelike beoordelaars. Administrateurs met hersieningstoegang hanteer aanvanklik hierdie werkrye.',
  ],
  actionPeopleHelp: [
    'Search shows up to 20 matching names. Refine your search if needed.',
    'Soektog wys tot 20 passende name. Verfyn jou soektog indien nodig.',
  ],
  actionPeopleError: [
    'People could not be loaded. Change your search to retry.',
    'Mense kon nie gelaai word nie. Verander jou soektog om weer te probeer.',
  ],
  actionOverview: ['Action items overview', 'Aksie-itemoorsig'],
  actionInbox: ['My action items', 'My aksie-items'],
  actionOverviewHelp: [
    'Administrators see all items in the overview. Other users see items they created or are assigned to.',
    'Administrateurs sien alle items in die oorsig. Ander gebruikers sien items wat hulle geskep het of aan hulle toegewys is.',
  ],
  actionScope: ['Item scope', 'Itemomvang'],
  actionOpen: ['Outstanding', 'Uitstaande'],
  actionCompleted: ['Completed', 'Voltooi'],
  actionItemsEmpty: [
    'No action items match this view.',
    'Geen aksie-items pas by hierdie aansig nie.',
  ],
  actionSource: ['Source', 'Bron'],
  actionSourceManual: ['Manual', 'Handmatig'],
  actionSourcePrivacy: ['Privacy request', 'Privaatheidsversoek'],
  actionSourceRegistration: ['Registration', 'Registrasie'],
  actionOpenPage: ['Open page', 'Maak bladsy oop'],
  actionComplete: ['Mark complete', 'Merk as voltooi'],
  actionCreated: ['Action item created', 'Aksie-item geskep'],
  privacyReviewAction: ['Review a privacy request', 'Hersien ’n privaatheidsversoek'],
  registrationReviewAction: ['Review a registration', 'Hersien ’n registrasie'],
  registrationRequestsEmpty: [
    'No registrations are awaiting review.',
    'Geen registrasies wag op hersiening nie.',
  ],
  registrationReviewHelp: [
    'These applicants have verified their email. Review each registration before granting access.',
    'Hierdie aansoekers het hul e-pos bevestig. Hersien elke registrasie voordat toegang verleen word.',
  ],
  approveRegistration: ['Approve registration', 'Keur registrasie goed'],
  approveRegistrationHelp: [
    'Allow this applicant to sign in? They will receive an email with the decision.',
    'Laat hierdie aansoeker toe om aan te meld? Hulle sal ’n e-pos met die besluit ontvang.',
  ],
  registrationApprovalRequired: ['Require registration approval', 'Vereis registrasiegoedkeuring'],
  registrationApprovalHelp: [
    'New public registrations must verify their email and receive administrator approval before signing in. Existing accounts are unaffected.',
    'Nuwe openbare registrasies moet hul e-pos bevestig en administrateursgoedkeuring ontvang voordat hulle aanmeld. Bestaande rekeninge word nie geraak nie.',
  ],
  signupTitle: ['Create an account', 'Skep ’n rekening'],
  signupHelp: [
    'Enter your details below to create your account.',
    'Voer jou besonderhede hieronder in om jou rekening te skep.',
  ],
  signupEmailHelp: [
    'Use this email address as your username when signing in.',
    'Gebruik hierdie e-posadres as jou gebruikersnaam wanneer jy aanmeld.',
  ],
  registrationUnavailable: ['Registration is closed', 'Registrasie is gesluit'],
  registrationUnavailableHelp: [
    'Contact an administrator to request an invitation.',
    'Kontak ’n administrateur om ’n uitnodiging te versoek.',
  ],
  registrationSent: [
    'If your email can be registered, a verification link is on its way. Verify your email before signing in.',
    'As jou e-pos geregistreer kan word, is ’n verifikasieskakel onderweg. Verifieer jou e-pos voordat jy aanmeld.',
  ],
  registrationEnabled: ['Allow public registration', 'Laat openbare registrasie toe'],
  registrationHelp: [
    'Let people create an account without an invitation. They verify their email and start with Reader access.',
    'Laat mense sonder ’n uitnodiging ’n rekening skep. Hulle verifieer hul e-pos en begin met Leser-toegang.',
  ],
  declineRegistration: ['Reject registration', 'Keur registrasie af'],
  declineRegistrationHelp: [
    'Reject this application? The applicant will remain unable to sign in and will receive the decision by email.',
    'Keur hierdie aansoek af? Die aansoeker sal nie kan aanmeld nie en sal die besluit per e-pos ontvang.',
  ],
  emailVerified: [
    'Your email is verified. If registration approval is required, wait for the decision email before signing in. If invited, follow the password setup email.',
    'Jou e-pos is geverifieer. Indien registrasiegoedkeuring vereis word, wag vir die besluit per e-pos voordat jy aanmeld. Indien uitgenooi, volg die wagwoordopstelling-e-pos.',
  ],
};
