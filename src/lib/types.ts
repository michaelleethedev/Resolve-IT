export type Priority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus = "New" | "Assigned" | "In Progress" | "Waiting on User" | "Resolved" | "Closed";
export type DiagnosticStatus = "Passed" | "Warning" | "Failed" | "Running";
export type IssueCategory = "Account and Password" | "Network and VPN" | "Hardware" | "Software" | "Access Request" | "Email and Collaboration" | "Mobile Device" | "Other";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  employeeId: string;
  department: string;
  priority: Priority;
  status: TicketStatus;
  submittedAgo: string;
  submittedMinutes: number;
  slaMinutes: number;
  assignedTechnicianId: string;
  deviceId: string;
  deviceType: string;
  publicSummary: string;
  resolutionSummary?: string;
  resolutionTimestamp?: string;
  reopenedAt?: string;
  createdAt: string;
  preferredContact?: "Slack" | "Email" | "Phone";
  attachmentName?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  access: string[];
  setupStatus: "Complete" | "Needs Review" | "Provisioning";
};

export type Device = {
  id: string;
  model: string;
  os: string;
  serial: string;
  employeeId: string;
  lastCheckIn: string;
  online: boolean;
  uptime: string;
  healthScore: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  battery: number;
  encryption: "Enabled" | "Disabled";
  osUpdate: "Current" | "Pending" | "Overdue";
  vpn: "Connected" | "Disconnected" | "Degraded";
  timeline: { time: string; cpu: number; memory: number; network: number }[];
  hardware: { label: string; value: string }[];
  software: { label: string; value: string }[];
  security: { label: string; value: string; status: DiagnosticStatus }[];
  events: { time: string; message: string; severity: Priority | "Info" }[];
  networkProfile: { ip: string; link: string; gateway: string; dns: string[] };
  securityProfile: { antivirus: string; firewall: string; patchStatus: string; compliance: string; lastScan: string };
};

export type Technician = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

export type Alert = {
  id: string;
  title: string;
  detail: string;
  severity: Priority;
  read: boolean;
  time: string;
};

export type Diagnostic = {
  id: string;
  label: string;
  status: DiagnosticStatus;
  detail: string;
  recommendation: string;
};

export type Activity = {
  id: string;
  time: string;
  actor: string;
  message: string;
};

export type Note = {
  id: string;
  ticketId: string;
  technician: string;
  body: string;
  updatedAt: string;
};

export type PublicUpdate = {
  id: string;
  ticketId: string;
  author: string;
  message: string;
  createdAt: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};
