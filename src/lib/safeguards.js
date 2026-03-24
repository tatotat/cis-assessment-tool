// All 153 CIS Controls v8.1 safeguards
export const SAFEGUARDS = [
  // Control 1: Inventory and Control of Enterprise Assets
  {
    id: '1.1', control: 1, title: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    assetClass: 'Devices', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Device Inventory',
    description: 'Keep an up-to-date list of every computer, phone, tablet, printer, and networked device your organization owns or uses.',
    whyItMatters: "You can't protect what you don't know you have. An unknown device on your network is a potential entry point for attackers."
  },
  {
    id: '1.2', control: 1, title: 'Address Unauthorized Assets',
    assetClass: 'Devices', nistFunction: 'Respond', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Handle Unknown Devices',
    description: 'When you find a device that should not be on your network, either remove it or investigate it right away.',
    whyItMatters: 'Rogue or unauthorized devices can be used by attackers to spy on your organization or steal data without detection.'
  },
  {
    id: '1.3', control: 1, title: 'Utilize an Active Discovery Tool',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Automated Device Scanner',
    description: 'Use software that automatically scans your network on a regular schedule to find all connected devices.',
    whyItMatters: 'Manual checks miss devices, especially ones that connect briefly. Automated scanning catches things humans overlook.'
  },
  {
    id: '1.4', control: 1, title: 'Use DHCP Logging to Update Enterprise Asset Inventory',
    assetClass: 'Devices', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Network Connection Logging',
    description: 'Record every device that connects to your network using your router or network equipment\'s built-in logging.',
    whyItMatters: 'This gives you an automatic record of who or what joined your network and when, making it easy to spot unfamiliar visitors.'
  },
  {
    id: '1.5', control: 1, title: 'Use a Passive Asset Discovery Tool',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Silent Network Monitoring',
    description: 'Use tools that silently watch network traffic to identify devices without actively probing them.',
    whyItMatters: 'Some devices do not respond to active scans. Passive monitoring catches everything on your network, including hidden or fragile systems.'
  },
  // Control 2: Inventory and Control of Software Assets
  {
    id: '2.1', control: 2, title: 'Establish and Maintain a Software Inventory',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Software Inventory',
    description: 'Keep a complete, up-to-date list of all software and applications installed across your organization.',
    whyItMatters: 'Unauthorized or outdated software is a major way attackers get in. You must know what is installed to manage security properly.'
  },
  {
    id: '2.2', control: 2, title: 'Ensure Authorized Software is Currently Supported',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Software Up To Date and Supported',
    description: 'Make sure all the software you use is still receiving security updates from the manufacturer.',
    whyItMatters: 'Software that is no longer supported does not receive security fixes, leaving known weaknesses permanently open to attackers.'
  },
  {
    id: '2.3', control: 2, title: 'Address Unauthorized Software',
    assetClass: 'Applications', nistFunction: 'Respond', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Remove Unauthorized Software',
    description: 'Any software found that has not been approved should be removed or blocked from running.',
    whyItMatters: 'Unapproved software can contain malware, create security holes, or give attackers a foothold in your systems.'
  },
  {
    id: '2.4', control: 2, title: 'Utilize Automated Software Inventory Tools',
    assetClass: 'Applications', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Automated Software Tracking',
    description: 'Use automated tools to continuously track what software is installed on every device in your organization.',
    whyItMatters: 'People install software all the time without telling IT. Automated tracking keeps your software list accurate without manual effort.'
  },
  {
    id: '2.5', control: 2, title: 'Allowlist Authorized Software',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Approved Software Only Policy',
    description: 'Configure devices so only pre-approved software is allowed to run, blocking everything else automatically.',
    whyItMatters: 'This is one of the most powerful defenses against malware — if only approved programs can run, malicious software simply cannot execute.'
  },
  {
    id: '2.6', control: 2, title: 'Allowlist Authorized Libraries',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Approved Code Libraries Only',
    description: 'Restrict which software libraries and plug-ins can be used by your applications to only those that have been approved.',
    whyItMatters: 'Attackers often exploit untrusted code libraries to run malicious code inside trusted applications. Controlling libraries closes this gap.'
  },
  {
    id: '2.7', control: 2, title: 'Allowlist Authorized Scripts',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Approved Scripts Only',
    description: 'Only allow pre-approved automation scripts to run on your systems, blocking all others.',
    whyItMatters: 'Attackers frequently use scripts to move through your systems, steal data, or install malware. Blocking unapproved scripts stops many attacks.'
  },
  // Control 3: Data Protection
  {
    id: '3.1', control: 3, title: 'Establish and Maintain a Data Management Process',
    assetClass: 'Data', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Data Handling Policy',
    description: 'Create and follow written rules about how your organization handles, stores, shares, and deletes sensitive information.',
    whyItMatters: 'Without clear policies, employees handle data inconsistently, increasing the risk of accidental leaks or mishandling of sensitive information.'
  },
  {
    id: '3.2', control: 3, title: 'Establish and Maintain a Data Inventory',
    assetClass: 'Data', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Data Inventory',
    description: 'Know what sensitive data your organization holds, where it is stored, who has access, and how it flows through your systems.',
    whyItMatters: "You can't protect data you don't know about. Attackers target the most valuable data — knowing where yours lives lets you protect it properly."
  },
  {
    id: '3.3', control: 3, title: 'Configure Data Access Control Lists',
    assetClass: 'Data', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Control Who Can Access Data',
    description: 'Set up permissions so only the right people can access sensitive files, folders, and systems — not everyone by default.',
    whyItMatters: 'If everyone can access everything, a stolen password or disgruntled employee can access all your data. Limiting access limits the damage.'
  },
  {
    id: '3.4', control: 3, title: 'Enforce Data Retention',
    assetClass: 'Data', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Data Retention Rules',
    description: 'Define how long different types of data should be kept and delete it when it is no longer needed.',
    whyItMatters: 'Keeping data longer than necessary increases the amount of information at risk. Old data you no longer need is still valuable to attackers.'
  },
  {
    id: '3.5', control: 3, title: 'Securely Dispose of Data',
    assetClass: 'Data', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Secure Data Deletion',
    description: 'When deleting sensitive data or disposing of old devices, make sure the data is truly gone and cannot be recovered.',
    whyItMatters: 'Simply deleting a file does not erase it. Attackers can recover data from discarded computers, hard drives, or even cloud storage if not properly wiped.'
  },
  {
    id: '3.6', control: 3, title: 'Encrypt Data on End-User Devices',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Encrypt Laptops and Phones',
    description: 'Turn on full-disk encryption on all laptops, phones, and tablets so that if a device is lost or stolen, the data cannot be read.',
    whyItMatters: 'Laptops and phones are lost or stolen regularly. Encryption means the thief gets a device with unreadable data, not your confidential information.'
  },
  {
    id: '3.7', control: 3, title: 'Establish and Maintain a Data Classification Scheme',
    assetClass: 'Data', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Label Your Data by Sensitivity',
    description: 'Create a simple system to label data based on how sensitive it is — for example: Public, Internal, Confidential, or Restricted.',
    whyItMatters: 'Without labels, employees do not know which data needs extra protection. Classification helps everyone handle sensitive information appropriately.'
  },
  {
    id: '3.8', control: 3, title: 'Document Data Flows',
    assetClass: 'Data', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Map How Data Moves',
    description: 'Create diagrams or documentation showing how sensitive data travels through your organization — where it enters, where it is processed, and where it ends up.',
    whyItMatters: 'Data can leak at any point it moves. Understanding the flow helps identify the weakest points where protection is most needed.'
  },
  {
    id: '3.9', control: 3, title: 'Encrypt Data on Removable Media',
    assetClass: 'Data', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Encrypt USB Drives and External Storage',
    description: 'Any USB drives, external hard drives, or other removable storage that holds sensitive data must be encrypted.',
    whyItMatters: 'USB drives are among the most commonly lost items. An unencrypted USB with company data is a breach waiting to happen.'
  },
  {
    id: '3.10', control: 3, title: 'Encrypt Sensitive Data in Transit',
    assetClass: 'Data', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Protect Data Being Sent Over the Network',
    description: 'Make sure that sensitive data is encrypted whenever it is sent over the internet or internal networks.',
    whyItMatters: 'Data sent without encryption can be intercepted and read by anyone on the same network. Encryption prevents eavesdropping on data in transit.'
  },
  {
    id: '3.11', control: 3, title: 'Encrypt Sensitive Data at Rest',
    assetClass: 'Data', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Encrypt Stored Sensitive Data',
    description: 'Sensitive data that is stored in databases, file servers, or cloud storage should be encrypted even when not being actively used.',
    whyItMatters: 'If attackers break into your systems and access stored data, encryption ensures they cannot read what they steal.'
  },
  {
    id: '3.12', control: 3, title: 'Segment Data Processing and Storage Based on Sensitivity',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Separate Sensitive Systems',
    description: 'Store and process your most sensitive data on separate systems or network segments, isolated from general-purpose systems.',
    whyItMatters: 'Putting everything on the same network means one breach exposes everything. Separation limits how far an attacker can go once inside.'
  },
  {
    id: '3.13', control: 3, title: 'Deploy a Data Loss Prevention Solution',
    assetClass: 'Data', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Prevent Data from Leaving Accidentally',
    description: 'Use software that monitors and blocks unauthorized transfers of sensitive data — such as sending confidential files to personal email.',
    whyItMatters: 'Most data breaches involve data leaving through email, uploads, or USB drives. Automated prevention tools catch these before damage is done.'
  },
  {
    id: '3.14', control: 3, title: 'Log Sensitive Data Access',
    assetClass: 'Data', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Track Who Accesses Sensitive Data',
    description: 'Keep records of who accessed sensitive data, when, and what they did with it.',
    whyItMatters: 'When a breach occurs, access logs are essential for investigation. They also deter insider threats — people behave better when they know their actions are recorded.'
  },
  // Control 4: Secure Configuration
  {
    id: '4.1', control: 4, title: 'Establish and Maintain a Secure Configuration Process',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Secure Setup Standards',
    description: 'Create standard, secure settings for all devices and software in your organization and apply them consistently.',
    whyItMatters: 'Default settings on most devices and software are not secure. Attackers specifically look for systems left with default or weak configurations.'
  },
  {
    id: '4.2', control: 4, title: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Secure Network Equipment Settings',
    description: 'Apply security-hardened settings to all routers, switches, firewalls, and other network equipment.',
    whyItMatters: 'Network equipment with default passwords or weak settings is extremely common and among the first things attackers try to exploit.'
  },
  {
    id: '4.3', control: 4, title: 'Configure Automatic Session Locking on Enterprise Assets',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Auto-Lock Screens When Idle',
    description: 'Set all computers and devices to automatically lock their screens after a few minutes of inactivity, requiring a password to unlock.',
    whyItMatters: 'An unlocked computer left unattended is an open door. Auto-locking prevents unauthorized access when someone steps away from their desk.'
  },
  {
    id: '4.4', control: 4, title: 'Implement and Manage a Firewall on Servers',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Server Firewall Protection',
    description: 'Enable and manage firewalls on all servers to control what network traffic is allowed to reach them.',
    whyItMatters: 'Servers without firewalls are exposed to attacks from anyone who can reach them on the network. Firewalls block unauthorized connection attempts.'
  },
  {
    id: '4.5', control: 4, title: 'Implement and Manage a Firewall on End-User Devices',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Device Firewall Protection',
    description: 'Enable and manage firewalls on all laptops and desktop computers, especially those used remotely.',
    whyItMatters: 'When employees work outside the office — at coffee shops or home — their devices face threats from other devices on the same network. Firewalls provide essential protection.'
  },
  {
    id: '4.6', control: 4, title: 'Securely Manage Enterprise Assets and Software',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Secure Remote Management',
    description: 'Use secure, encrypted tools and methods when managing your devices and software remotely.',
    whyItMatters: 'Using insecure methods to manage your systems can expose administrative credentials to attackers who monitor network traffic.'
  },
  {
    id: '4.7', control: 4, title: 'Manage Default Accounts on Enterprise Assets and Software',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Change or Disable Default Accounts',
    description: 'Find all default usernames and passwords that come pre-installed on devices and software and either change or disable them.',
    whyItMatters: 'Default credentials like "admin/admin" are publicly known and are among the first things attackers try. Leaving them unchanged is like leaving your door unlocked.'
  },
  {
    id: '4.8', control: 4, title: 'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Remove Unnecessary Features',
    description: 'Disable or uninstall any features, services, or programs on your devices that are not needed for business purposes.',
    whyItMatters: 'Every unnecessary service is a potential security vulnerability. Reducing what is running limits the ways attackers can get in.'
  },
  {
    id: '4.9', control: 4, title: 'Configure Trusted DNS Servers on Enterprise Assets',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Use Safe Internet Address Lookup Servers',
    description: 'Configure your devices to use DNS servers that are trusted and filtered, rather than the default internet ones.',
    whyItMatters: 'DNS is how your computer finds websites. Attackers can exploit insecure DNS to redirect users to fake sites or intercept communications.'
  },
  {
    id: '4.10', control: 4, title: 'Enforce Automatic Device Lockout on Portable End-User Devices',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Lock Phones After Failed Login Attempts',
    description: 'Set phones and tablets to lock out or wipe after too many failed password attempts.',
    whyItMatters: 'Without this protection, a stolen phone can be unlocked by simply guessing the PIN repeatedly. A lockout makes brute-force guessing impractical.'
  },
  {
    id: '4.11', control: 4, title: 'Enforce Remote Wipe Capability on Portable End-User Devices',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Remote Erase for Lost Devices',
    description: 'Make sure you have the ability to remotely erase all data from phones and laptops if they are lost or stolen.',
    whyItMatters: 'When a device goes missing, your last line of defense is the ability to erase it remotely before anyone can access the data on it.'
  },
  {
    id: '4.12', control: 4, title: 'Separate Enterprise Workspaces on Mobile End-User Devices',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Separate Work and Personal on Mobile Devices',
    description: 'On personal phones used for work, keep business data in a secure, separate area from personal apps and data.',
    whyItMatters: 'When employees use personal phones for work, a personal app with poor security can expose company data. Separation keeps the two worlds apart.'
  },
  // Control 5: Account Management
  {
    id: '5.1', control: 5, title: 'Establish and Maintain an Inventory of Accounts',
    assetClass: 'Users', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'User Account Inventory',
    description: 'Keep a complete list of all user accounts across your organization — who has an account, what systems they can access, and whether the account is still active.',
    whyItMatters: 'Forgotten accounts belonging to former employees are a major security risk. Someone may still be logging in with those credentials long after they have left.'
  },
  {
    id: '5.2', control: 5, title: 'Use Unique Passwords',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Unique Passwords for Every Account',
    description: 'Ensure every user account and system uses a different, strong password — never the same password reused across multiple accounts.',
    whyItMatters: 'If one service is breached and passwords are stolen, reused passwords give attackers access to all your other accounts instantly.'
  },
  {
    id: '5.3', control: 5, title: 'Disable Dormant Accounts',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Disable Inactive Accounts',
    description: 'Automatically disable or delete accounts that have not been used for a set period of time, such as 90 days.',
    whyItMatters: "Dormant accounts are often overlooked when updating security. Former employees' accounts or unused accounts are quiet backdoors into your systems."
  },
  {
    id: '5.4', control: 5, title: 'Restrict Administrator Privileges to Dedicated Administrator Accounts',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Separate Admin Accounts',
    description: 'IT staff should use a regular account for day-to-day work and a separate administrator account only when performing system administration tasks.',
    whyItMatters: 'If an administrator gets tricked by a phishing email while using their admin account, the attacker immediately gains the highest level of access to your systems.'
  },
  {
    id: '5.5', control: 5, title: 'Establish and Maintain an Inventory of Service Accounts',
    assetClass: 'Users', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Track System Accounts',
    description: 'Maintain a list of all accounts used by software and automated systems to communicate with each other, separate from human user accounts.',
    whyItMatters: 'Service accounts often have high privileges and are rarely reviewed. Attackers love finding neglected service accounts with excessive access.'
  },
  {
    id: '5.6', control: 5, title: 'Centralize Account Management',
    assetClass: 'Users', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Manage All Accounts in One Place',
    description: 'Use a central system to manage all user accounts, so you can add, change, or remove access across all systems from one place.',
    whyItMatters: 'Managing accounts scattered across many separate systems leads to mistakes and forgotten accounts. Centralization means nothing gets missed when employees leave.'
  },
  // Control 6: Access Control Management
  {
    id: '6.1', control: 6, title: 'Establish an Access Granting Process',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Formal Process for Giving Access',
    description: 'Create a documented, formal process for requesting and approving access to systems and data — not just emailing someone casually.',
    whyItMatters: 'Informal access-granting often results in people getting more access than they need, or access that is never properly removed when they change roles.'
  },
  {
    id: '6.2', control: 6, title: 'Establish an Access Revoking Process',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Formal Process for Removing Access',
    description: 'Create a process to promptly remove access when someone leaves the organization, changes roles, or no longer needs access to a system.',
    whyItMatters: 'Former employees who still have access are a significant threat. A formal revocation process ensures nothing is forgotten when someone departs.'
  },
  {
    id: '6.3', control: 6, title: 'Require MFA for Externally-Exposed Applications',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Two-Step Login for Public-Facing Apps',
    description: 'Require users to verify their identity with a second method (like a code sent to their phone) when logging into systems that are accessible from the internet.',
    whyItMatters: 'Passwords alone are not enough for internet-facing systems. Two-factor authentication stops attackers even if they have stolen a password.'
  },
  {
    id: '6.4', control: 6, title: 'Require MFA for Remote Network Access',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Two-Step Login for Remote Work',
    description: 'Require a second verification step when employees connect to company systems remotely, such as through a VPN.',
    whyItMatters: 'Remote access is one of the most common targets for attackers. Two-factor authentication is essential to protect remote connections.'
  },
  {
    id: '6.5', control: 6, title: 'Require MFA for Administrative Access',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Two-Step Login for Administrators',
    description: 'Anyone with administrative or elevated privileges must use two-factor authentication every time they log in.',
    whyItMatters: 'Admin accounts have the keys to the kingdom. If an admin account is compromised without MFA, attackers gain complete control of your systems.'
  },
  {
    id: '6.6', control: 6, title: 'Establish and Maintain an Inventory of Authentication and Authorization Systems',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'List All Login Systems',
    description: 'Maintain a list of all the systems that handle logins and access permissions in your organization.',
    whyItMatters: "Unknown or forgotten authentication systems can't be secured or monitored. Attackers look for neglected login systems as easy entry points."
  },
  {
    id: '6.7', control: 6, title: 'Centralize Access Control',
    assetClass: 'Users', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Single Sign-On and Centralized Permissions',
    description: 'Use a central system to manage who can access what, rather than managing access separately in each application.',
    whyItMatters: 'Decentralized access management leads to inconsistencies, forgotten permissions, and gaps that attackers exploit. Centralization provides a single point of control.'
  },
  {
    id: '6.8', control: 6, title: 'Define and Maintain Role-Based Access Control',
    assetClass: 'Users', nistFunction: 'Govern', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Job-Based Access Permissions',
    description: 'Define what each job role can access and automatically assign and remove permissions based on a person\'s current role.',
    whyItMatters: 'People often accumulate access rights over time as they change roles. Role-based access ensures everyone has exactly what they need for their current job — no more.'
  },
  // Control 7: Continuous Vulnerability Management
  {
    id: '7.1', control: 7, title: 'Establish and Maintain a Vulnerability Management Process',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Security Weakness Management Process',
    description: 'Have a documented, regular process for finding, tracking, and fixing security weaknesses in your systems and software.',
    whyItMatters: 'New security weaknesses are discovered constantly. Without a process to systematically find and fix them, your systems become increasingly vulnerable over time.'
  },
  {
    id: '7.2', control: 7, title: 'Establish and Maintain a Remediation Process',
    assetClass: 'Applications', nistFunction: 'Respond', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Fix Security Issues Promptly',
    description: 'Have a process that specifies how quickly different types of security problems must be fixed based on how serious they are.',
    whyItMatters: 'Finding vulnerabilities means nothing if they are not fixed quickly. Attackers can exploit known vulnerabilities within hours of their public disclosure.'
  },
  {
    id: '7.3', control: 7, title: 'Perform Automated Operating System Patch Management',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Automatic OS Updates',
    description: 'Enable automatic security updates for the operating systems on all your computers and devices.',
    whyItMatters: 'The majority of successful cyberattacks exploit vulnerabilities that had patches available but were not applied. Automatic updates close these windows of vulnerability.'
  },
  {
    id: '7.4', control: 7, title: 'Perform Automated Application Patch Management',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Applications Updated Automatically',
    description: 'Ensure all software applications — not just the operating system — are kept automatically updated with the latest security fixes.',
    whyItMatters: 'Applications like web browsers, PDF readers, and office software are frequently targeted. Outdated applications are common entry points for attackers.'
  },
  {
    id: '7.5', control: 7, title: 'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Scan Internal Systems for Weaknesses',
    description: 'Regularly run automated security scans on all internal systems to find known vulnerabilities before attackers do.',
    whyItMatters: 'Vulnerability scanning finds weaknesses in your systems that you might not know about. Finding them yourself gives you the chance to fix them before attackers exploit them.'
  },
  {
    id: '7.6', control: 7, title: 'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Scan External-Facing Systems for Weaknesses',
    description: 'Regularly scan any systems accessible from the internet to identify weaknesses that could be exploited by outside attackers.',
    whyItMatters: 'Internet-facing systems are under constant automated attack. Regular scanning lets you see what attackers see and fix issues before they are exploited.'
  },
  {
    id: '7.7', control: 7, title: 'Remediate Detected Vulnerabilities',
    assetClass: 'Applications', nistFunction: 'Respond', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Act on Discovered Weaknesses',
    description: 'When a vulnerability scan identifies a weakness, follow through with actually fixing it based on how serious it is.',
    whyItMatters: 'Scanning without fixing is worse than not scanning at all — it creates a record of known problems left unaddressed, which can increase liability and risk.'
  },
  // Control 8: Audit Log Management
  {
    id: '8.1', control: 8, title: 'Establish and Maintain an Audit Log Management Process',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Activity Log Policy',
    description: 'Create and follow a process for collecting, storing, reviewing, and protecting records of system activity.',
    whyItMatters: 'Without audit logs, you are blind. When something goes wrong, logs tell you what happened, when, and who was involved — essential for investigation and legal compliance.'
  },
  {
    id: '8.2', control: 8, title: 'Collect Audit Logs',
    assetClass: 'Network', nistFunction: 'Detect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Record System Activity',
    description: 'Turn on logging on all important systems so that user actions and system events are automatically recorded.',
    whyItMatters: 'Activity logs are your security camera footage. Without them, you have no way to know what happened during a breach or investigate suspicious activity.'
  },
  {
    id: '8.3', control: 8, title: 'Ensure Adequate Audit Log Storage',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Enough Space for Activity Records',
    description: 'Make sure you have enough storage to keep activity logs for the required amount of time without them being overwritten.',
    whyItMatters: "If logs are overwritten before you notice a breach, you lose critical evidence. Many breaches aren't discovered for months, so you need logs going back far enough."
  },
  {
    id: '8.4', control: 8, title: 'Standardize Time Synchronization',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Keep All Clocks in Sync',
    description: 'Make sure all computers and devices use the same time source so that activity logs from different systems can be accurately correlated.',
    whyItMatters: 'During an investigation, you need to piece together events across multiple systems. If clocks are out of sync, the sequence of events becomes unclear and investigations fail.'
  },
  {
    id: '8.5', control: 8, title: 'Collect Detailed Audit Logs',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Detailed Activity Records',
    description: 'Collect comprehensive, detailed logs that go beyond just basic events to include specifics about what was accessed, changed, or attempted.',
    whyItMatters: 'Basic logs tell you that something happened; detailed logs tell you exactly what. More detail means faster investigation and better evidence during incidents.'
  },
  {
    id: '8.6', control: 8, title: 'Collect DNS Query Audit Logs',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Log Website Lookup Requests',
    description: 'Record all the domain name lookups made on your network, showing which websites and services your devices are trying to reach.',
    whyItMatters: 'Malware communicates back to attacker-controlled servers. DNS logs reveal these hidden communications, helping detect malware infections early.'
  },
  {
    id: '8.7', control: 8, title: 'Collect URL Request Audit Logs',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Log Web Browsing Activity',
    description: 'Keep records of web addresses visited from your network, allowing you to identify visits to malicious or inappropriate sites.',
    whyItMatters: 'Web browsing is one of the most common ways malware enters an organization. Logging web activity lets you identify and investigate suspicious browsing.'
  },
  {
    id: '8.8', control: 8, title: 'Collect Command-Line Audit Logs',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Log Command-Line Activity',
    description: 'Record all commands typed directly into command prompts or terminals on your systems.',
    whyItMatters: 'Attackers and malware frequently use command-line tools to move through systems and steal data. These logs reveal attack activity that is invisible to other monitoring.'
  },
  {
    id: '8.9', control: 8, title: 'Centralize Audit Logs',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Central Activity Log Collection',
    description: 'Collect logs from all your systems into a single, secure central location for easier review and long-term storage.',
    whyItMatters: 'Attackers often delete logs on systems they compromise. Central logging preserves your evidence even if individual systems are attacked.'
  },
  {
    id: '8.10', control: 8, title: 'Retain Audit Logs',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Keep Logs Long Enough',
    description: 'Keep activity logs for at least 90 days, with at least 30 days of logs accessible immediately for investigation.',
    whyItMatters: 'Many breaches go undetected for months. Short log retention means the evidence is already gone by the time you realize something is wrong.'
  },
  {
    id: '8.11', control: 8, title: 'Conduct Audit Log Reviews',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Regularly Review Activity Logs',
    description: 'Review activity logs on a regular schedule to look for unusual activity, potential breaches, or policy violations.',
    whyItMatters: 'Logs are useless if no one reads them. Regular review is how you turn raw data into actionable security intelligence.'
  },
  {
    id: '8.12', control: 8, title: 'Collect Service Provider Logs',
    assetClass: 'Data', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Get Logs from Your Cloud Providers',
    description: 'Collect activity logs from your cloud providers and other third-party services, not just from systems you manage yourself.',
    whyItMatters: 'Breaches frequently involve cloud services. Without logs from those providers, you are blind to attacks happening in your cloud environment.'
  },
  // Control 9: Email and Web Browser Protections
  {
    id: '9.1', control: 9, title: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Use Updated Browsers and Email Apps',
    description: 'Make sure everyone in your organization is using up-to-date, supported web browsers and email applications that still receive security updates.',
    whyItMatters: 'Outdated browsers and email clients have known vulnerabilities that attackers actively exploit. Using supported versions ensures you have the latest security protections.'
  },
  {
    id: '9.2', control: 9, title: 'Use DNS Filtering Services',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Block Malicious Websites Automatically',
    description: 'Use a service that automatically blocks access to known malicious websites before employees even connect to them.',
    whyItMatters: 'Most malware requires connecting to a malicious website at some point. DNS filtering stops these connections at the network level, blocking attacks before they start.'
  },
  {
    id: '9.3', control: 9, title: 'Maintain and Enforce Network-Based URL Filters',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Website Category Filtering',
    description: 'Block access to categories of websites that pose security risks or have no business purpose, such as known phishing sites and malware distribution points.',
    whyItMatters: 'Limiting where employees can browse on the internet significantly reduces the chances of encountering malicious content or falling for phishing attacks.'
  },
  {
    id: '9.4', control: 9, title: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Control Browser Add-Ons',
    description: 'Only allow approved browser extensions and email plug-ins, and block unauthorized ones.',
    whyItMatters: 'Malicious browser extensions can steal passwords, monitor browsing, and inject malicious code. Controlling which extensions are allowed prevents this attack vector.'
  },
  {
    id: '9.5', control: 9, title: 'Implement DMARC',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Prevent Email Spoofing',
    description: 'Configure email authentication settings (DMARC) that prevent attackers from sending emails that appear to come from your organization\'s domain.',
    whyItMatters: 'Email spoofing is a key ingredient in phishing attacks. DMARC ensures that emails claiming to be from your domain are actually from you, not attackers impersonating your organization.'
  },
  {
    id: '9.6', control: 9, title: 'Block Unnecessary File Types',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Block Dangerous Email Attachments',
    description: 'Configure email systems to automatically block or quarantine file types that are commonly used to deliver malware, such as executable files.',
    whyItMatters: 'The vast majority of malware arrives as email attachments. Blocking dangerous file types stops malware delivery before it reaches employees\' inboxes.'
  },
  {
    id: '9.7', control: 9, title: 'Deploy and Maintain Email Server Anti-Malware Protections',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Email Malware Scanning',
    description: 'Run malware scanning on your email server to catch malicious attachments before they reach recipients.',
    whyItMatters: 'Scanning at the server level catches malware before it reaches user inboxes, providing an additional layer of protection beyond desktop antivirus.'
  },
  // Control 10: Malware Defenses
  {
    id: '10.1', control: 10, title: 'Deploy and Maintain Anti-Malware Software',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Antivirus and Antimalware Software',
    description: 'Install and maintain antivirus and anti-malware software on all computers and devices in your organization.',
    whyItMatters: 'Antivirus software is the basic line of defense against known malicious software. Without it, malware can operate freely once it reaches your systems.'
  },
  {
    id: '10.2', control: 10, title: 'Configure Automatic Anti-Malware Signature Updates',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Antivirus Updated Automatically',
    description: 'Make sure antivirus software automatically downloads the latest threat definitions so it can recognize new types of malware.',
    whyItMatters: 'Antivirus software without current definitions cannot detect new malware. Automatic updates ensure protection stays current against emerging threats.'
  },
  {
    id: '10.3', control: 10, title: 'Disable Autorun and Autoplay for Removable Media',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Prevent USB Auto-Run',
    description: 'Prevent computers from automatically running programs or opening files when a USB drive or other external media is inserted.',
    whyItMatters: 'Many malware infections spread via USB drives that automatically execute when plugged in. Disabling autorun prevents this classic attack vector.'
  },
  {
    id: '10.4', control: 10, title: 'Configure Automatic Anti-Malware Scanning of Removable Media',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Scan USB Drives on Insert',
    description: 'Automatically scan USB drives and other external storage devices for malware as soon as they are connected to any computer.',
    whyItMatters: 'USB drives are a common way to introduce malware, even accidentally from employee personal devices. Automatic scanning catches threats before they execute.'
  },
  {
    id: '10.5', control: 10, title: 'Enable Anti-Exploitation Features',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Enable Advanced Attack Blocking',
    description: 'Turn on advanced security features built into modern operating systems that prevent certain types of sophisticated attacks.',
    whyItMatters: 'Modern operating systems have built-in features that make many types of attacks much harder to execute. These are often disabled by default and need to be enabled.'
  },
  {
    id: '10.6', control: 10, title: 'Centrally Manage Anti-Malware Software',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Manage Antivirus from One Place',
    description: 'Control and monitor antivirus software across all devices from a central management console.',
    whyItMatters: 'Individual users often dismiss antivirus warnings or let protection lapse. Central management ensures protection stays consistent and alerts IT to issues automatically.'
  },
  {
    id: '10.7', control: 10, title: 'Use Behavior-Based Anti-Malware Software',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Detect Malware by Behavior',
    description: 'Use advanced security software that can detect malware based on suspicious behavior patterns, not just known malware signatures.',
    whyItMatters: 'Traditional antivirus misses brand-new malware. Behavior-based detection catches novel threats by recognizing what they do, not just what they look like.'
  },
  // Control 11: Data Recovery
  {
    id: '11.1', control: 11, title: 'Establish and Maintain a Data Recovery Process',
    assetClass: 'Data', nistFunction: 'Recover', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Data Recovery Plan',
    description: 'Create and maintain a written plan for how you will recover your data and get systems running again after a data loss event or cyberattack.',
    whyItMatters: 'Without a recovery plan, organizations scramble chaotically after an attack, dramatically increasing downtime and the chance of permanent data loss.'
  },
  {
    id: '11.2', control: 11, title: 'Perform Automated Backups',
    assetClass: 'Data', nistFunction: 'Recover', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Automatic Regular Backups',
    description: 'Automatically back up all important data on a regular schedule without relying on employees to remember to do it manually.',
    whyItMatters: 'Ransomware attacks lock all your files. Without recent backups, you face paying a ransom or losing everything. Regular automated backups make recovery possible.'
  },
  {
    id: '11.3', control: 11, title: 'Protect Recovery Data',
    assetClass: 'Data', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Protect Your Backups',
    description: 'Secure your backup copies so they cannot be accessed or destroyed by the same attack that hits your main systems.',
    whyItMatters: 'Modern ransomware specifically seeks out and encrypts backups. If your backups are connected to your main systems, they will also be lost in an attack.'
  },
  {
    id: '11.4', control: 11, title: 'Establish and Maintain an Isolated Instance of Recovery Data',
    assetClass: 'Data', nistFunction: 'Recover', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Backups Offline or Isolated',
    description: 'Keep at least one complete backup copy completely disconnected from your main network — either offline or in a separate location that cannot be reached over the network.',
    whyItMatters: 'An isolated backup is your ultimate insurance policy against ransomware and catastrophic events. Even if everything else fails, you can still recover from an isolated backup.'
  },
  {
    id: '11.5', control: 11, title: 'Test Data Recovery',
    assetClass: 'Data', nistFunction: 'Recover', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Regularly Test Your Backups',
    description: 'Regularly test your backup recovery process to verify that you can actually restore your data when needed.',
    whyItMatters: 'Many organizations discover their backups do not work only when they desperately need them. Regular testing confirms your safety net will hold when you fall.'
  },
  // Control 12: Network Infrastructure Management
  {
    id: '12.1', control: 12, title: 'Ensure Network Infrastructure is Up-to-Date',
    assetClass: 'Network', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Keep Network Equipment Updated',
    description: 'Make sure all routers, switches, firewalls, and other network equipment have current firmware and security patches applied.',
    whyItMatters: 'Outdated network equipment is full of known vulnerabilities. Attackers specifically target routers and firewalls because compromising them gives access to all network traffic.'
  },
  {
    id: '12.2', control: 12, title: 'Establish and Maintain a Secure Network Architecture',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Organize Your Network Securely',
    description: 'Design your network so that different types of systems and users are separated from each other based on their security needs.',
    whyItMatters: 'A flat network where everything can talk to everything means one compromised device can reach everything. Proper network segmentation contains breaches.'
  },
  {
    id: '12.3', control: 12, title: 'Securely Manage Network Infrastructure',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Secure Network Equipment Management',
    description: 'Access and manage your network equipment only through secure, encrypted connections and from designated secure locations.',
    whyItMatters: 'Managing network equipment over insecure connections exposes administrative credentials. A compromised network device gives attackers control over all network traffic.'
  },
  {
    id: '12.4', control: 12, title: 'Establish and Maintain Architecture Diagram(s)',
    assetClass: 'Network', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Network Maps and Diagrams',
    description: 'Maintain up-to-date diagrams showing how your network is organized, what connects to what, and where your security boundaries are.',
    whyItMatters: 'During a security incident, having accurate network diagrams is critical for understanding the scope of a breach and isolating affected systems quickly.'
  },
  {
    id: '12.5', control: 12, title: 'Centralize Network Authentication, Authorization, and Auditing (AAA)',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Centralized Network Access Control',
    description: 'Use a central system to control and track who can access network equipment and what they can do.',
    whyItMatters: 'Decentralized network access management creates gaps where unauthorized access goes undetected. Centralization provides visibility and consistent enforcement.'
  },
  {
    id: '12.6', control: 12, title: 'Use of Secure Network Management and Communication Protocols',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Use Encrypted Network Management Tools',
    description: 'Only use encrypted, secure protocols when communicating with and managing network equipment.',
    whyItMatters: 'Older management protocols send data in plain text, including passwords. Attackers who can see network traffic can capture these credentials and gain control of your network.'
  },
  {
    id: '12.7', control: 12, title: 'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise AAA Infrastructure',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'VPN Required for Remote Workers',
    description: 'Require all remote workers to connect through a company VPN before accessing internal resources.',
    whyItMatters: 'Unprotected remote connections expose internal systems to anyone on the same network as the employee, such as in a coffee shop or airport.'
  },
  {
    id: '12.8', control: 12, title: 'Establish and Maintain Dedicated Computing Resources for All Administrative Work',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Dedicated Computers for Admin Tasks',
    description: 'IT administrators should use dedicated, secured computers specifically for administrative tasks, not the same machine they use for general work and browsing.',
    whyItMatters: 'If an admin is tricked by malware while browsing the web on the same computer they use for admin tasks, attackers immediately inherit full administrative access.'
  },
  // Control 13: Network Monitoring and Defense
  {
    id: '13.1', control: 13, title: 'Centralize Security Event Alerting',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Central Security Alerting System',
    description: 'Collect security alerts from all your systems into a central location so security staff can see the full picture and respond quickly.',
    whyItMatters: 'Attacks span multiple systems. Seeing alerts from all systems together reveals attack patterns that are invisible when looking at each system individually.'
  },
  {
    id: '13.2', control: 13, title: 'Deploy a Host-Based Intrusion Detection Solution',
    assetClass: 'Devices', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Computer-Level Attack Detection',
    description: 'Install software on your servers and computers that monitors for signs of attack or compromise and raises alerts.',
    whyItMatters: 'Network monitoring alone misses attacks happening inside a device. Host-based detection catches attackers who have already gotten past perimeter defenses.'
  },
  {
    id: '13.3', control: 13, title: 'Deploy a Network Intrusion Detection Solution',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Network Attack Detection',
    description: 'Deploy systems that monitor network traffic for patterns that indicate an attack or compromise.',
    whyItMatters: 'Network intrusion detection spots attacks in progress, giving you the chance to stop a breach before significant damage occurs.'
  },
  {
    id: '13.4', control: 13, title: 'Perform Traffic Filtering Between Network Segments',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Filter Traffic Between Network Zones',
    description: 'Control and filter the network traffic that flows between different parts of your network to prevent unauthorized communication.',
    whyItMatters: 'Attackers who compromise one system typically try to move to others. Traffic filtering between network segments makes this lateral movement much harder.'
  },
  {
    id: '13.5', control: 13, title: 'Manage Access Control for Remote Assets',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Control Access for Remote Devices',
    description: 'Apply the same access restrictions to devices used remotely as to those used in the office.',
    whyItMatters: 'Remote devices often get less security oversight. Attackers specifically target remote workers as a way in since they may have weaker protections.'
  },
  {
    id: '13.6', control: 13, title: 'Collect Network Traffic Flow Logs',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Record Network Traffic Patterns',
    description: 'Collect records of what network connections were made, who made them, and when — without capturing the actual content.',
    whyItMatters: 'Network flow logs reveal communication patterns between systems, making it possible to spot unusual activity like data being exfiltrated or malware communicating with attackers.'
  },
  {
    id: '13.7', control: 13, title: 'Deploy a Host-Based Intrusion Prevention Solution',
    assetClass: 'Devices', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Computer-Level Attack Prevention',
    description: 'Install software on your devices that not only detects attacks but actively blocks them in real time.',
    whyItMatters: 'Detection tells you an attack is happening; prevention stops it. Host-based prevention provides automated, real-time defense against attacks targeting individual systems.'
  },
  {
    id: '13.8', control: 13, title: 'Deploy a Network Intrusion Prevention Solution',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Network Attack Prevention System',
    description: 'Deploy systems that automatically block network attacks as they are detected, rather than just alerting on them.',
    whyItMatters: 'A detection system without automated response relies on humans to react, which takes time. Prevention systems block attacks faster than any human can respond.'
  },
  {
    id: '13.9', control: 13, title: 'Deploy Port-Level Access Control',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Control Who Can Plug Into Your Network',
    description: 'Configure your network so that only authorized, known devices can connect to physical network ports.',
    whyItMatters: 'An attacker who gains physical access to your building could plug into your network. Port-level controls prevent unauthorized devices from connecting, even physically.'
  },
  {
    id: '13.10', control: 13, title: 'Perform Application Layer Filtering',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Deep Application Traffic Inspection',
    description: 'Use advanced firewalls that inspect the actual content of network traffic, not just where it is coming from and going to.',
    whyItMatters: 'Standard firewalls are fooled by attackers who hide malicious traffic inside normal-looking connections. Application-level inspection catches these disguised attacks.'
  },
  {
    id: '13.11', control: 13, title: 'Tune Security Event Alerting Thresholds',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Fine-Tune Security Alerts',
    description: 'Regularly adjust your security monitoring to reduce false alarms while ensuring real threats are still detected.',
    whyItMatters: 'Too many false alarms causes alert fatigue, where security staff start ignoring alerts — meaning real attacks get missed. Proper tuning keeps alerts meaningful.'
  },
  // Control 14: Security Awareness and Skills Training
  {
    id: '14.1', control: 14, title: 'Establish and Maintain a Security Awareness Program',
    assetClass: 'Enterprise', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Security Awareness Training Program',
    description: 'Run a formal, ongoing program to educate all employees about cybersecurity risks and how to avoid them.',
    whyItMatters: 'Humans are the most frequently exploited vulnerability in any organization. Regular training turns your staff from a liability into your first line of defense.'
  },
  {
    id: '14.2', control: 14, title: 'Train Workforce Members to Recognize Social Engineering Attacks',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff to Spot Scams',
    description: 'Teach all employees how to recognize phishing emails, phone scams, and other attempts to trick them into revealing information or taking harmful actions.',
    whyItMatters: 'Social engineering is the number one way organizations get breached. Training employees to recognize and report these attempts prevents the most common attack vector.'
  },
  {
    id: '14.3', control: 14, title: 'Train Workforce Members on Authentication Best Practices',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff on Password Security',
    description: 'Teach all employees about creating strong passwords, using password managers, and protecting their login credentials.',
    whyItMatters: 'Weak or reused passwords are one of the most common causes of breaches. Employees who understand good password hygiene reduce this risk significantly.'
  },
  {
    id: '14.4', control: 14, title: 'Train Workforce on Data Handling Best Practices',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff on Handling Sensitive Data',
    description: 'Teach employees how to properly handle, share, store, and dispose of sensitive information.',
    whyItMatters: 'Many data breaches are caused by well-intentioned employees who handle data incorrectly. Training on proper data handling prevents accidental exposure.'
  },
  {
    id: '14.5', control: 14, title: 'Train Workforce Members on Causes of Unintentional Data Exposure',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff to Avoid Accidental Data Leaks',
    description: 'Educate employees on how data can accidentally leak — such as sending to the wrong email address, using personal cloud storage for work files, or discussing sensitive matters in public.',
    whyItMatters: 'Many significant breaches are caused not by hackers but by employees accidentally sharing data in the wrong place or with the wrong person.'
  },
  {
    id: '14.6', control: 14, title: 'Train Workforce Members on Recognizing and Reporting Security Incidents',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff to Report Security Issues',
    description: 'Teach employees what signs of a security incident look like and how to report suspicious activity immediately.',
    whyItMatters: 'Early detection saves enormous amounts of time and money. Employees who know what to look for and feel safe reporting it are your best early warning system.'
  },
  {
    id: '14.7', control: 14, title: 'Train Workforce on How to Identify and Report Missing Security Updates',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff to Report Unpatched Software',
    description: 'Teach employees to notice when their software is prompting for updates and to report systems that cannot be updated.',
    whyItMatters: 'Employees who understand why updates matter and know how to report patching issues help keep all systems current, reducing vulnerability exposure across the organization.'
  },
  {
    id: '14.8', control: 14, title: 'Train Workforce on the Dangers of Connecting Over Insecure Networks',
    assetClass: 'Users', nistFunction: 'Protect', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Train Staff on Public Wi-Fi Risks',
    description: 'Educate employees about the risks of connecting to public or unprotected Wi-Fi networks and what precautions they must take.',
    whyItMatters: 'Public Wi-Fi is a prime hunting ground for attackers. Employees who understand this risk take proper precautions when working remotely, reducing exposure significantly.'
  },
  {
    id: '14.9', control: 14, title: 'Conduct Role-Specific Security Awareness and Skills Training',
    assetClass: 'Users', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Tailored Security Training by Job Role',
    description: 'Provide specialized security training tailored to the unique risks and responsibilities of different job roles, such as finance staff, developers, or executives.',
    whyItMatters: "General training doesn't address the specific risks each role faces. Targeted training is more effective and relevant, making employees more likely to apply what they learn."
  },
  // Control 15: Service Provider Management
  {
    id: '15.1', control: 15, title: 'Establish and Maintain an Inventory of Service Providers',
    assetClass: 'Enterprise', nistFunction: 'Identify', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'List All Your Vendors and Suppliers',
    description: 'Keep a complete list of all third-party companies that provide services, software, or access to your systems or data.',
    whyItMatters: 'Many major breaches happen through trusted vendors and suppliers. Knowing who has access to your systems and data is the first step to managing that risk.'
  },
  {
    id: '15.2', control: 15, title: 'Establish and Maintain a Service Provider Management Policy',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Vendor Security Policy',
    description: 'Create written policies that define how you evaluate, select, and manage third-party vendors from a security perspective.',
    whyItMatters: 'Without formal vendor policies, security requirements are applied inconsistently, allowing risky vendors to access your data and systems without proper scrutiny.'
  },
  {
    id: '15.3', control: 15, title: 'Classify Service Providers',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Rate Vendors by Risk Level',
    description: 'Assess and classify each vendor based on how sensitive the data they access is and how critical their service is to your operations.',
    whyItMatters: 'Not all vendors carry the same risk. A vendor with access to your financial records needs much more scrutiny than your office supply company. Classification ensures appropriate oversight.'
  },
  {
    id: '15.4', control: 15, title: 'Ensure Service Provider Contracts Include Security Requirements',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Security Requirements in Vendor Contracts',
    description: 'Make sure contracts with all vendors who handle your data or systems include specific security requirements they must meet.',
    whyItMatters: 'Vendors without contractual security requirements have no obligation to protect your data. Legal requirements are your leverage to enforce security standards.'
  },
  {
    id: '15.5', control: 15, title: 'Assess Service Providers',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Review Vendor Security Regularly',
    description: 'Regularly review and assess the security practices of your vendors, especially those with access to sensitive data or critical systems.',
    whyItMatters: "A vendor's security posture can change. Regular assessments ensure they maintain the security standards required to handle your data safely."
  },
  {
    id: '15.6', control: 15, title: 'Monitor Service Providers',
    assetClass: 'Data', nistFunction: 'Govern', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Ongoing Vendor Security Monitoring',
    description: 'Continuously monitor vendors for security incidents, breaches, or changes that might affect the security of your data.',
    whyItMatters: "Vendors have breaches too. Ongoing monitoring means you find out quickly when a vendor is compromised, allowing you to take protective action before your data is affected."
  },
  {
    id: '15.7', control: 15, title: 'Securely Decommission Service Providers',
    assetClass: 'Data', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Safely End Vendor Relationships',
    description: 'When ending a relationship with a vendor, ensure all access is revoked and all your data is securely deleted from their systems.',
    whyItMatters: "Former vendors who retain your data or system access are an ongoing risk. Proper offboarding ensures they can no longer access your information after the relationship ends."
  },
  // Control 16: Application Software Security
  {
    id: '16.1', control: 16, title: 'Establish and Maintain a Secure Application Development Process',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Secure Software Development Process',
    description: 'Build security into your software development process so that security is considered at every stage, not just at the end.',
    whyItMatters: 'Applications with security built in from the start have far fewer vulnerabilities than those secured as an afterthought. Prevention is far cheaper than remediation.'
  },
  {
    id: '16.2', control: 16, title: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Software Security Bug Reporting Process',
    description: 'Have a process for receiving, tracking, and responding to reports of security vulnerabilities found in your software.',
    whyItMatters: 'Security researchers and users find vulnerabilities in software. A clear process for reporting and fixing them ensures nothing slips through the cracks.'
  },
  {
    id: '16.3', control: 16, title: 'Perform Root Cause Analysis on Security Vulnerabilities',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Find the Root Cause of Security Bugs',
    description: 'When a security vulnerability is found in your software, investigate why it occurred so you can prevent similar issues in the future.',
    whyItMatters: 'Fixing a bug without understanding why it happened means the same type of bug will appear again. Root cause analysis breaks the cycle of recurring vulnerabilities.'
  },
  {
    id: '16.4', control: 16, title: 'Establish and Manage an Inventory of Third-Party Software Components',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Track Open Source and Third-Party Code',
    description: 'Keep a list of all third-party code, libraries, and components used in your applications so you can track when they have vulnerabilities.',
    whyItMatters: 'Most modern software uses third-party components. When a vulnerability is found in one (like Log4Shell), you need to know immediately if you are affected.'
  },
  {
    id: '16.5', control: 16, title: 'Use Up-to-Date and Trusted Third-Party Software Components',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Keep Third-Party Code Updated',
    description: 'Ensure all third-party libraries and components used in your applications are current, supported, and from reputable sources.',
    whyItMatters: 'Outdated third-party components are among the most common sources of application vulnerabilities. Keeping them current closes security holes as they are discovered.'
  },
  {
    id: '16.6', control: 16, title: 'Establish and Maintain a Severity Rating System for Application Vulnerabilities',
    assetClass: 'Applications', nistFunction: 'Govern', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Rate Severity of Software Security Issues',
    description: 'Use a consistent system to rate how serious each software vulnerability is so teams can prioritize which issues to fix first.',
    whyItMatters: 'Without a consistent severity rating, teams may spend time on low-priority issues while critical vulnerabilities wait. Rating ensures the most dangerous issues get fixed first.'
  },
  {
    id: '16.7', control: 16, title: 'Use Standard Hardening Configuration Templates for Application Infrastructure',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Standard Secure Setup for Applications',
    description: 'Use approved, security-hardened configuration templates when setting up web servers, databases, and application infrastructure.',
    whyItMatters: 'Insecure default configurations are a leading cause of application breaches. Standard hardened templates ensure every deployment starts from a secure baseline.'
  },
  {
    id: '16.8', control: 16, title: 'Separate Production and Non-Production Systems',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Separate Test from Live Systems',
    description: 'Keep your live business systems completely separate from development and test environments.',
    whyItMatters: 'Testing and development environments often have weaker security. If they are connected to live systems, a breach in development can cascade into production.'
  },
  {
    id: '16.9', control: 16, title: 'Train Developers in Application Security Concepts and Secure Coding',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Security Training for Developers',
    description: 'Provide specific security training to developers so they understand how to write code that is resistant to common attacks.',
    whyItMatters: 'Developers who do not understand security write insecure code. Security-aware developers build protection in from the start, reducing vulnerabilities dramatically.'
  },
  {
    id: '16.10', control: 16, title: 'Apply Secure Design Principles in Application Architectures',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Build Security Into Application Design',
    description: 'Apply established security design principles when architecting new applications, such as least privilege access and defense in depth.',
    whyItMatters: 'Security is much harder and more expensive to add to an application after it is built. Applying security principles in the design phase prevents structural weaknesses.'
  },
  {
    id: '16.11', control: 16, title: 'Leverage Vetted Modules or Services for Application Security Components',
    assetClass: 'Applications', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Use Proven Security Building Blocks',
    description: 'Use well-established, tested security components for things like authentication and encryption rather than building your own from scratch.',
    whyItMatters: 'Building custom security components introduces new vulnerabilities. Using proven, widely tested security libraries is far safer and more reliable.'
  },
  {
    id: '16.12', control: 16, title: 'Implement Code-Level Security Checks',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Automated Security Code Scanning',
    description: 'Automatically scan your application code for security vulnerabilities as part of the development and deployment process.',
    whyItMatters: 'Automated scanning finds security issues before code is deployed. Catching vulnerabilities before release is far less costly than fixing them after an attack.'
  },
  {
    id: '16.13', control: 16, title: 'Conduct Application Penetration Testing',
    assetClass: 'Applications', nistFunction: 'Govern', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Hire Experts to Hack Your Own Apps',
    description: 'Regularly hire security professionals to try to find and exploit vulnerabilities in your applications before real attackers do.',
    whyItMatters: 'Penetration testing reveals real-world vulnerabilities that automated tools miss. It gives you an attacker\'s perspective on your own applications.'
  },
  {
    id: '16.14', control: 16, title: 'Conduct Threat Modeling',
    assetClass: 'Applications', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Identify Application Threats During Design',
    description: 'Systematically analyze your applications during the design phase to identify potential security threats and build in appropriate defenses.',
    whyItMatters: 'Thinking like an attacker during design reveals security gaps before they become real vulnerabilities. Addressing threats in design is far less costly than fixing them later.'
  },
  // Control 17: Incident Response Management
  {
    id: '17.1', control: 17, title: 'Designate Personnel to Manage Incident Handling',
    assetClass: 'Enterprise', nistFunction: 'Respond', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Assign Security Incident Responders',
    description: 'Identify specific people who are responsible for managing the response when a security incident occurs.',
    whyItMatters: 'During a crisis, confusion about who is responsible causes costly delays. Pre-designating responders ensures someone is always ready to take charge when an incident occurs.'
  },
  {
    id: '17.2', control: 17, title: 'Establish and Maintain Contact Information for Reporting Security Incidents',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Post Security Contact Information',
    description: 'Make sure all employees know who to contact and how when they suspect a security incident has occurred.',
    whyItMatters: 'If employees do not know how to report incidents, they either do not report them or waste critical time figuring out who to call. Clear, accessible contacts speed response.'
  },
  {
    id: '17.3', control: 17, title: 'Establish and Maintain an Enterprise Process for Reporting Incidents',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: true, ig2: true, ig3: true,
    friendlyTitle: 'Incident Reporting Process',
    description: 'Create and communicate a clear, simple process for how employees should report suspected security incidents.',
    whyItMatters: 'A documented reporting process ensures incidents are reported consistently with the right information, enabling faster and more effective responses.'
  },
  {
    id: '17.4', control: 17, title: 'Establish and Maintain an Incident Response Process',
    assetClass: 'Enterprise', nistFunction: 'Govern', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Security Incident Response Playbook',
    description: 'Create detailed, written procedures for how to respond to different types of security incidents, covering who does what and in what order.',
    whyItMatters: 'During a stressful incident, people make mistakes without clear guidance. A response playbook keeps the team coordinated and ensures critical steps are not missed.'
  },
  {
    id: '17.5', control: 17, title: 'Assign Key Roles and Responsibilities',
    assetClass: 'Enterprise', nistFunction: 'Respond', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Define Incident Response Team Roles',
    description: 'Clearly define who is responsible for each aspect of incident response — technical investigation, communications, legal, management — before an incident happens.',
    whyItMatters: 'Incidents require coordination across multiple teams. Unclear roles lead to duplication of effort, gaps in response, and slower recovery.'
  },
  {
    id: '17.6', control: 17, title: 'Define Mechanisms for Communicating During Incident Response',
    assetClass: 'Enterprise', nistFunction: 'Respond', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Incident Communication Plan',
    description: 'Pre-define how your response team will communicate during an incident, including backup channels in case primary systems are compromised.',
    whyItMatters: 'If attackers compromise your email or messaging systems during an incident, your response team needs alternative ways to coordinate. Planning ahead prevents communication blackouts.'
  },
  {
    id: '17.7', control: 17, title: 'Conduct Routine Incident Response Exercises',
    assetClass: 'Enterprise', nistFunction: 'Recover', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Practice Incident Response Regularly',
    description: 'Run regular tabletop exercises or simulations where your team practices responding to security incidents.',
    whyItMatters: 'Teams that practice incident response perform dramatically better when real incidents occur. Exercises reveal gaps in your plans before a real crisis exposes them.'
  },
  {
    id: '17.8', control: 17, title: 'Conduct Post-Incident Reviews',
    assetClass: 'Enterprise', nistFunction: 'Recover', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Learn From Security Incidents',
    description: 'After every security incident, conduct a review to identify what went wrong, what worked well, and how to improve.',
    whyItMatters: 'Every incident is a learning opportunity. Organizations that conduct post-incident reviews become more resilient over time; those that do not repeat the same mistakes.'
  },
  {
    id: '17.9', control: 17, title: 'Establish and Maintain Security Incident Thresholds',
    assetClass: 'Enterprise', nistFunction: 'Recover', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Define When to Escalate an Incident',
    description: 'Create clear criteria for when a security event is considered a minor issue versus a major incident requiring escalation and external notification.',
    whyItMatters: 'Without clear thresholds, teams either over-react to minor events or under-react to serious ones. Clear escalation criteria drive appropriate, proportional responses.'
  },
  // Control 18: Penetration Testing
  {
    id: '18.1', control: 18, title: 'Establish and Maintain a Penetration Testing Program',
    assetClass: 'Enterprise', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Regular Security Testing Program',
    description: 'Create a formal, ongoing program for regularly testing your security by having experts attempt to break into your systems.',
    whyItMatters: 'You cannot trust that your defenses are working without testing them. Regular penetration testing reveals real weaknesses that theory and automated scans miss.'
  },
  {
    id: '18.2', control: 18, title: 'Perform Periodic External Penetration Tests',
    assetClass: 'Network', nistFunction: 'Identify', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'External Security Testing',
    description: 'Regularly hire external security experts to try to break into your systems from the outside, just as a real attacker would.',
    whyItMatters: 'External testers bring a fresh, unbiased perspective and see your systems the same way an outside attacker does. They find things that internal teams miss.'
  },
  {
    id: '18.3', control: 18, title: 'Remediate Penetration Test Findings',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: true, ig3: true,
    friendlyTitle: 'Fix Issues Found by Security Tests',
    description: 'When security testing reveals vulnerabilities, fix them promptly based on their severity.',
    whyItMatters: 'Conducting penetration tests without fixing the findings is a wasted investment. Unaddressed findings are documented vulnerabilities waiting to be exploited.'
  },
  {
    id: '18.4', control: 18, title: 'Validate Security Measures',
    assetClass: 'Network', nistFunction: 'Protect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Confirm Security Controls Are Working',
    description: 'Regularly verify that your security controls are actually working as intended, not just that they are in place.',
    whyItMatters: "A security control that is deployed but not working provides false confidence. Validation ensures your defenses are actually effective, not just theoretical."
  },
  {
    id: '18.5', control: 18, title: 'Perform Periodic Internal Penetration Tests',
    assetClass: 'Network', nistFunction: 'Detect', ig1: false, ig2: false, ig3: true,
    friendlyTitle: 'Internal Security Testing',
    description: 'Regularly test how far an attacker could get inside your network if they compromised one device or account.',
    whyItMatters: 'Attackers who get past your perimeter defenses often have free reign inside. Internal testing reveals lateral movement risks and helps you limit the blast radius of a breach.'
  },
];

