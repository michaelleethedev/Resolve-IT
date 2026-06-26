import type { Activity, Alert, ChecklistItem, Device, Diagnostic, Employee, PublicUpdate, Technician, Ticket } from "./types";

export const technicians: Technician[] = [
  { id: "tech-1", name: "Maya Lee", role: "Endpoint Support Lead", initials: "ML" },
  { id: "tech-2", name: "Andre Patel", role: "Network Support", initials: "AP" },
  { id: "tech-3", name: "Nina Brooks", role: "Service Desk", initials: "NB" }
];

export const employees: Employee[] = [
  { id: "emp-1", name: "Sarah Johnson", role: "Revenue Operations Manager", department: "Sales Ops", location: "San Francisco, CA", access: ["Okta", "Salesforce", "VPN", "Shared Drive"], setupStatus: "Complete" },
  { id: "emp-2", name: "Marcus Chen", role: "Product Designer", department: "Design", location: "Remote", access: ["Figma", "Slack", "VPN"], setupStatus: "Complete" },
  { id: "emp-3", name: "Priya Rao", role: "Finance Analyst", department: "Finance", location: "Austin, TX", access: ["NetSuite", "Shared Drive", "VPN"], setupStatus: "Needs Review" },
  { id: "emp-4", name: "Theo Martin", role: "Office Coordinator", department: "Workplace", location: "New York, NY", access: ["Google Workspace", "Printer Admin"], setupStatus: "Complete" },
  { id: "emp-5", name: "Elena Garcia", role: "Customer Success Manager", department: "Customer Success", location: "Denver, CO", access: ["Zendesk", "Slack", "VPN"], setupStatus: "Provisioning" },
  { id: "emp-6", name: "Jordan Kim", role: "Engineering Manager", department: "Engineering", location: "Seattle, WA", access: ["GitHub", "AWS", "VPN"], setupStatus: "Complete" }
];

const timeline = [
  { time: "09:00", cpu: 28, memory: 42, network: 22 },
  { time: "09:10", cpu: 35, memory: 48, network: 34 },
  { time: "09:20", cpu: 64, memory: 68, network: 18 },
  { time: "09:30", cpu: 42, memory: 71, network: 12 },
  { time: "09:40", cpu: 31, memory: 63, network: 9 },
  { time: "09:50", cpu: 46, memory: 66, network: 15 }
];

