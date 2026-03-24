// Actionable recommendations for all 153 CIS Controls v8.1 safeguards
// Each entry has: immediate (high risk), shortTerm (unacceptable), longTerm (best practice)

export const SAFEGUARD_RECOMMENDATIONS = {
  '1.1': {
    immediate: 'Conduct an emergency scan of your network right now using a free tool like Advanced IP Scanner or Angry IP Scanner to identify all connected devices. Document every device found.',
    shortTerm: 'Implement a formal asset tracking system — even a shared spreadsheet works for small organizations. Record device type, owner, purpose, location, and last-seen date for every device.',
    longTerm: 'Use automated network discovery tools (such as Lansweeper or built-in IT management tools) that continuously monitor for new devices and alert you when unknown equipment appears on your network.',
  },
  '1.2': {
    immediate: 'Immediately disconnect any unrecognized devices from your network. If you cannot identify a device, physically unplug it or block it at the network level until it is investigated.',
    shortTerm: 'Create a written policy for handling unauthorized devices, including who to contact and how quickly devices must be investigated or removed. Train IT staff on this process.',
    longTerm: 'Implement automated network access control (NAC) that prevents unregistered devices from connecting at all, or quarantines them automatically for review.',
  },
  '1.3': {
    immediate: 'Download and run a free network scanner (Nmap, Advanced IP Scanner, or Fing) on your network right now to get a current picture of everything connected.',
    shortTerm: 'Schedule automatic weekly network scans using your scanner of choice. Review results each week and investigate any unfamiliar devices.',
    longTerm: 'Deploy an enterprise-grade active discovery tool (Qualys, Rapid7, or Tenable) that runs continuously and integrates with your asset inventory system.',
  },
  '1.4': {
    immediate: 'Enable DHCP logging on your router or DHCP server today. Most routers have this built in — check your router admin page under logs or DHCP settings.',
    shortTerm: 'Export and review DHCP logs weekly to identify new or unexpected devices. Cross-reference against your known device list.',
    longTerm: 'Integrate DHCP logs with your asset management system so new devices are automatically flagged for review when they first connect.',
  },
  '1.5': {
    immediate: 'If you do not have passive monitoring tools, prioritize implementing active scanning (1.3) first as an interim measure.',
    shortTerm: 'Evaluate passive discovery tools such as Darktrace, ExtraHop, or Zeek that monitor network traffic without actively probing devices.',
    longTerm: 'Deploy a passive asset discovery solution as a complement to active scanning. Passive tools catch devices that do not respond to active scans, such as printers and IoT devices.',
  },
  '2.1': {
    immediate: 'Run a software inventory scan using a free tool like Belarc Advisor or your operating system\'s built-in tools (Add/Remove Programs on Windows, or the Applications folder on macOS) across all devices today.',
    shortTerm: 'Create a software inventory spreadsheet or use a free tool like PDQ Inventory or Spiceworks. Record software name, version, and which devices it is installed on.',
    longTerm: 'Deploy an automated software inventory tool that continuously monitors all devices and alerts you when new software is installed without authorization.',
  },
  '2.2': {
    immediate: 'Check your software inventory immediately for any applications that have reached end-of-life or are no longer receiving updates. Create a list of affected software to address immediately.',
    shortTerm: 'Establish a process to check vendor support status for all software quarterly. Plan upgrades or replacements for any software nearing end-of-support dates.',
    longTerm: 'Subscribe to vendor security mailing lists and automate checks against known end-of-life databases to be notified proactively when software support is ending.',
  },
  '2.3': {
    immediate: 'Identify and immediately uninstall any software that was not approved by IT — especially remote access tools, peer-to-peer applications, or personal cloud storage apps.',
    shortTerm: 'Create an approved software list and communicate it to all employees. Establish a request process for new software and document consequences for installing unauthorized software.',
    longTerm: 'Implement technical controls that prevent unauthorized software installation entirely, using Group Policy, MDM, or endpoint management tools.',
  },
  '2.4': {
    immediate: 'Deploy a free endpoint management tool like PDQ Inventory or Spiceworks to automate software discovery across all your devices.',
    shortTerm: 'Configure automated software inventory collection to run weekly and generate reports of all installed software across your organization.',
    longTerm: 'Integrate automated software inventory with your change management process so every software change is tracked and authorized.',
  },
  '2.5': {
    immediate: 'Enable Windows Applocker or equivalent controls on your highest-risk systems first — especially servers and systems that handle sensitive data.',
    shortTerm: 'Define your approved software list and create allow-list policies that block unapproved software from running across all workstations.',
    longTerm: 'Maintain and regularly update your software allow-list as an ongoing process, with a formal approval workflow for new software additions.',
  },
  '2.6': {
    immediate: 'Audit the third-party libraries used in any internally developed applications or scripts. Flag any that are outdated or from untrusted sources.',
    shortTerm: 'Create a policy requiring all developers to use only approved, vetted code libraries. Implement a review process for approving new libraries.',
    longTerm: 'Use software composition analysis (SCA) tools to automatically monitor all code dependencies and alert when vulnerabilities are discovered in libraries you use.',
  },
  '2.7': {
    immediate: 'Audit all scripts running in your environment — PowerShell scripts, batch files, scheduled tasks, and login scripts. Remove or disable any that cannot be attributed to authorized purposes.',
    shortTerm: 'Enable PowerShell script logging and create a registry of all authorized scripts. Require scripts to be reviewed and approved before deployment.',
    longTerm: 'Implement script execution controls such as PowerShell Constrained Language Mode and script signing requirements so only signed, approved scripts can run.',
  },
  '3.1': {
    immediate: 'Document your current data handling practices in a simple one-page policy. Even a basic document is better than nothing — focus on who can access what data and how it should be shared.',
    shortTerm: 'Develop a comprehensive data management policy covering data classification, handling, sharing, retention, and disposal. Get leadership approval and communicate it to all employees.',
    longTerm: 'Implement a data governance program with regular reviews, employee training, and compliance audits to ensure policies are followed consistently.',
  },
  '3.2': {
    immediate: 'Start a data inventory immediately — create a spreadsheet listing every place your organization stores sensitive data: servers, cloud storage, email, laptops, USB drives, and paper records.',
    shortTerm: 'Complete a full data inventory and classify data by sensitivity. Identify the owner of each data store and document who has access.',
    longTerm: 'Use data discovery and classification tools to automatically scan your environment for sensitive data and keep your inventory current.',
  },
  '3.3': {
    immediate: 'Audit file share permissions today. Remove access for any user or group that does not have a clear business need. Apply the principle of least privilege: people get only the access they need.',
    shortTerm: 'Review and update all data access permissions across your systems. Implement a formal access request and approval process.',
    longTerm: 'Implement automated access reviews that periodically re-verify that each user\'s access is still appropriate for their current role.',
  },
  '3.4': {
    immediate: 'Identify data you are keeping that is no longer needed and schedule it for secure deletion. Focus first on data that carries regulatory risk, such as old customer payment records.',
    shortTerm: 'Define data retention schedules for each data type based on business and legal requirements. Communicate these schedules to all departments.',
    longTerm: 'Implement automated data retention policies in your storage systems and email platforms that enforce retention and deletion schedules without manual effort.',
  },
  '3.5': {
    immediate: 'Before disposing of any computers, hard drives, or USB drives, use a secure deletion tool like DBAN or Eraser to wipe the data. Never just format a drive — formatting does not erase data.',
    shortTerm: 'Create a secure data disposal procedure for all media types. Use a certified data destruction vendor for hard drives containing highly sensitive data.',
    longTerm: 'Implement a formal media sanitization program with documentation of all disposals, and periodically audit compliance with the procedure.',
  },
  '3.6': {
    immediate: 'Enable BitLocker (Windows) or FileVault (Mac) encryption on all laptops immediately. For phones, ensure device encryption is enabled in your MDM settings.',
    shortTerm: 'Audit all portable devices to confirm encryption is enabled. Create a policy requiring encryption on all devices that leave the office.',
    longTerm: 'Use Mobile Device Management (MDM) to enforce and verify encryption on all endpoint devices automatically, with alerts when devices fail compliance checks.',
  },
  '3.7': {
    immediate: 'Define at least three data classification levels today: Public, Internal, and Confidential. Apply these labels to your most sensitive data stores immediately.',
    shortTerm: 'Document a formal data classification scheme with clear definitions and examples for each level. Train all employees on how to classify the data they work with.',
    longTerm: 'Implement data labeling tools that help users classify data as they create it, and use automated classification to find and label existing unclassified data.',
  },
  '3.8': {
    immediate: 'Create a simple diagram showing where your most sensitive data lives and the main ways it moves — to email, to cloud storage, to partners. Even a hand-drawn diagram is a start.',
    shortTerm: 'Complete a formal data flow mapping exercise for all sensitive data types. Document every system, process, and third party that touches sensitive data.',
    longTerm: 'Keep data flow diagrams current by making updates part of your change management process whenever new systems or processes are introduced.',
  },
  '3.9': {
    immediate: 'Create an inventory of all USB drives and external hard drives used in your organization. Collect and disable any personal USB drives used for work data.',
    shortTerm: 'Encrypt all USB drives used for business purposes using BitLocker To Go or VeraCrypt. Consider purchasing encrypted USB drives for any sensitive data transfer.',
    longTerm: 'Use endpoint controls to block unencrypted removable media from connecting to your systems, and only allow approved encrypted devices.',
  },
  '3.10': {
    immediate: 'Verify that all web-based services your organization uses (email, file sharing, cloud applications) use HTTPS. Look for the padlock icon — never enter sensitive data on non-HTTPS sites.',
    shortTerm: 'Audit all internal applications and communication systems to ensure they use encrypted protocols (TLS) for all data transmission. Disable or replace any that do not.',
    longTerm: 'Implement a policy requiring encryption in transit for all sensitive data. Use tools to monitor and enforce TLS usage across your network.',
  },
  '3.11': {
    immediate: 'Enable encryption for your most sensitive databases and data stores. Most modern database platforms have built-in encryption that just needs to be enabled.',
    shortTerm: 'Develop an encryption standard for all sensitive data at rest and implement it across all storage systems that contain sensitive information.',
    longTerm: 'Implement enterprise key management to securely manage encryption keys, and regularly audit that encryption is applied consistently across all sensitive data stores.',
  },
  '3.12': {
    immediate: 'Identify your most sensitive systems and ensure they are on a separate network segment or VLAN from general office systems. Contact your IT provider to help implement this if needed.',
    shortTerm: 'Design and implement network segmentation that isolates systems based on the sensitivity of the data they handle.',
    longTerm: 'Implement micro-segmentation and zero-trust network architecture to ensure sensitive systems are isolated and access is granted only where explicitly needed.',
  },
  '3.13': {
    immediate: 'Review what data loss prevention capabilities are available in your existing email and cloud platforms — Microsoft 365 and Google Workspace both have built-in DLP features. Enable basic DLP policies.',
    shortTerm: 'Configure DLP policies to detect and alert on or block the transmission of sensitive data types (social security numbers, credit card numbers, health records) through email and cloud storage.',
    longTerm: 'Deploy a dedicated DLP solution that covers all data channels — email, web, cloud storage, and endpoint — with consistent policies and centralized management.',
  },
  '3.14': {
    immediate: 'Enable audit logging for access to your most sensitive data stores and databases today. Review recent access logs for any anomalies.',
    shortTerm: 'Configure comprehensive access logging for all systems containing sensitive data. Establish a process for regular log review.',
    longTerm: 'Implement a SIEM (Security Information and Event Management) system that automatically analyzes access logs and alerts on unusual access patterns.',
  },
  '4.1': {
    immediate: 'Download the CIS Benchmarks for your operating systems (available free at cisecurity.org) and compare your current configuration to the recommended settings. Address any critical gaps immediately.',
    shortTerm: 'Create a secure configuration baseline document for each type of system in your environment and apply it to all existing systems.',
    longTerm: 'Implement configuration management tools that enforce secure configurations continuously and alert you when systems drift from your approved baseline.',
  },
  '4.2': {
    immediate: 'Change all default passwords on your routers, switches, and firewalls immediately. Disable remote management interfaces that are not needed.',
    shortTerm: 'Apply the CIS Benchmark configuration for your network equipment models. Document your network equipment configuration standards.',
    longTerm: 'Use automated configuration management and compliance checking for all network infrastructure to detect and alert on configuration changes.',
  },
  '4.3': {
    immediate: 'Configure all computers to lock automatically after 5-10 minutes of inactivity. This setting can usually be found in your computer\'s security or screen saver settings.',
    shortTerm: 'Use Group Policy (Windows) or MDM policies to enforce screen lock settings consistently across all devices in your organization.',
    longTerm: 'Monitor compliance with screen lock policies and establish a process to address devices that are not configured correctly.',
  },
  '4.4': {
    immediate: 'Verify that the built-in firewall (Windows Firewall, iptables, or pf on Mac/Linux) is enabled on all your servers. If it is disabled, enable it immediately.',
    shortTerm: 'Review and harden firewall rules on all servers to allow only the specific traffic needed for their business function. Remove any permissive "allow all" rules.',
    longTerm: 'Implement a centralized firewall management system and conduct quarterly reviews of all server firewall rules to ensure they remain appropriate.',
  },
  '4.5': {
    immediate: 'Verify that the built-in firewall is enabled on all laptops and desktops. Push a Group Policy or MDM setting to enforce this across all devices if needed.',
    shortTerm: 'Configure host-based firewalls with rules appropriate for endpoint devices. Test that firewalls remain enabled even when connected to external networks.',
    longTerm: 'Use endpoint management tools to continuously monitor and enforce firewall settings, with alerts when firewalls are disabled on any device.',
  },
  '4.6': {
    immediate: 'Ensure all remote management tools (RDP, SSH, management consoles) require authentication and are only accessible over encrypted connections. Disable any unencrypted management protocols.',
    shortTerm: 'Create a policy for secure asset management specifying approved tools and protocols. Ensure all IT staff follow this policy.',
    longTerm: 'Implement a privileged access management (PAM) solution to control and audit all administrative access to systems.',
  },
  '4.7': {
    immediate: 'Run a scan of all devices to find any using default credentials. Change all default usernames and passwords immediately — especially on routers, printers, cameras, and network equipment.',
    shortTerm: 'Create a register of all default accounts that exist across your systems. Disable accounts that are not needed and change passwords for all that remain.',
    longTerm: 'Implement automated tools that scan for default credentials regularly and alert when default or weak passwords are detected.',
  },
  '4.8': {
    immediate: 'On your most critical servers, run a services audit and disable any services that are not required. Common candidates: Telnet, FTP, unused web server features.',
    shortTerm: 'Create a standard list of approved services for each type of system and audit all systems against this list. Disable all non-approved services.',
    longTerm: 'Implement configuration management tools that enforce the approved service baseline and alert when unauthorized services are started.',
  },
  '4.9': {
    immediate: 'Change your DNS settings on key systems to use a reputable, filtering DNS service such as Cloudflare (1.1.1.1), OpenDNS, or Cisco Umbrella.',
    shortTerm: 'Configure all devices and servers to use your approved DNS servers by default, preventing individual users from changing to potentially unsafe DNS providers.',
    longTerm: 'Implement DNS filtering services that block access to malicious domains and provide visibility into DNS queries across your organization.',
  },
  '4.10': {
    immediate: 'Enable automatic device lockout after failed login attempts on all mobile devices. For iPhones, enable "Erase Data" after 10 failed attempts in Settings > Face ID & Passcode.',
    shortTerm: 'Deploy MDM policies that enforce device lockout settings across all mobile devices accessing company data.',
    longTerm: 'Monitor MDM compliance reports to ensure all mobile devices maintain required security settings, and automatically unenroll non-compliant devices from company resources.',
  },
  '4.11': {
    immediate: 'Verify that remote wipe is configured and working on all company phones and laptops. Test the process now so you know it works when you actually need it.',
    shortTerm: 'Enroll all mobile devices in your MDM solution and configure remote wipe capabilities. Create a procedure for initiating remote wipe when a device is reported lost.',
    longTerm: 'Implement a formal device loss reporting and response process that includes immediate remote wipe for sensitive devices, with documented recovery of wiped devices.',
  },
  '4.12': {
    immediate: 'Enroll all employee-owned phones that access company data in your MDM solution and enable work profile separation if available.',
    shortTerm: 'Implement a BYOD (Bring Your Own Device) policy that requires employees to enroll personal devices in MDM as a condition of accessing company resources.',
    longTerm: 'Use containerization technology that completely isolates work data from personal data on employee devices, with the ability to wipe work data without affecting personal data.',
  },
  '5.1': {
    immediate: 'Run a report from Active Directory, your identity provider, or your email system to generate a current list of all user accounts. Immediately identify and disable accounts for former employees.',
    shortTerm: 'Create a comprehensive account inventory that includes accounts in all systems — Active Directory, email, cloud apps, VPN, etc. Review for stale or orphaned accounts.',
    longTerm: 'Implement automated account lifecycle management that tracks accounts from creation to termination and provides regular reports on account status across all systems.',
  },
  '5.2': {
    immediate: 'Deploy a password manager to all employees (Bitwarden, 1Password, or LastPass) and require its use for all work passwords. Change any known reused or weak passwords immediately.',
    shortTerm: 'Implement minimum password complexity requirements and account for multi-factor authentication. Audit for password reuse using tools or policy.',
    longTerm: 'Migrate to passwordless authentication or passkeys where possible, and continuously monitor for compromised credentials using breach databases.',
  },
  '5.3': {
    immediate: 'Run a report of all accounts that have not logged in for 90+ days and disable them today. Pay special attention to accounts for former employees.',
    shortTerm: 'Implement an automated process that disables accounts after a set period of inactivity (typically 90 days). Create a process for users to reactivate accounts if needed.',
    longTerm: 'Integrate account lifecycle management with your HR system so accounts are automatically disabled when an employee leaves or changes roles.',
  },
  '5.4': {
    immediate: 'Identify all users who currently use admin accounts for daily tasks. Immediately create separate standard accounts for daily use and restrict admin account use to admin tasks only.',
    shortTerm: 'Implement a policy requiring separate admin accounts for all IT staff. Configure admin accounts to require additional authentication steps.',
    longTerm: 'Deploy Privileged Access Management (PAM) solutions that require IT staff to check out admin credentials for specific tasks, with full session recording and time-limited access.',
  },
  '5.5': {
    immediate: 'Audit all service accounts in your environment. Identify any that have excessive permissions and reduce them to only what is needed.',
    shortTerm: 'Document all service accounts, their purpose, and their owner. Review and minimize permissions for all service accounts.',
    longTerm: 'Implement a service account management process with regular reviews and automatic rotation of service account credentials using a privileged access management tool.',
  },
  '5.6': {
    immediate: 'Ensure Active Directory or your identity provider is the authoritative source for all accounts. Disable local accounts on systems where possible.',
    shortTerm: 'Centralize authentication for all systems through Active Directory, Azure AD, or another identity provider. Eliminate standalone local account management.',
    longTerm: 'Implement Single Sign-On (SSO) for all applications and integrate all systems with your central identity provider for unified account management.',
  },
  '6.1': {
    immediate: 'Create a simple access request form — even a basic email template — that requires a manager\'s approval before new access is granted. Stop granting access based on informal requests.',
    shortTerm: 'Implement a formal access request and approval workflow with documented justifications for all access grants.',
    longTerm: 'Deploy an identity governance platform that automates access request, approval, and provisioning workflows with full audit trails.',
  },
  '6.2': {
    immediate: 'Contact HR to establish a process where IT is notified on an employee\'s last day. Create a checklist of all systems that must have access revoked when someone leaves.',
    shortTerm: 'Implement a formal offboarding process that includes access revocation for all systems within 24 hours of an employee\'s departure.',
    longTerm: 'Integrate your HR system with identity management so access is automatically revoked when an employee terminates, with no manual steps required.',
  },
  '6.3': {
    immediate: 'Enable MFA immediately for all internet-facing applications — especially email, cloud storage, VPN, and web portals. Most cloud services offer free MFA options.',
    shortTerm: 'Enforce MFA for all externally accessible applications. Document any exceptions and create a plan to address them.',
    longTerm: 'Move toward phishing-resistant MFA (hardware security keys or passkeys) for all external applications, especially those handling sensitive data.',
  },
  '6.4': {
    immediate: 'Enable MFA for VPN access immediately. If your VPN does not support MFA, this is a critical gap to address urgently — contact your vendor.',
    shortTerm: 'Require MFA for all remote access methods, including VPN, remote desktop, and cloud-based remote tools.',
    longTerm: 'Implement a zero-trust network access model that requires continuous authentication verification for all remote access, not just at login.',
  },
  '6.5': {
    immediate: 'Enable MFA for all administrative accounts immediately — this is the single most impactful change you can make for admin account security.',
    shortTerm: 'Require MFA for all accounts with elevated privileges across all systems, with no exceptions.',
    longTerm: 'Implement phishing-resistant MFA (FIDO2 hardware keys) for all administrative accounts, as this is the most secure form of MFA available.',
  },
  '6.6': {
    immediate: 'Create a list of all systems that handle authentication and authorization in your organization — Active Directory, LDAP, SSO systems, MFA providers, etc.',
    shortTerm: 'Document all authentication and authorization systems including their configurations, how they are connected, and who administers them.',
    longTerm: 'Maintain a current architecture diagram of your identity and access management infrastructure and review it quarterly.',
  },
  '6.7': {
    immediate: 'Begin consolidating authentication by requiring all cloud applications to authenticate through your central identity provider (Azure AD, Okta, Google Workspace).',
    shortTerm: 'Implement Single Sign-On for all business applications, reducing the number of separate login systems to manage.',
    longTerm: 'Achieve centralized access control for all systems with a unified identity platform, enabling consistent policy enforcement and comprehensive access visibility.',
  },
  '6.8': {
    immediate: 'Review access rights for users who have changed roles within the past year. Remove access that was appropriate for their old role but not their current one.',
    shortTerm: 'Define role-based access profiles for each job role in your organization. Begin implementing access assignments based on job role.',
    longTerm: 'Implement a formal identity governance program that includes regular access certification campaigns where managers confirm their team\'s access is still appropriate.',
  },
  '7.1': {
    immediate: 'Schedule a vulnerability scan today using a free tool like OpenVAS, or sign up for a trial of a commercial scanner like Tenable Nessus Essentials (free for up to 16 IPs).',
    shortTerm: 'Establish a documented vulnerability management process including how often to scan, how to track findings, and patch timelines based on severity.',
    longTerm: 'Implement a continuous vulnerability management program with regular scanning, automated tracking, and integration with your patch management process.',
  },
  '7.2': {
    immediate: 'Define remediation timeframes right now: Critical vulnerabilities in 24-48 hours, High in 7 days, Medium in 30 days, Low in 90 days. Apply these to your current vulnerability backlog.',
    shortTerm: 'Create a vulnerability remediation tracking system and assign ownership for each vulnerability. Report on remediation progress regularly.',
    longTerm: 'Integrate vulnerability tracking with your IT service management system to create automatic remediation tickets and track compliance with remediation SLAs.',
  },
  '7.3': {
    immediate: 'Enable automatic updates for Windows (or your operating system) on all computers immediately. Check that the automatic update service is running on all servers.',
    shortTerm: 'Deploy WSUS (Windows Server Update Services) or another patch management tool to centrally manage and verify OS patching across all devices.',
    longTerm: 'Implement automated patch management with testing in a staging environment, followed by staged deployment to production systems with compliance reporting.',
  },
  '7.4': {
    immediate: 'Enable automatic updates for all business applications — especially web browsers, PDF readers, Microsoft Office, and any other frequently targeted applications.',
    shortTerm: 'Deploy an application patch management solution that handles third-party application patching across all endpoints.',
    longTerm: 'Implement automated third-party application patching with compliance dashboards showing patch status across all endpoints and all applications.',
  },
  '7.5': {
    immediate: 'Run a vulnerability scan of your internal network using a free scanner like Nessus Essentials or OpenVAS. Review and prioritize the findings.',
    shortTerm: 'Set up scheduled automated vulnerability scans of all internal systems, with results reviewed and remediation tracked.',
    longTerm: 'Implement continuous vulnerability scanning with automated discovery of new assets, risk-based prioritization, and integration with your ticketing system.',
  },
  '7.6': {
    immediate: 'Run a vulnerability scan against your internet-facing systems using a free external scanner or sign up for a service like Qualys FreeScan.',
    shortTerm: 'Implement regularly scheduled external vulnerability scanning of all internet-exposed systems with findings tracked to remediation.',
    longTerm: 'Use continuous external attack surface monitoring to be instantly alerted when new vulnerabilities are discovered in your externally exposed systems.',
  },
  '7.7': {
    immediate: 'Review your current open vulnerability scan findings and start remediating the highest-severity items immediately. Create a plan to address all critical and high findings within 30 days.',
    shortTerm: 'Establish a vulnerability remediation workflow with assigned owners, due dates based on severity, and weekly status reporting to management.',
    longTerm: 'Achieve a consistently low vulnerability exposure by making remediation an ongoing operational activity with regular reporting to leadership on your security posture.',
  },
  '8.1': {
    immediate: 'Enable logging on your most important systems: domain controllers, firewalls, VPN, and servers handling sensitive data. Even basic Windows Event Logging is far better than nothing.',
    shortTerm: 'Define what events must be logged, how long logs must be kept, and who is responsible for reviewing them. Document this as your audit log policy.',
    longTerm: 'Implement a comprehensive log management program with centralized collection, automated analysis, and regular compliance audits.',
  },
  '8.2': {
    immediate: 'Enable Windows Event Logging on all Windows systems and ensure syslog is enabled on all network devices. Check that logging is actually working by reviewing recent log entries.',
    shortTerm: 'Define the specific events that should be logged on each type of system and configure logging accordingly across your environment.',
    longTerm: 'Implement a SIEM solution that aggregates logs from all sources and enables automated analysis and alerting.',
  },
  '8.3': {
    immediate: 'Check how much log storage you currently have and estimate how long you can retain logs before they are overwritten. If it is less than 90 days, add storage immediately.',
    shortTerm: 'Calculate your log storage requirements based on retention policies and allocate sufficient storage with monitoring for capacity.',
    longTerm: 'Implement tiered log storage with hot storage for recent logs (immediate access) and cold storage for older logs, with automatic archiving and retrieval capabilities.',
  },
  '8.4': {
    immediate: 'Configure all critical systems to synchronize their clocks with the same time server (NTP server). In Windows domains, this is typically handled automatically by Active Directory.',
    shortTerm: 'Verify time synchronization is working correctly across all systems and document your time synchronization architecture.',
    longTerm: 'Monitor time drift regularly and ensure all systems — including network equipment and IoT devices — maintain accurate, synchronized time.',
  },
  '8.5': {
    immediate: 'Enable detailed audit logging on your domain controller: logon events, account management, policy changes, and privilege use at minimum.',
    shortTerm: 'Implement detailed audit logging based on the CIS Benchmark recommendations for your operating system and key applications.',
    longTerm: 'Regularly review and tune your audit log configuration to capture the events most valuable for security monitoring and investigation.',
  },
  '8.6': {
    immediate: 'Enable DNS query logging on your DNS servers or configure your DNS service to log queries. Many routers and DNS servers support this built-in.',
    shortTerm: 'Configure DNS logging to capture all queries and set up alerts for connections to known malicious domains using a threat intelligence feed.',
    longTerm: 'Integrate DNS logs into your SIEM for automated analysis and alerting on DNS-based threats such as domain generation algorithm (DGA) malware.',
  },
  '8.7': {
    immediate: 'Enable web proxy logging if you have a web proxy in place, or configure your firewall to log HTTP/HTTPS connection attempts.',
    shortTerm: 'Implement URL filtering and logging at the network level, capturing destination URLs for all outbound web traffic.',
    longTerm: 'Use a cloud-based web security gateway that provides comprehensive URL logging, filtering, and threat detection for all web traffic.',
  },
  '8.8': {
    immediate: 'Enable PowerShell script block logging and command-line process logging in Windows Event Logs. This can be done via Group Policy in minutes.',
    shortTerm: 'Configure command-line logging across all endpoints and servers, and ensure these logs are captured by your centralized log collection.',
    longTerm: 'Integrate command-line audit logs with your SIEM for automated detection of known attacker techniques like those documented in the MITRE ATT&CK framework.',
  },
  '8.9': {
    immediate: 'Set up a basic central log collection using a free tool like Graylog Community Edition or the ELK Stack, or use your existing security tools\' log forwarding capabilities.',
    shortTerm: 'Deploy centralized log management that collects logs from all key systems and provides search and analysis capabilities.',
    longTerm: 'Implement a full SIEM solution with automated correlation, threat detection, and incident alerting based on your centralized log data.',
  },
  '8.10': {
    immediate: 'Configure your log storage system to retain logs for at least 90 days. Immediately archive any logs that would otherwise be deleted.',
    shortTerm: 'Implement a log retention policy that meets your legal, regulatory, and operational requirements, with automated archiving to ensure compliance.',
    longTerm: 'Use immutable log storage that prevents logs from being modified or deleted, even by administrators, ensuring the integrity of your audit trail.',
  },
  '8.11': {
    immediate: 'Schedule a weekly log review appointment for your IT team. Start with reviewing security logs from your domain controller and firewall for the past week.',
    shortTerm: 'Establish a formal log review process with documented procedures, responsible staff, and records of each review session.',
    longTerm: 'Implement automated log analysis that reduces manual review effort by highlighting the logs most likely to represent security incidents.',
  },
  '8.12': {
    immediate: 'Contact your key cloud service providers (Microsoft 365, AWS, Google Cloud, Salesforce) and enable the audit logging options available in your subscription.',
    shortTerm: 'Collect and centralize logs from all cloud providers your organization uses, alongside your on-premises system logs.',
    longTerm: 'Integrate cloud provider logs into your SIEM for unified visibility across your hybrid environment and automated cloud threat detection.',
  },
  '9.1': {
    immediate: 'Check the version of web browsers and email clients installed across your organization. Immediately update any that are more than one major version behind current.',
    shortTerm: 'Enable automatic updates for browsers and email clients across all devices. Create a process to verify browsers are current on a monthly basis.',
    longTerm: 'Use endpoint management tools to enforce approved browser versions and automatically deploy updates organization-wide.',
  },
  '9.2': {
    immediate: 'Change your DNS servers to use a free filtering service like Cloudflare for Teams (1.1.1.1 for Families), OpenDNS, or Cisco Umbrella Free. This can be done in minutes on your router.',
    shortTerm: 'Deploy DNS filtering across your entire organization through your network infrastructure, not just individual devices.',
    longTerm: 'Implement a cloud-based DNS security service with threat intelligence, category-based filtering, and visibility into DNS query patterns.',
  },
  '9.3': {
    immediate: 'Enable web filtering in your DNS filtering service or firewall if available. Start by blocking known malicious site categories and work from there.',
    shortTerm: 'Configure URL filtering policies that block high-risk categories while allowing legitimate business browsing.',
    longTerm: 'Implement a comprehensive web security gateway with SSL inspection, advanced threat protection, and user-level policy enforcement.',
  },
  '9.4': {
    immediate: 'Push browser policies via Group Policy or MDM to restrict which extensions can be installed. Immediately remove any extensions that cannot be attributed to a business purpose.',
    shortTerm: 'Create an approved browser extension list and implement technical controls blocking unapproved extensions across your browser fleet.',
    longTerm: 'Manage browser extensions through your endpoint management platform with continuous monitoring for unauthorized extension installations.',
  },
  '9.5': {
    immediate: 'Check your DMARC status at dmarcanalyzer.com or mxtoolbox.com/dmarc. If you do not have DMARC configured, add a DMARC record to your DNS today (start with "p=none" to monitor).',
    shortTerm: 'Implement DMARC in enforcement mode (p=quarantine or p=reject) after reviewing DMARC reports to ensure legitimate email is not blocked.',
    longTerm: 'Maintain DMARC in enforcement mode with ongoing monitoring of DMARC reports and rapid response to any unauthorized use of your domain.',
  },
  '9.6': {
    immediate: 'Configure your email system to block or quarantine common malicious file types: .exe, .bat, .js, .vbs, .cmd, .scr, and macro-enabled Office documents from external senders.',
    shortTerm: 'Implement a comprehensive email attachment filtering policy that blocks or sandboxes all high-risk file types.',
    longTerm: 'Deploy advanced email security with sandboxing capabilities that detonate suspicious attachments in a safe environment before delivering them.',
  },
  '9.7': {
    immediate: 'Enable the built-in anti-malware scanning in your email platform (Microsoft Defender for Office 365, Google Workspace Advanced Protection) if not already active.',
    shortTerm: 'Deploy a multi-layer email security solution with antivirus, anti-spam, and sandboxing capabilities on your email server or gateway.',
    longTerm: 'Implement advanced threat protection for email that uses AI and behavioral analysis to catch sophisticated attacks that signature-based tools miss.',
  },
  '10.1': {
    immediate: 'Verify that antivirus/antimalware software is installed and running on every computer in your organization. Address any gaps immediately — free tools like Windows Defender are acceptable for small organizations.',
    shortTerm: 'Standardize on an approved antimalware solution for all endpoints and ensure 100% deployment coverage.',
    longTerm: 'Deploy an endpoint detection and response (EDR) solution that provides advanced threat detection beyond traditional antivirus capabilities.',
  },
  '10.2': {
    immediate: 'Check that automatic signature updates are enabled on your antivirus software and that all definitions are current. Run a manual update on any that are out of date.',
    shortTerm: 'Configure antimalware software to update definitions automatically at least daily. Monitor update status centrally to catch any failures.',
    longTerm: 'Use centralized antimalware management to monitor definition freshness across all endpoints and immediately alert on devices with stale definitions.',
  },
  '10.3': {
    immediate: 'Disable AutoRun and AutoPlay on all Windows computers using Group Policy or the built-in Windows settings. This takes only minutes and immediately reduces USB malware risk.',
    shortTerm: 'Verify autorun is disabled across all endpoints using configuration scanning. Include this in your security configuration baseline.',
    longTerm: 'Enforce autorun disable policy through Group Policy or endpoint management and monitor compliance continuously.',
  },
  '10.4': {
    immediate: 'Configure your antivirus software to automatically scan removable media when inserted. This setting is available in most antivirus consoles.',
    shortTerm: 'Deploy endpoint policies that enforce automatic removable media scanning across all devices.',
    longTerm: 'Consider implementing USB device controls that only allow organization-owned, encrypted USB drives, blocking all others.',
  },
  '10.5': {
    immediate: 'Enable Windows Defender Exploit Guard or equivalent on all Windows 10/11 systems. Enable Data Execution Prevention (DEP) and Address Space Layout Randomization (ASLR) on all systems where possible.',
    shortTerm: 'Review and enable all available anti-exploitation features in your operating systems and security tools.',
    longTerm: 'Deploy a dedicated endpoint protection platform (EPP) that includes comprehensive anti-exploitation capabilities and behavioral protection.',
  },
  '10.6': {
    immediate: 'Access your antivirus management console and verify all endpoints are reporting in as healthy. Investigate any endpoints that are not reporting or have issues.',
    shortTerm: 'Implement centralized antivirus management with dashboards showing protection status, definition freshness, and scan results across all endpoints.',
    longTerm: 'Use unified endpoint security management that provides a single view of security status across all devices and enables policy enforcement from one location.',
  },
  '10.7': {
    immediate: 'Evaluate whether your current antivirus solution includes behavioral detection capabilities. If not, consider adding a behavioral security layer.',
    shortTerm: 'Deploy an EDR (Endpoint Detection and Response) solution that adds behavioral detection to your existing antivirus protection.',
    longTerm: 'Mature to a full XDR (Extended Detection and Response) platform that provides behavioral analytics across endpoints, network, email, and cloud.',
  },
  '11.1': {
    immediate: 'Document your current backup approach even informally: what is backed up, how often, where backups go, and how to restore. If you have no backup process, start one today — cloud backup services can be set up in hours.',
    shortTerm: 'Develop a formal data recovery plan that documents your backup strategy, recovery time objectives (how long recovery takes), and recovery point objectives (how much data can be lost).',
    longTerm: 'Maintain and regularly review your data recovery plan, update it when systems change, and test it at least annually.',
  },
  '11.2': {
    immediate: 'Verify that automated backups are running and recent. Check the timestamp of your last successful backup — if it is more than a day old, investigate immediately.',
    shortTerm: 'Implement automated backups for all critical data with a schedule appropriate for your recovery point objective (typically daily at minimum).',
    longTerm: 'Implement a 3-2-1 backup strategy: 3 copies of data, on 2 different types of media, with 1 copy offsite.',
  },
  '11.3': {
    immediate: 'Check whether your backups are stored in a location accessible from the same network as your main systems. If they are accessible, an attacker who encrypts your main systems may also encrypt your backups.',
    shortTerm: 'Implement access controls on backup storage so that only the backup service account can write to backup storage — not general user accounts.',
    longTerm: 'Use immutable backup storage that prevents backups from being modified or deleted, even by administrators, for the duration of your retention period.',
  },
  '11.4': {
    immediate: 'Identify your most critical data and create an offline or air-gapped copy today. An external hard drive disconnected from the network is a simple starting point.',
    shortTerm: 'Implement at least one isolated backup that is not connected to your network — either via tape, offline drives, or cloud storage with object lock enabled.',
    longTerm: 'Maintain a dedicated offsite backup strategy with tested recovery procedures that can restore operations even if your entire main environment is destroyed.',
  },
  '11.5': {
    immediate: 'Schedule a backup restoration test for this week. Pick a non-critical system and actually restore it from backup to verify the process works.',
    shortTerm: 'Implement a formal backup testing schedule — at minimum, test restore of different data types quarterly. Document the results.',
    longTerm: 'Conduct regular full disaster recovery exercises that simulate real-world scenarios, including ransomware infection, to ensure your recovery plan actually works.',
  },
  '12.1': {
    immediate: 'Check the firmware version on all your network equipment (routers, switches, firewalls) and compare against the current vendor-released version. Apply any critical security patches immediately.',
    shortTerm: 'Create an inventory of all network equipment with current and latest firmware versions. Establish a regular patch cycle for network equipment.',
    longTerm: 'Implement a formal network equipment patching program with change management procedures and verification testing after each update.',
  },
  '12.2': {
    immediate: 'Review your current network architecture. If all systems are on a single flat network, create a plan to segment at minimum: servers, workstations, guest network, and IoT devices.',
    shortTerm: 'Implement network segmentation using VLANs and firewall rules to separate systems based on function and sensitivity.',
    longTerm: 'Develop and maintain a comprehensive, documented network architecture with proper segmentation, DMZs, and access controls between all network zones.',
  },
  '12.3': {
    immediate: 'Change all default passwords on network equipment and ensure management interfaces (web consoles, SSH) require authentication. Disable Telnet — use SSH only.',
    shortTerm: 'Implement jump servers or bastion hosts as the only way to access network equipment for administration. Log all administrative sessions.',
    longTerm: 'Use a network management system with role-based access control, multi-factor authentication, and full audit logging of all administrative actions.',
  },
  '12.4': {
    immediate: 'Create a basic network diagram showing your primary network zones, major systems, and internet connection points. Even a hand-drawn sketch is valuable.',
    shortTerm: 'Develop comprehensive network architecture documentation including all network segments, IP addressing, firewall rules, and connections to external services.',
    longTerm: 'Maintain network diagrams as living documents, updated whenever the network changes, using diagramming tools that integrate with your IT management system.',
  },
  '12.5': {
    immediate: 'Ensure all network equipment authentication is configured to require individual user credentials, not shared passwords. Enable logging of all authentication attempts.',
    shortTerm: 'Implement a central RADIUS or TACACS+ server for network equipment authentication, enabling centralized user management and logging.',
    longTerm: 'Fully integrate network device authentication with your identity management system for consistent access control and comprehensive audit logging.',
  },
  '12.6': {
    immediate: 'Disable Telnet and other insecure protocols on all network equipment. Enable and use SSH version 2 for all device management.',
    shortTerm: 'Audit all network management protocols in use and replace insecure ones with their encrypted equivalents.',
    longTerm: 'Implement a network management framework that exclusively uses secure, encrypted protocols and monitors for any unauthorized use of insecure protocols.',
  },
  '12.7': {
    immediate: 'Ensure all remote workers are using VPN before accessing any internal resources. Send a communication reminding employees of this requirement immediately.',
    shortTerm: 'Implement split-tunneling policies on your VPN to ensure all traffic to internal resources goes through the VPN, and all traffic is authenticated.',
    longTerm: 'Transition from VPN to a Zero Trust Network Access (ZTNA) model that provides more granular access control and better security for remote workers.',
  },
  '12.8': {
    immediate: 'Identify admin staff who currently use the same device for browsing and administrative tasks. Prioritize getting dedicated admin devices for those managing your most critical systems.',
    shortTerm: 'Provide dedicated, hardened workstations for all IT administrators to use exclusively for administrative tasks.',
    longTerm: 'Implement privileged access workstations (PAWs) with strict controls that prevent web browsing, email, and other risky activities on admin devices.',
  },
  '13.1': {
    immediate: 'Set up a central location — even a shared email inbox — where security alerts from all your tools are collected and reviewed daily.',
    shortTerm: 'Deploy a Security Information and Event Management (SIEM) solution to centralize alerts from all security tools and enable correlation.',
    longTerm: 'Operate a mature SIEM with documented use cases, tuned alerting thresholds, and integration with your incident response workflow.',
  },
  '13.2': {
    immediate: 'Enable Windows Defender Advanced Threat Protection or your existing EDR solution on all servers if not already active.',
    shortTerm: 'Deploy a host-based intrusion detection or EDR solution on all servers and critical endpoints.',
    longTerm: 'Operate a fully managed EDR solution with 24/7 alert monitoring and response capabilities, either internally or through a managed security service provider.',
  },
  '13.3': {
    immediate: 'Review the alerting capabilities of your existing firewall — most modern firewalls include basic intrusion detection capabilities that may not be enabled.',
    shortTerm: 'Deploy a dedicated network intrusion detection system (IDS) at key network chokepoints, especially at your internet perimeter.',
    longTerm: 'Implement network detection and response (NDR) capabilities with behavioral analytics that detect threats based on network traffic patterns.',
  },
  '13.4': {
    immediate: 'Implement firewall rules between your network segments to prevent systems from communicating with other segments unnecessarily. Block server-to-workstation direct communication at minimum.',
    shortTerm: 'Define and implement traffic filtering rules between all network segments based on the principle of least communication — only allow what is explicitly needed.',
    longTerm: 'Implement micro-segmentation with granular controls on inter-segment communication, monitored continuously for policy violations.',
  },
  '13.5': {
    immediate: 'Review the security controls applied to remote devices. Ensure remote devices meet the same security standards as office devices before they can access company resources.',
    shortTerm: 'Implement device health checks (device compliance policies) that verify remote devices meet security requirements before granting network access.',
    longTerm: 'Implement Zero Trust Network Access that continuously evaluates device health and user identity before granting access to resources, regardless of location.',
  },
  '13.6': {
    immediate: 'Enable NetFlow or equivalent flow logging on your core network switches and routers if available. This provides basic network traffic visibility.',
    shortTerm: 'Deploy network flow collection and analysis for all key network segments to establish baseline traffic patterns.',
    longTerm: 'Implement full network traffic analysis with behavioral anomaly detection to spot unusual communication patterns that indicate compromise.',
  },
  '13.7': {
    immediate: 'Verify your EDR solution includes prevention (blocking) capabilities, not just detection. Enable blocking mode if it is currently set to detection only.',
    shortTerm: 'Deploy a host-based intrusion prevention solution (HIPS) or enable prevention mode in your existing EDR across all critical servers.',
    longTerm: 'Mature your endpoint protection to a full XDR platform that detects and automatically responds to threats across endpoints without human intervention.',
  },
  '13.8': {
    immediate: 'Review your existing firewall or UTM appliance — many include IPS features that may not be enabled. Enable IPS on your perimeter firewall immediately.',
    shortTerm: 'Deploy a dedicated network intrusion prevention system (IPS) or enable IPS capabilities on your next-generation firewall.',
    longTerm: 'Maintain an actively managed IPS solution with regular signature updates, tuned to minimize false positives while blocking real threats.',
  },
  '13.9': {
    immediate: 'Enable 802.1X authentication on your network switches if supported — this prevents unauthorized devices from connecting to network ports.',
    shortTerm: 'Implement port-level access control using 802.1X throughout your wired network, with appropriate policies for different device types.',
    longTerm: 'Operate a full Network Access Control (NAC) solution that enforces port-level access control with device health verification and dynamic VLAN assignment.',
  },
  '13.10': {
    immediate: 'Enable application awareness features on your next-generation firewall if available. These allow you to filter traffic based on the application protocol rather than just the port.',
    shortTerm: 'Configure application-layer filtering policies on your next-generation firewall to identify and control application traffic regardless of port.',
    longTerm: 'Implement advanced application-layer security with deep packet inspection, SSL decryption, and application-specific threat signatures.',
  },
  '13.11': {
    immediate: 'Review your current alert volumes. If you are receiving hundreds of alerts per day, identify and suppress the top 10 false positive alert types to reduce noise.',
    shortTerm: 'Tune all security alert thresholds based on your environment to reduce false positive rates while maintaining detection of real threats.',
    longTerm: 'Implement machine learning-based alert tuning that automatically adjusts thresholds based on learned baselines, continuously improving alert quality.',
  },
  '14.1': {
    immediate: 'Send an organization-wide security awareness message today covering: phishing awareness, password hygiene, and how to report security concerns. Even a simple email is a start.',
    shortTerm: 'Implement a formal security awareness training program. Many vendors offer affordable or free training platforms (KnowBe4, Proofpoint, etc.) with pre-built courses.',
    longTerm: 'Operate a mature security awareness program with role-based training, regular phishing simulations, metrics tracking, and continuous improvement.',
  },
  '14.2': {
    immediate: 'Send all employees a practical guide on identifying phishing emails, including red flags like urgent language, suspicious links, and requests for credentials.',
    shortTerm: 'Run simulated phishing exercises to test employee awareness. Use results to identify who needs additional training.',
    longTerm: 'Run ongoing simulated phishing campaigns with just-in-time training for employees who click, tracking improvement over time.',
  },
  '14.3': {
    immediate: 'Share a simple password guide with all employees: use a password manager, never reuse passwords, and enable MFA on all accounts.',
    shortTerm: 'Conduct mandatory training on password security and multi-factor authentication for all staff.',
    longTerm: 'Incorporate authentication best practices into onboarding and annual security training, with verification that employees apply what they learn.',
  },
  '14.4': {
    immediate: 'Publish a one-page data handling guide for employees: how to classify data, approved sharing tools, and what to do if they accidentally send sensitive data to the wrong place.',
    shortTerm: 'Conduct mandatory data handling training for all employees covering classification, secure sharing, and disposal of sensitive data.',
    longTerm: 'Integrate data handling into role-specific training and conduct regular audits to verify employees are following proper data handling procedures.',
  },
  '14.5': {
    immediate: 'Remind all employees of the most common ways data is accidentally exposed: wrong email recipient, personal cloud storage, screenshots, and unencrypted USB drives.',
    shortTerm: 'Conduct training on accidental data exposure scenarios with real examples from your industry. Include what to do if an accidental exposure occurs.',
    longTerm: 'Use data loss prevention monitoring to identify accidental exposure incidents and use them as training opportunities without punishing employees.',
  },
  '14.6': {
    immediate: 'Make sure every employee knows: who to contact when they suspect a security incident, and that they should report without fear of blame for honest mistakes.',
    shortTerm: 'Conduct training on recognizing security incidents and the reporting process. Publish the incident reporting contacts in all common work locations.',
    longTerm: 'Create a positive security culture where reporting is celebrated, not penalized, and track near-miss reports as a positive security metric.',
  },
  '14.7': {
    immediate: 'Tell employees that if they see a software update prompt, they should run it — and that they should report any system that cannot be updated to IT.',
    shortTerm: 'Train employees on why updates are important and what to do when they encounter a system that will not or cannot update.',
    longTerm: 'Create a feedback loop where employee reports of patching issues trigger a formal IT investigation and response process.',
  },
  '14.8': {
    immediate: 'Send all employees a one-page guide on safe remote work: use VPN, avoid public Wi-Fi for work, and do not use personal devices for sensitive work tasks.',
    shortTerm: 'Conduct training on the risks of public and insecure networks, and the specific precautions employees should take when working remotely.',
    longTerm: 'Make remote work security a required component of all employee onboarding and annual security training, especially for employees who travel frequently.',
  },
  '14.9': {
    immediate: 'Identify the top three job roles with the highest security risk in your organization (e.g., finance, HR, executives) and create targeted security briefings for each.',
    shortTerm: 'Develop role-specific security training modules for each high-risk function in your organization.',
    longTerm: 'Maintain a comprehensive role-based training program with annual updates based on the latest threats targeting each role.',
  },
  '15.1': {
    immediate: 'Create a spreadsheet listing all vendors and service providers that have access to your systems or data. Include cloud providers, software vendors, IT support firms, and cleaning services with after-hours access.',
    shortTerm: 'Complete a comprehensive vendor inventory including what data or systems each vendor can access, the nature of their access, and the security controls they have in place.',
    longTerm: 'Maintain a dynamic vendor inventory integrated with your procurement process so new vendors are automatically tracked from onboarding.',
  },
  '15.2': {
    immediate: 'Review your most critical vendor relationships and document the security requirements you expect them to meet.',
    shortTerm: 'Develop a formal vendor security management policy and communicate it to all departments involved in vendor selection.',
    longTerm: 'Implement a comprehensive third-party risk management program with tiered oversight based on vendor risk level.',
  },
  '15.3': {
    immediate: 'Classify your top 10 vendors by risk: high (access to sensitive data or critical systems), medium (limited data access), low (no system access). Apply heightened oversight to high-risk vendors immediately.',
    shortTerm: 'Formally classify all vendors by risk level using documented criteria. Apply proportionate security requirements to each tier.',
    longTerm: 'Maintain ongoing risk classifications for all vendors with automatic re-evaluation when the nature of the relationship changes.',
  },
  '15.4': {
    immediate: 'Review contracts with your top 5 most critical vendors. If they do not include security requirements (data protection, breach notification, audit rights), raise this with your legal team.',
    shortTerm: 'Develop standard security contract clauses and work with your legal team to include them in all new and renewed vendor contracts.',
    longTerm: 'Enforce security requirements in all vendor contracts and conduct periodic reviews to ensure vendors are meeting their contractual security obligations.',
  },
  '15.5': {
    immediate: 'Request security documentation from your highest-risk vendors — SOC 2 reports, ISO 27001 certificates, or penetration test results are all acceptable evidence of security practices.',
    shortTerm: 'Implement a formal vendor security assessment process for all high-risk vendors, using questionnaires or third-party assessment services.',
    longTerm: 'Conduct regular vendor security assessments on a risk-based schedule, with more frequent assessments for higher-risk vendors.',
  },
  '15.6': {
    immediate: 'Set up Google Alerts for your most critical vendors to be notified of any security incidents or data breaches they experience.',
    shortTerm: 'Subscribe to threat intelligence services that monitor for breaches at your vendors. Establish a process for responding when a vendor incident is detected.',
    longTerm: 'Implement continuous vendor risk monitoring using automated services that track vendor security posture and alert you to emerging risks.',
  },
  '15.7': {
    immediate: 'When ending a vendor relationship, immediately revoke all access credentials and API keys the vendor held. Do not wait for the formal contract end date.',
    shortTerm: 'Create a formal vendor offboarding checklist that includes access revocation, data deletion confirmation, and documentation of completion.',
    longTerm: 'Implement automated vendor offboarding workflows triggered by contract termination events, with mandatory verification steps and audit trails.',
  },
  '16.1': {
    immediate: 'Review your software development process for the basic security checkpoints: are security requirements defined before development starts? Are there any code reviews before deployment?',
    shortTerm: 'Implement a Secure Software Development Lifecycle (SSDLC) that includes security requirements, threat modeling, code review, and security testing at each stage.',
    longTerm: 'Mature your SSDLC to include automated security scanning in your CI/CD pipeline, security champions in development teams, and metrics tracking security debt.',
  },
  '16.2': {
    immediate: 'Create a simple process for how people can report security vulnerabilities in your applications — an email address or a form is a good start.',
    shortTerm: 'Implement a formal vulnerability disclosure program with defined response timelines and a tracking system for reported vulnerabilities.',
    longTerm: 'Operate a mature vulnerability management program for your applications with SLA-based remediation, trend analysis, and integration with your development workflow.',
  },
  '16.3': {
    immediate: 'When a security vulnerability is fixed in your application, document what caused it before moving on. Even a one-paragraph root cause analysis prevents repeat occurrences.',
    shortTerm: 'Implement a root cause analysis process for all security vulnerabilities found in your applications, with findings fed back to developers.',
    longTerm: 'Use root cause analysis data to identify systemic patterns in your vulnerabilities and address them at the process or training level.',
  },
  '16.4': {
    immediate: 'For each internally developed application, create a list of all third-party libraries and frameworks it uses. Note the version currently in use.',
    shortTerm: 'Implement a Software Bill of Materials (SBOM) for all applications. Set up alerts for when vulnerabilities are discovered in your dependencies.',
    longTerm: 'Automate SBOM generation and vulnerability tracking using Software Composition Analysis (SCA) tools integrated into your build pipeline.',
  },
  '16.5': {
    immediate: 'Check your applications\' dependencies for known vulnerabilities using a free tool like OWASP Dependency Check or Snyk\'s free tier.',
    shortTerm: 'Implement a process for regularly updating third-party dependencies and tracking when updates are needed due to security vulnerabilities.',
    longTerm: 'Use automated dependency management tools that alert when new vulnerabilities affect your dependencies and help streamline the update process.',
  },
  '16.6': {
    immediate: 'Adopt the CVSS (Common Vulnerability Scoring System) as your severity rating standard for application vulnerabilities — it is widely understood and free to use.',
    shortTerm: 'Define and document your severity rating criteria for application vulnerabilities, with corresponding remediation timelines for each severity level.',
    longTerm: 'Integrate your severity rating system with your application vulnerability tracking and remediation workflow for consistent, data-driven prioritization.',
  },
  '16.7': {
    immediate: 'Download and apply the CIS Benchmark hardening guide for your web server and application infrastructure from cisecurity.org.',
    shortTerm: 'Create hardening configuration templates for your application infrastructure and apply them to all existing deployments.',
    longTerm: 'Automate infrastructure configuration using Infrastructure as Code (IaC) tools with built-in security baselines, ensuring every deployment is consistently hardened.',
  },
  '16.8': {
    immediate: 'If your development and production environments share any infrastructure, take immediate steps to separate them. At minimum, use separate accounts or access credentials for each.',
    shortTerm: 'Implement fully separate environments for development, testing, and production with strict access controls preventing cross-environment access.',
    longTerm: 'Automate environment management to ensure production and non-production environments are always properly isolated, with regular audits to verify separation.',
  },
  '16.9': {
    immediate: 'Share a list of the OWASP Top 10 vulnerabilities with your development team and discuss how each applies to your applications.',
    shortTerm: 'Provide formal application security training for all developers, covering the OWASP Top 10, secure coding practices, and security testing techniques.',
    longTerm: 'Implement a security champions program within your development teams and provide ongoing security training as part of professional development.',
  },
  '16.10': {
    immediate: 'Review your most critical application for these basic security design principles: least privilege access, input validation, and error handling that does not expose sensitive information.',
    shortTerm: 'Require security design reviews for all new application features and document the security principles applied in each design decision.',
    longTerm: 'Integrate secure design principles into your architecture review process, with security architects involved in all significant design decisions.',
  },
  '16.11': {
    immediate: 'Review your applications for any custom implementations of security-critical features like authentication, encryption, or session management. These should be replaced with proven libraries.',
    shortTerm: 'Create a list of approved security libraries for common functions (authentication, encryption, input validation) and require their use in all applications.',
    longTerm: 'Maintain a curated catalog of approved security components with regular reviews and updates as better options become available.',
  },
  '16.12': {
    immediate: 'Run a free static code analysis tool (SonarQube Community Edition, GitHub\'s CodeQL, or Bandit for Python) on your most critical application to identify security issues.',
    shortTerm: 'Integrate automated static application security testing (SAST) into your CI/CD pipeline so code is scanned for security issues on every commit.',
    longTerm: 'Implement comprehensive application security testing including SAST, DAST, and SCA in your development pipeline, with security gates preventing high-severity issues from reaching production.',
  },
  '16.13': {
    immediate: 'Schedule an application penetration test with an external security firm for your most critical applications. Many firms offer competitive pricing for small scopes.',
    shortTerm: 'Conduct annual penetration tests of all customer-facing and critical internal applications, with findings tracked to remediation.',
    longTerm: 'Implement a continuous application security testing program combining regular penetration tests with bug bounty programs and automated testing.',
  },
  '16.14': {
    immediate: 'For your next significant application change, spend one hour asking "how could an attacker abuse this feature?" before implementing it.',
    shortTerm: 'Implement threat modeling as a required step for all new application features, using frameworks like STRIDE or PASTA.',
    longTerm: 'Build threat modeling into your formal software development lifecycle and train all architects and senior developers in threat modeling techniques.',
  },
  '17.1': {
    immediate: 'Identify who in your organization is responsible for coordinating a response to a security incident right now. If no one is designated, assign someone today.',
    shortTerm: 'Create a formal incident response team with designated roles and contact information, approved by leadership.',
    longTerm: 'Maintain a trained incident response team with clear authority, documented procedures, and regular practice exercises.',
  },
  '17.2': {
    immediate: 'Create a one-page "security incident contact card" with names and phone numbers for: your incident response lead, your IT provider, your cyber insurance company, and legal counsel. Distribute it to all staff.',
    shortTerm: 'Develop and communicate a comprehensive contact list for security incident reporting and response, including external parties like law enforcement and legal.',
    longTerm: 'Maintain and regularly test your incident response contact information to ensure it is current and all parties understand their roles.',
  },
  '17.3': {
    immediate: 'Send a company-wide communication explaining how to report a security incident: who to call, what email to use, and what information to include.',
    shortTerm: 'Implement a formal incident reporting process with clear escalation paths, severity categories, and documentation requirements.',
    longTerm: 'Operate a mature incident reporting system with metrics on reporting volume, resolution times, and lessons learned feeding back into training.',
  },
  '17.4': {
    immediate: 'Download a free incident response plan template (SANS has a good one) and customize it for your organization this week.',
    shortTerm: 'Develop a comprehensive incident response plan covering detection, containment, eradication, recovery, and post-incident review for the most likely incident types.',
    longTerm: 'Maintain playbooks for each type of incident your organization is most likely to face, updated after each real incident and tabletop exercise.',
  },
  '17.5': {
    immediate: 'Document who plays each role in a security incident: who makes decisions, who does the technical work, who handles communications, who coordinates legal and compliance.',
    shortTerm: 'Formally assign incident response roles with backup personnel for each role. Ensure all designated people are aware of and accept their responsibilities.',
    longTerm: 'Conduct regular incident response exercises that practice role execution and identify gaps or improvements needed.',
  },
  '17.6': {
    immediate: 'Identify at least one out-of-band communication method (personal cell phones, a non-company messaging app) your team would use if your primary systems were compromised in an incident.',
    shortTerm: 'Document and test your incident communication plan, including out-of-band communication channels if primary systems are unavailable.',
    longTerm: 'Maintain pre-provisioned out-of-band communication capabilities and ensure they are tested and ready for use in an emergency.',
  },
  '17.7': {
    immediate: 'Schedule a two-hour tabletop exercise with your leadership team this quarter. Choose a realistic scenario (ransomware is a good choice) and walk through how you would respond.',
    shortTerm: 'Conduct formal incident response tabletop exercises at least annually, covering different scenarios and involving all key stakeholders.',
    longTerm: 'Run both tabletop exercises and live-fire simulations regularly, with increasing complexity and scope, to continuously improve response capabilities.',
  },
  '17.8': {
    immediate: 'After any security incident, however small, spend 30 minutes answering: What happened? How did we detect it? What did we do well? What should we do differently?',
    shortTerm: 'Implement a formal post-incident review process with documented findings and action items tracked to completion.',
    longTerm: 'Use post-incident review findings to continuously improve your security controls, detection capabilities, and response procedures.',
  },
  '17.9': {
    immediate: 'Define right now: what constitutes a "security incident" that requires formal response (as opposed to a routine IT issue)? Write it down and share it with your team.',
    shortTerm: 'Document specific thresholds that define different incident severity levels and the corresponding response actions required at each level.',
    longTerm: 'Regularly review and calibrate your incident thresholds based on experience, ensuring they lead to appropriate and proportionate responses.',
  },
  '18.1': {
    immediate: 'Identify a qualified penetration testing firm and obtain a quote for testing your most critical systems. Even small organizations should conduct annual penetration testing.',
    shortTerm: 'Establish a penetration testing program with defined scope, methodology, frequency, and a process for tracking findings to remediation.',
    longTerm: 'Operate a mature penetration testing program with regular testing, continuous improvement based on findings, and integration with your overall security program.',
  },
  '18.2': {
    immediate: 'Use a free external scanning tool such as Shodan or Qualys FreeScan to see what is visible about your organization from the internet.',
    shortTerm: 'Commission an annual external penetration test by a qualified third party covering all internet-facing systems.',
    longTerm: 'Conduct external penetration tests at least annually, with additional testing after significant infrastructure changes.',
  },
  '18.3': {
    immediate: 'Review the findings from your most recent penetration test (or security assessment). Ensure the highest-severity findings have assigned owners and remediation deadlines.',
    shortTerm: 'Implement a formal process for tracking penetration test findings to remediation, with regular status reviews and accountability.',
    longTerm: 'Demonstrate continuous improvement by tracking and reporting on the reduction in findings severity and count over successive penetration test cycles.',
  },
  '18.4': {
    immediate: 'Test at least one of your key security controls today to verify it is actually working — try to access a blocked website to test web filtering, or test your backup restore process.',
    shortTerm: 'Implement a formal security control validation program that regularly tests controls to verify they are functioning as intended.',
    longTerm: 'Conduct automated and manual validation of security controls continuously, with results feeding into your risk assessment and control improvement processes.',
  },
  '18.5': {
    immediate: 'Commission an internal penetration test or conduct an internal vulnerability assessment to understand how far an attacker could move once inside your network.',
    shortTerm: 'Conduct internal penetration tests at least annually to validate the effectiveness of your internal segmentation and access controls.',
    longTerm: 'Run regular red team exercises that simulate sophisticated, multi-stage attacks to test your detection and response capabilities holistically.',
  },
};

export function getRecommendation(safeguardId) {
  return SAFEGUARD_RECOMMENDATIONS[safeguardId] || {
    immediate: 'Address this safeguard immediately — review current controls and implement basic protections without delay.',
    shortTerm: 'Develop and implement a remediation plan for this safeguard within 90 days, assigning a responsible owner and target completion date.',
    longTerm: 'Maintain this control as an ongoing operational practice, with regular reviews to ensure it remains effective as your organization evolves.',
  };
}