export const CONTROL_NAMES = {
  1: 'Inventory and Control of Enterprise Assets',
  2: 'Inventory and Control of Software Assets',
  3: 'Data Protection',
  4: 'Secure Configuration of Enterprise Assets and Software',
  5: 'Account Management',
  6: 'Access Control Management',
  7: 'Continuous Vulnerability Management',
  8: 'Audit Log Management',
  9: 'Email and Web Browser Protections',
  10: 'Malware Defenses',
  11: 'Data Recovery',
  12: 'Network Infrastructure Management',
  13: 'Network Monitoring and Defense',
  14: 'Security Awareness and Skills Training',
  15: 'Service Provider Management',
  16: 'Application Software Security',
  17: 'Incident Response Management',
  18: 'Penetration Testing',
};

export const VCDB_INDEX = {
  Enterprise: 3,
  Users: 3,
  Data: 3,
  Applications: 2,
  Devices: 1,
  Network: 1,
};

// Lookup table: [vcdb_index][maturity_score-1] = expectancy_score
export const VCDB_EXPECTANCY_LOOKUP = {
  1: [2, 2, 1, 1, 1],  // Devices, Network
  2: [3, 2, 2, 1, 1],  // Applications
  3: [3, 3, 2, 2, 1],  // Enterprise, Users, Data
};

export function getSafeguardsForIG(igLevel) {
  return SAFEGUARDS.filter(s => {
    if (igLevel === 1) return s.ig1;
    if (igLevel === 2) return s.ig2;
    if (igLevel === 3) return s.ig3;
    return false;
  });
}