export const devices: Device[] = [
  {
    id: "dev-1",
    model: "Dell Latitude 5430",
    os: "Windows 11 Enterprise 23H2",
    serial: "DL5430-SJ-8F42",
    employeeId: "emp-1",
    lastCheckIn: "2 min ago",
    online: true,
    uptime: "5d 14h",
    healthScore: 72,
    cpu: 46,
    memory: 66,
    disk: 58,
    network: 15,
    battery: 88,
    encryption: "Enabled",
    osUpdate: "Pending",
    vpn: "Disconnected",
    timeline,
    hardware: [
      { label: "CPU", value: "Intel Core i7-1265U" },
      { label: "Memory", value: "16 GB LPDDR5" },
      { label: "Storage", value: "512 GB NVMe SSD" },
      { label: "Warranty", value: "Active until Oct 2027" }
    ],
    software: [
      { label: "VPN Client", value: "GlobalProtect 6.2.4" },
      { label: "EDR", value: "CrowdStrike Falcon 7.17" },
      { label: "Office", value: "Microsoft 365 Apps" },
      { label: "Browser", value: "Chrome 126" }
    ],
    security: [
      { label: "Disk encryption", value: "BitLocker active", status: "Passed" },
      { label: "EDR sensor", value: "Healthy", status: "Passed" },
      { label: "Firewall", value: "Domain profile active", status: "Passed" },
      { label: "VPN posture", value: "Adapter disconnected", status: "Failed" }
    ],
    events: [
      { time: "10:46", message: "VPN service entered stopped state", severity: "Critical" },
      { time: "10:31", message: "DNS resolution failed for gateway resolveit-vpn.company", severity: "High" },
      { time: "09:58", message: "Windows update KB5039211 pending reboot", severity: "Medium" }
    ],
    networkProfile: { ip: "10.42.18.77", link: "Wi-Fi 6 - employee home network", gateway: "10.42.18.1", dns: ["10.8.0.12", "10.8.0.13"] },
    securityProfile: { antivirus: "CrowdStrike Falcon healthy", firewall: "Windows Defender Firewall enabled", patchStatus: "One reboot pending", compliance: "At risk: VPN posture failed", lastScan: "Today 09:44" }
  },
  {
    id: "dev-2",
    model: "MacBook Pro 14",
    os: "macOS Sonoma 14.5",
    serial: "MBP14-MC-3A19",
    employeeId: "emp-2",
    lastCheckIn: "7 min ago",
    online: true,
    uptime: "2d 8h",
    healthScore: 86,
    cpu: 34,
    memory: 52,
    disk: 71,
    network: 24,
    battery: 74,
    encryption: "Enabled",
    osUpdate: "Current",
    vpn: "Connected",
    timeline,
    hardware: [
      { label: "CPU", value: "Apple M3 Pro" },
      { label: "Memory", value: "18 GB unified" },
      { label: "Storage", value: "1 TB SSD" },
      { label: "Warranty", value: "AppleCare active" }
    ],
    software: [
      { label: "Design tools", value: "Figma, Adobe CC" },
      { label: "MDM", value: "Jamf enrolled" },
      { label: "Browser", value: "Chrome 126" },
      { label: "VPN Client", value: "GlobalProtect 6.2.4" }
    ],
    security: [
      { label: "FileVault", value: "Enabled", status: "Passed" },
      { label: "EDR sensor", value: "Healthy", status: "Passed" },
      { label: "OS patch", value: "Current", status: "Passed" }
    ],
    events: [
      { time: "10:24", message: "Memory pressure elevated during video export", severity: "Medium" }
    ],
    networkProfile: { ip: "10.50.4.121", link: "Wi-Fi 6E - office secure", gateway: "10.50.4.1", dns: ["10.8.0.12", "10.8.0.13"] },
    securityProfile: { antivirus: "CrowdStrike Falcon healthy", firewall: "macOS application firewall enabled", patchStatus: "Current", compliance: "Compliant", lastScan: "Today 08:12" }
  },
  {
    id: "dev-3",
    model: "HP EliteBook 840",
    os: "Windows 11 Enterprise 23H2",
    serial: "HP840-PR-77Q1",
    employeeId: "emp-3",
    lastCheckIn: "18 min ago",
    online: true,
    uptime: "8d 2h",
    healthScore: 64,
    cpu: 58,
    memory: 82,
    disk: 81,
    network: 21,
    battery: 63,
    encryption: "Enabled",
    osUpdate: "Overdue",
    vpn: "Degraded",
    timeline,
    hardware: [
      { label: "CPU", value: "Intel Core i5-1245U" },
      { label: "Memory", value: "16 GB DDR4" },
      { label: "Storage", value: "256 GB NVMe SSD" },
      { label: "Warranty", value: "Expires in 42 days" }
    ],
    software: [
      { label: "VPN Client", value: "GlobalProtect 6.1.1" },
      { label: "Finance apps", value: "NetSuite connector" },
      { label: "EDR", value: "CrowdStrike Falcon 7.17" }
    ],
    security: [
      { label: "Disk encryption", value: "BitLocker active", status: "Passed" },
      { label: "OS patch", value: "2 updates overdue", status: "Warning" }
    ],
    events: [
      { time: "09:12", message: "Shared drive token expired", severity: "High" }
    ],
    networkProfile: { ip: "10.44.9.82", link: "Ethernet dock", gateway: "10.44.9.1", dns: ["10.8.0.12", "10.8.0.13"] },
    securityProfile: { antivirus: "CrowdStrike Falcon healthy", firewall: "Domain firewall enabled", patchStatus: "Two updates overdue", compliance: "Needs patch remediation", lastScan: "Yesterday 17:09" }
  }
];

export const tickets: Ticket[] = [
  { id: "INC-4821", title: "VPN not connecting", description: "GlobalProtect accepts Okta push, then drops before connecting to the corporate gateway.", category: "Network and VPN", employeeId: "emp-1", department: "Sales Ops", priority: "Critical", status: "In Progress", submittedAgo: "18 min", submittedMinutes: 18, slaMinutes: 42, assignedTechnicianId: "tech-1", deviceId: "dev-1", deviceType: "Laptop", publicSummary: "IT is checking the VPN client, DNS, and adapter state.", createdAt: "Today 10:30", preferredContact: "Slack" },
  { id: "INC-4820", title: "Laptop performance slow", description: "Large design files are slow to open and video calls stutter.", category: "Hardware", employeeId: "emp-2", department: "Design", priority: "Medium", status: "New", submittedAgo: "31 min", submittedMinutes: 31, slaMinutes: 214, assignedTechnicianId: "tech-3", deviceId: "dev-2", deviceType: "Laptop", publicSummary: "Ticket received and waiting for triage.", createdAt: "Today 10:17", preferredContact: "Slack" },
  { id: "INC-4819", title: "Cannot access files", description: "Finance shared drive prompts for sign-in repeatedly.", category: "Access Request", employeeId: "emp-3", department: "Finance", priority: "High", status: "Waiting on User", submittedAgo: "46 min", submittedMinutes: 46, slaMinutes: 74, assignedTechnicianId: "tech-2", deviceId: "dev-3", deviceType: "Laptop", publicSummary: "IT is waiting for the employee to confirm MFA reset.", createdAt: "Today 10:02", preferredContact: "Email" },
  { id: "INC-4818", title: "Printer offline", description: "New York office printer shows offline after toner replacement.", category: "Hardware", employeeId: "emp-4", department: "Workplace", priority: "Low", status: "New", submittedAgo: "1h 12m", submittedMinutes: 72, slaMinutes: 460, assignedTechnicianId: "tech-3", deviceId: "dev-1", deviceType: "Printer", publicSummary: "Ticket received and waiting for triage.", createdAt: "Today 09:36", preferredContact: "Email" },
  { id: "INC-4817", title: "Outlook not syncing", description: "Inbox is current on mobile but desktop client is behind by 40 minutes.", category: "Email and Collaboration", employeeId: "emp-5", department: "Customer Success", priority: "Medium", status: "In Progress", submittedAgo: "1h 26m", submittedMinutes: 86, slaMinutes: 158, assignedTechnicianId: "tech-1", deviceId: "dev-2", deviceType: "Laptop", publicSummary: "IT is rebuilding the local mail profile.", createdAt: "Today 09:22", preferredContact: "Slack" },
  { id: "INC-4816", title: "Wi-Fi keeps dropping", description: "Drops from office Wi-Fi several times per hour during calls.", category: "Network and VPN", employeeId: "emp-6", department: "Engineering", priority: "High", status: "Assigned", submittedAgo: "2h 8m", submittedMinutes: 128, slaMinutes: 52, assignedTechnicianId: "tech-2", deviceId: "dev-3", deviceType: "Laptop", publicSummary: "Network support has been assigned.", createdAt: "Today 08:40", preferredContact: "Slack" }
];

export const diagnostics: Diagnostic[] = [
  { id: "internet", label: "Internet connectivity", status: "Passed", detail: "Public internet reachable with normal latency.", recommendation: "Continue to VPN-specific checks." },
  { id: "service", label: "VPN service status", status: "Warning", detail: "GlobalProtect service is running but reported one restart.", recommendation: "Restart VPN service if adapter reset does not recover." },
  { id: "adapter", label: "VPN adapter state", status: "Failed", detail: "Virtual adapter driver reports stopped.", recommendation: "Reset the VPN adapter." },
  { id: "dns", label: "DNS resolution", status: "Failed", detail: "VPN gateway hostname does not resolve from current profile.", recommendation: "Clear DNS cache and retest gateway lookup." },
  { id: "auth", label: "Authentication status", status: "Passed", detail: "Okta push accepted and user token is valid.", recommendation: "No credential reset needed yet." },
  { id: "gateway", label: "Gateway reachability", status: "Warning", detail: "Gateway reachable intermittently after DNS fallback.", recommendation: "Retest after adapter and DNS remediation." },
  { id: "client", label: "Client version", status: "Passed", detail: "GlobalProtect 6.2.4 meets required version.", recommendation: "No client update required." },
  { id: "policy", label: "Security policy compliance", status: "Passed", detail: "Device encryption, EDR, and firewall posture passed.", recommendation: "Proceed with connectivity remediation." }
];

export const checklist: ChecklistItem[] = [
  { id: "auth", label: "Verify user authentication", required: true },
  { id: "internet", label: "Confirm internet connectivity", required: true },
  { id: "service", label: "Check VPN service status", required: true },
  { id: "diagnostics", label: "Run VPN diagnostics", required: true },
  { id: "adapter", label: "Reset VPN adapter", required: true },
  { id: "dns", label: "Flush DNS cache", required: true },
  { id: "test", label: "Test connectivity", required: true },
  { id: "confirm", label: "Confirm resolution with user", required: true },
  { id: "document", label: "Document and close ticket", required: true }
];

export const alerts: Alert[] = [
  { id: "alert-1", title: "VPN disconnected", detail: "Sarah Johnson cannot reach the corporate gateway.", severity: "Critical", read: false, time: "Now" },
  { id: "alert-2", title: "High memory usage", detail: "MacBook Pro 14 averaged 82% memory pressure.", severity: "Medium", read: false, time: "8 min" },
  { id: "alert-3", title: "Software update available", detail: "Windows update pending on Dell Latitude 5430.", severity: "Low", read: false, time: "13 min" },
  { id: "alert-4", title: "SLA approaching breach", detail: "INC-4816 has 52 minutes remaining.", severity: "High", read: true, time: "21 min" }
];

export const activityLog: Activity[] = [
  { id: "act-1", time: "10:48", actor: "Maya Lee", message: "Opened active support session for INC-4821." },
  { id: "act-2", time: "10:43", actor: "System", message: "VPN Adapter Check failed on Dell Latitude 5430." },
  { id: "act-3", time: "10:35", actor: "Sarah Johnson", message: "Confirmed home internet is working." }
];

export const publicUpdates: PublicUpdate[] = [
  { id: "pub-1", ticketId: "INC-4821", author: "Maya Lee", message: "We are checking VPN service health and network settings on your laptop.", createdAt: "10:42" },
  { id: "pub-2", ticketId: "INC-4819", author: "Andre Patel", message: "Please confirm when you are available to retry shared drive access.", createdAt: "10:18" }
];
