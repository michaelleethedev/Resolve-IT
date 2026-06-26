"use client";

import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Bell,
  Check,
  ChevronDown,
  CircleStop,
  ClipboardCheck,
  Clock,
  Command,
  Cpu,
  FileBox,
  FileText,
  Gauge,
  HardDrive,
  Headphones,
  Laptop,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Monitor,
  Network,
  Play,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  UserRound,
  Wifi,
  Wrench
} from "lucide-react";
import { useMemo, useState } from "react";
import { CommandPalette } from "@/components/command-palette";
import { devices, employees, technicians } from "@/lib/mock-data";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { cn, priorityClass, statusClass } from "@/lib/utils";
import type { Device, Priority, TicketStatus } from "@/lib/types";

const deviceTabs = ["Overview", "Hardware", "Software", "Network", "Security", "Event Log"] as const;
type DeviceTab = (typeof deviceTabs)[number];

const actions = [
  { label: "Remote Control", icon: Monitor },
  { label: "Restart Device", icon: RefreshCw },
  { label: "Run Command", icon: Terminal },
  { label: "File Transfer", icon: FileBox },
  { label: "Run Diagnostics", icon: Gauge },
  { label: "Reset VPN Adapter", icon: Wifi },
  { label: "Clear DNS Cache", icon: Network },
  { label: "Restart VPN Service", icon: Play },
  { label: "Reset Credentials", icon: Lock },
  { label: "Escalate Ticket", icon: Headphones }
];

const toolbarItems = [
  { label: "Screen Share", icon: Monitor },
  { label: "Take Control", icon: Command },
  { label: "Chat", icon: MessageSquare },
  { label: "Files", icon: FileBox },
  { label: "Terminal", icon: Terminal },
  { label: "System Info", icon: Cpu },
  { label: "End Session", icon: CircleStop }
];

export default function WorkspacePage() {
  const store = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatus] = useState<TicketStatus | "All">("All");
  const [sort, setSort] = useState<"SLA" | "Age">("SLA");
  const [tab, setTab] = useState<DeviceTab>("Overview");
  const [noteText, setNoteText] = useState("");
  const [publicText, setPublicText] = useState("");
  const [resolutionText, setResolutionText] = useState("");
  const [editingNote, setEditingNote] = useState<string | undefined>();
  const [supportPanel, setSupportPanel] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "reset" | "clear" | "vpn" | "newEmployee" | "compliance">(null);
  const [guidedStep, setGuidedStep] = useState<number | null>(null);

  const selectedDevice = devices.find((device) => device.id === store.selectedTicket.deviceId) ?? devices[0];

  const filteredTickets = useMemo(() => {
    return [...store.tickets]
      .filter((ticket) => {
        const employee = employees.find((item) => item.id === ticket.employeeId);
        const matchesQuery = `${ticket.id} ${ticket.title} ${employee?.name} ${ticket.department}`.toLowerCase().includes(query.toLowerCase());
        const matchesPriority = priority === "All" || ticket.priority === priority;
        const matchesStatus = status === "All" || ticket.status === status;
        return matchesQuery && matchesPriority && matchesStatus;
      })
      .sort((a, b) => (sort === "SLA" ? a.slaMinutes - b.slaMinutes : b.submittedMinutes - a.submittedMinutes));
  }, [priority, query, sort, status, store.tickets]);

  function submitNote() {
    if (!noteText.trim()) return;
    store.addOrUpdateNote(noteText.trim(), editingNote);
    setNoteText("");
    setEditingNote(undefined);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-ink-950 text-slate-100">
      <CommandPalette onSelectTicket={store.setSelectedTicketId} onRunAction={store.runAction} />
      <div className="flex min-h-screen">
        <NavRail />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-16">
          <TopBar unreadAlerts={store.unreadAlerts} />
          <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[330px_minmax(0,1fr)_330px] xl:grid-cols-[360px_minmax(0,1fr)_360px]">
            <section className="space-y-3 lg:overflow-y-auto">
              <ActiveSession ticket={store.selectedTicket} employeeName={store.selectedEmployee.name} deviceName={selectedDevice.model} canResolve={store.completedRequired} missingCount={store.missingChecklist.length} onResolve={() => setSupportPanel("Resolve Ticket")} onPanel={setSupportPanel} />
              <TicketQueue
                tickets={filteredTickets}
                selectedId={store.selectedTicket.id}
                query={query}
                priority={priority}
                status={status}
                sort={sort}
                onQuery={setQuery}
                onPriority={setPriority}
                onStatus={setStatus}
                onSort={setSort}
                onSelect={store.setSelectedTicketId}
              />
            </section>

            <section className="min-w-0 space-y-3">
              <WorkflowControls ticket={store.selectedTicket} onStatus={store.updateTicketStatus} onPriority={store.updatePriority} onAssignment={store.updateAssignment} onReopen={store.reopenTicket} />
              <DeviceInspector device={selectedDevice} tab={tab} onTab={setTab} employeeName={store.selectedEmployee.name} ticketId={store.selectedTicket.id} />
              <Diagnostics diagnostics={store.diagnostics} />
            </section>

            <aside className="space-y-3 lg:overflow-y-auto">
              <DemoControls onConfirm={setConfirmAction} onStartGuide={() => setGuidedStep(0)} />
              <QuickActions runningAction={store.runningAction} onRun={store.runAction} />
              <Checklist checklist={store.checklist} done={store.checklistDone} canResolve={store.completedRequired} validation={store.validation} onToggle={store.toggleChecklist} onCompleteAll={store.completeRequiredChecklist} onResolve={() => setSupportPanel("Resolve Ticket")} />
              <Notes
                notes={store.notes}
                noteText={noteText}
                editingNote={editingNote}
                onText={setNoteText}
                onSubmit={submitNote}
                onEdit={(note) => {
                  setEditingNote(note.id);
                  setNoteText(note.body);
                }}
              />
              <PublicUpdates updates={store.publicUpdates} value={publicText} onText={setPublicText} onSubmit={() => { store.addPublicUpdate(store.selectedTicket.id, publicText); setPublicText(""); }} />
              <Alerts alerts={store.alerts} onRead={store.markAlertRead} />
              <Activity items={store.activity} />
            </aside>
          </div>
        </div>
      </div>

      <RemoteToolbar onOpen={setSupportPanel} />
      <MobileBottomNav />
      {store.toast && <Toast message={store.toast} onClose={() => store.setToast(null)} />}
      {supportPanel === "Resolve Ticket" ? (
        <ResolveModal
          value={resolutionText}
          validation={store.validation}
          canResolve={store.completedRequired}
          missing={store.missingChecklist.map((item) => item.label)}
          onText={setResolutionText}
          onClose={() => setSupportPanel(null)}
          onResolve={() => {
            if (store.resolveTicket(resolutionText)) {
              setResolutionText("");
              setSupportPanel(null);
            }
          }}
        />
      ) : supportPanel && <SupportModal title={supportPanel} onClose={() => setSupportPanel(null)} />}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction === "reset") store.resetDemoData();
            if (confirmAction === "clear") store.clearLocalData();
            if (confirmAction === "vpn") store.loadScenario("vpn");
            if (confirmAction === "newEmployee") store.loadScenario("newEmployee");
            if (confirmAction === "compliance") store.loadScenario("compliance");
            setConfirmAction(null);
          }}
        />
      )}
      {guidedStep !== null && <GuidedDemo step={guidedStep} onNext={() => setGuidedStep(guidedStep >= 7 ? null : guidedStep + 1)} onClose={() => setGuidedStep(null)} />}
    </main>
  );
}

function NavRail() {
  const links = [
    { href: "/workspace", icon: LayoutDashboard, label: "Workspace" },
    { href: "/tickets", icon: ClipboardCheck, label: "Tickets" },
    { href: "/devices", icon: Laptop, label: "Devices" },
    { href: "/employees", icon: UserRound, label: "Employees" },
    { href: "/employee", icon: Smartphone, label: "Employee mode" }
  ];
  return (
    <nav className="hidden w-16 shrink-0 border-r border-white/10 bg-black/24 py-3 lg:flex lg:flex-col lg:items-center lg:gap-3">
      <Link href="/" className="mb-2 grid h-11 w-11 place-items-center rounded-lg border border-signal-cyan/30 bg-signal-cyan/10 text-lg font-black text-white shadow-glow">R</Link>
      {links.map((link) => (
        <Link key={link.label} href={link.href} aria-label={link.label} title={link.label} className="grid h-11 w-11 place-items-center rounded-md border border-transparent text-slate-400 hover:border-signal-cyan/25 hover:bg-signal-cyan/10 hover:text-cyan-100">
          <link.icon className="h-5 w-5" />
        </Link>
      ))}
      <button aria-label="Settings" className="mt-auto grid h-11 w-11 place-items-center rounded-md text-slate-500 hover:bg-white/5 hover:text-white">
        <Settings className="h-5 w-5" />
      </button>
    </nav>
  );
}

function TopBar({ unreadAlerts }: { unreadAlerts: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/90 px-3 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-signal-cyan/30 bg-signal-cyan/10 font-black text-white">R</span>
        </Link>
        <div className="hidden min-w-40 md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ResolveIT</p>
          <p className="text-sm font-bold text-white">Technician Workspace</p>
        </div>
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none" placeholder="Search tickets, employees, devices, or run a command..." />
          <span className="hidden rounded border border-white/10 px-2 py-1 text-[11px] text-slate-400 sm:inline">Cmd/Ctrl + K</span>
        </div>
        <Link href="/employee" className="hidden h-10 items-center rounded-md border border-signal-cyan/25 bg-signal-cyan/10 px-3 text-xs font-bold text-cyan-100 hover:bg-signal-cyan/15 sm:flex">Employee</Link>
        <button className="relative grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04]" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadAlerts > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-signal-red px-1 text-[10px] font-bold">{unreadAlerts}</span>}
        </button>
        <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 md:flex">
          <span className="grid h-7 w-7 place-items-center rounded bg-signal-blue text-xs font-bold">ML</span>
          <span className="text-xs text-slate-300">Maya Lee</span>
          <ChevronDown className="h-3 w-3 text-slate-500" />
        </div>
      </div>
    </header>
  );
}

function ActiveSession({ ticket, employeeName, deviceName, canResolve, missingCount, onResolve, onPanel }: { ticket: ReturnType<typeof useWorkspaceStore>["selectedTicket"]; employeeName: string; deviceName: string; canResolve: boolean; missingCount: number; onResolve: () => void; onPanel: (title: string) => void }) {
  return (
    <section className="glass-panel rounded-lg p-4 shadow-redGlow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-cyan">Active Session</p>
          <h1 className="mt-1 text-xl font-bold text-white">{ticket.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{employeeName} · {deviceName}</p>
        </div>
        <span className={cn("rounded-md border px-2 py-1 text-xs font-bold", priorityClass(ticket.priority))}>{ticket.priority}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-white/10 bg-black/18 p-3">
          <p className="text-xs text-slate-500">SLA countdown</p>
          <p className="mt-1 flex items-center gap-2 font-bold text-orange-100"><Clock className="h-4 w-4" /> {ticket.slaMinutes} min</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/18 p-3">
          <p className="text-xs text-slate-500">Ticket</p>
          <p className="mt-1 font-bold text-white">{ticket.id} · {ticket.status}</p>
        </div>
      </div>
      {!canResolve && <p className="mt-3 rounded-md border border-signal-orange/25 bg-signal-orange/10 p-2 text-xs text-orange-100">{missingCount} required step(s) remain before resolution.</p>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => onPanel("Session Details")} className="h-11 rounded-md border border-white/10 bg-white/[0.05] text-sm font-semibold hover:border-signal-cyan/30">View</button>
        <button onClick={() => onPanel("End Session")} className="h-11 rounded-md border border-signal-red/25 bg-signal-red/10 text-sm font-semibold text-red-100 hover:border-signal-red/45">End</button>
        <button onClick={onResolve} disabled={!canResolve} className="h-11 rounded-md bg-signal-green/90 text-sm font-bold text-ink-950 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500">Resolve Ticket</button>
      </div>
    </section>
  );
}

function WorkflowControls({ ticket, onStatus, onPriority, onAssignment, onReopen }: { ticket: ReturnType<typeof useWorkspaceStore>["selectedTicket"]; onStatus: (id: string, status: TicketStatus) => void; onPriority: (id: string, priority: Priority) => void; onAssignment: (id: string, technicianId: string) => void; onReopen: (id: string) => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-white">Ticket Workflow</h2>
          <p className="text-xs text-slate-500">Lifecycle, owner, priority, and customer-facing state.</p>
        </div>
        {ticket.status === "Resolved" && <button onClick={() => onReopen(ticket.id)} className="h-10 rounded-md border border-signal-cyan/30 px-3 text-xs font-bold text-cyan-100">Reopen</button>}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-slate-400">Status
          <select value={ticket.status} onChange={(event) => onStatus(ticket.id, event.target.value as TicketStatus)} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-ink-850 px-2 text-sm text-white">
            {["New", "Assigned", "In Progress", "Waiting on User", "Resolved", "Closed"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Priority
          <select value={ticket.priority} onChange={(event) => onPriority(ticket.id, event.target.value as Priority)} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-ink-850 px-2 text-sm text-white">
            {["Critical", "High", "Medium", "Low"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Technician
          <select value={ticket.assignedTechnicianId} onChange={(event) => onAssignment(ticket.id, event.target.value)} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-ink-850 px-2 text-sm text-white">
            {technicians.map((tech) => <option value={tech.id} key={tech.id}>{tech.name}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}

function TicketQueue(props: {
  tickets: ReturnType<typeof useWorkspaceStore>["tickets"];
  selectedId: string;
  query: string;
  priority: Priority | "All";
  status: TicketStatus | "All";
  sort: "SLA" | "Age";
  onQuery: (value: string) => void;
  onPriority: (value: Priority | "All") => void;
  onStatus: (value: TicketStatus | "All") => void;
  onSort: (value: "SLA" | "Age") => void;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="glass-panel rounded-lg p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-white">Ticket Queue</h2>
        <span className="text-xs text-slate-500">{props.tickets.length} visible</span>
      </div>
      <div className="grid gap-2">
        <input value={props.query} onChange={(event) => props.onQuery(event.target.value)} placeholder="Search queue" className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-slate-500" />
        <div className="grid grid-cols-3 gap-2">
          <select value={props.priority} onChange={(event) => props.onPriority(event.target.value as Priority | "All")} className="h-10 rounded-md border border-white/10 bg-ink-850 px-2 text-xs text-white">
            {["All", "Critical", "High", "Medium", "Low"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={props.status} onChange={(event) => props.onStatus(event.target.value as TicketStatus | "All")} className="h-10 rounded-md border border-white/10 bg-ink-850 px-2 text-xs text-white">
            {["All", "New", "Assigned", "In Progress", "Waiting on User", "Resolved", "Closed"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={props.sort} onChange={(event) => props.onSort(event.target.value as "SLA" | "Age")} className="h-10 rounded-md border border-white/10 bg-ink-850 px-2 text-xs text-white">
            <option>SLA</option><option>Age</option>
          </select>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {props.tickets.map((ticket) => {
          const employee = employees.find((item) => item.id === ticket.employeeId);
          const technician = technicians.find((item) => item.id === ticket.assignedTechnicianId);
          return (
            <button key={ticket.id} onClick={() => props.onSelect(ticket.id)} className={cn("w-full rounded-md border p-3 text-left transition hover:border-signal-cyan/35", props.selectedId === ticket.id ? "border-signal-cyan/45 bg-signal-cyan/10 shadow-glow" : "border-white/10 bg-white/[0.035]")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-100">{ticket.id}</span>
                <span className={cn("rounded border px-2 py-0.5 text-[11px] font-bold", priorityClass(ticket.priority))}>{ticket.priority}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-white">{ticket.title}</p>
              <p className="mt-1 text-xs text-slate-400">{employee?.name} · {ticket.department} · {ticket.deviceType}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={cn("rounded border px-2 py-0.5", statusClass(ticket.status))}>{ticket.status}</span>
                <span className="text-slate-500">{ticket.submittedAgo} · {technician?.initials}</span>
              </div>
            </button>
          );
        })}
        {props.tickets.length === 0 && <p className="rounded-md border border-white/10 p-6 text-center text-sm text-slate-400">No tickets match the current filters.</p>}
      </div>
    </section>
  );
}

function DeviceInspector({ device, tab, onTab, employeeName, ticketId }: { device: Device; tab: DeviceTab; onTab: (tab: DeviceTab) => void; employeeName: string; ticketId: string }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-signal-cyan/25 bg-signal-cyan/10 shadow-glow">
            <Laptop className="h-10 w-10 text-signal-cyan" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Device Inspector</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{device.model}</h2>
            <p className="mt-1 text-sm text-slate-400">{employeeName} · {device.os}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={device.online ? "green" : "red"}>{device.online ? "Online" : "Offline"}</Badge>
              <Badge tone={device.vpn === "Disconnected" ? "red" : "green"}>VPN {device.vpn}</Badge>
              <Badge tone={device.osUpdate === "Current" ? "green" : "orange"}>{device.osUpdate} updates</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 xl:w-72">
          <Metric label="Health" value={`${device.healthScore}%`} tone="cyan" />
          <Metric label="Uptime" value={device.uptime} tone="green" />
          <Metric label="Check-in" value={device.lastCheckIn} tone="blue" />
        </div>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {deviceTabs.map((item) => (
          <button key={item} onClick={() => onTab(item)} className={cn("h-10 shrink-0 rounded-md border px-3 text-xs font-bold", tab === item ? "border-signal-cyan/40 bg-signal-cyan/12 text-cyan-100" : "border-white/10 bg-white/[0.035] text-slate-400 hover:text-white")}>{item}</button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "Overview" && <DeviceOverview device={device} ticketId={ticketId} />}
        {tab === "Hardware" && <KeyValueGrid items={device.hardware} />}
        {tab === "Software" && <KeyValueGrid items={device.software} />}
        {tab === "Network" && <NetworkPanel device={device} />}
        {tab === "Security" && <SecurityPanel device={device} />}
        {tab === "Event Log" && <EventLog device={device} />}
      </div>
    </section>
  );
}

function DeviceOverview({ device, ticketId }: { device: Device; ticketId: string }) {
  const metrics = [
    { label: "CPU usage", value: device.cpu, icon: Cpu },
    { label: "Memory usage", value: device.memory, icon: Gauge },
    { label: "Disk usage", value: device.disk, icon: HardDrive },
    { label: "Network activity", value: device.network, icon: Network },
    { label: "Battery health", value: device.battery, icon: BatteryIcon },
    { label: "Encryption", value: device.encryption === "Enabled" ? 100 : 0, icon: Lock }
  ];
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_280px]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-white/10 bg-black/18 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{metric.label}</p>
              <metric.icon className="h-4 w-4 text-signal-cyan" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{metric.label === "Encryption" ? device.encryption : `${metric.value}%`}</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-signal-cyan" style={{ width: `${metric.value}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-white/10 bg-black/18 p-3">
        <p className="mb-2 text-xs text-slate-400">Resource trend · Active ticket {ticketId}</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={device.timeline}>
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Area type="monotone" dataKey="memory" stroke="#30d5ff" fill="#30d5ff" fillOpacity={0.14} />
              <Area type="monotone" dataKey="cpu" stroke="#2ee88f" fill="#2ee88f" fillOpacity={0.08} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BatteryIcon(props: React.ComponentProps<typeof Gauge>) {
  return <Gauge {...props} />;
}

function KeyValueGrid({ items }: { items: { label: string; value: string }[] }) {
  return <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <div key={item.label} className="rounded-md border border-white/10 bg-black/18 p-3"><p className="text-xs text-slate-500">{item.label}</p><p className="mt-1 text-sm font-semibold text-white">{item.value}</p></div>)}</div>;
}

function NetworkPanel({ device }: { device: Device }) {
  return <KeyValueGrid items={[{ label: "IP address", value: device.networkProfile.ip }, { label: "Link status", value: device.networkProfile.link }, { label: "VPN client status", value: device.vpn }, { label: "Gateway", value: device.networkProfile.gateway }, { label: "DNS servers", value: device.networkProfile.dns.join(", ") }, { label: "Recent connectivity", value: device.vpn === "Disconnected" ? "Gateway lookup failed twice in 15 minutes" : "No recent connectivity failures" }]} />;
}

function SecurityPanel({ device }: { device: Device }) {
  const profile = [
    { label: "Antivirus", value: device.securityProfile.antivirus, status: "Passed" as const },
    { label: "Firewall", value: device.securityProfile.firewall, status: "Passed" as const },
    { label: "Patch status", value: device.securityProfile.patchStatus, status: device.osUpdate === "Current" ? "Passed" as const : "Warning" as const },
    { label: "Compliance", value: device.securityProfile.compliance, status: device.securityProfile.compliance === "Compliant" ? "Passed" as const : "Warning" as const },
    { label: "Last security scan", value: device.securityProfile.lastScan, status: "Passed" as const }
  ];
  return <div className="grid gap-2">{[...device.security, ...profile].map((item) => <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/18 p-3"><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-slate-400">{item.value}</p></div><span className={cn("rounded border px-2 py-1 text-xs", statusClass(item.status))}>{item.status}</span></div>)}</div>;
}

function EventLog({ device }: { device: Device }) {
  const [filter, setFilter] = useState<Priority | "Info" | "All">("All");
  const [search, setSearch] = useState("");
  const events = device.events.filter((event) => (filter === "All" || event.severity === filter) && event.message.toLowerCase().includes(search.toLowerCase()));
  return <div><div className="mb-3 grid gap-2 sm:grid-cols-[1fr_160px]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search event log" className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white" /><select value={filter} onChange={(event) => setFilter(event.target.value as Priority | "Info" | "All")} className="h-10 rounded-md border border-white/10 bg-ink-850 px-2 text-sm text-white">{["All", "Critical", "High", "Medium", "Low", "Info"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="grid gap-2">{events.map((event) => <div key={`${event.time}-${event.message}`} className="rounded-md border border-white/10 bg-black/18 p-3"><div className="flex items-center justify-between"><span className="font-mono text-xs text-slate-500">{event.time}</span><span className={cn("rounded border px-2 py-0.5 text-[11px]", event.severity === "Info" ? "border-white/10 text-slate-400" : priorityClass(event.severity))}>{event.severity}</span></div><p className="mt-2 text-sm text-slate-200">{event.message}</p></div>)}</div></div>;
}

function Diagnostics({ diagnostics }: { diagnostics: ReturnType<typeof useWorkspaceStore>["diagnostics"] }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-white">Recent Diagnostics</h2><span className="text-xs text-slate-500">Simulated checks</span></div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {diagnostics.map((item) => <div key={item.id} className="rounded-md border border-white/10 bg-black/18 p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-white">{item.label}</p><span className={cn("rounded border px-2 py-0.5 text-[11px]", statusClass(item.status))}>{item.status}</span></div><p className="mt-2 text-xs text-slate-400">{item.detail}</p><p className="mt-2 text-[11px] text-cyan-100">Next: {item.recommendation}</p></div>)}
      </div>
    </section>
  );
}

function QuickActions({ runningAction, onRun }: { runningAction: string | null; onRun: (action: string) => void }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="mb-3 font-bold text-white">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button key={action.label} onClick={() => onRun(action.label)} disabled={!!runningAction} className="min-h-12 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:border-signal-cyan/35 disabled:cursor-wait disabled:opacity-60">
            <span className="mb-1 flex items-center gap-2"><action.icon className="h-4 w-4 text-signal-cyan" />{runningAction === action.label ? "Running..." : action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DemoControls({ onConfirm, onStartGuide }: { onConfirm: (action: "reset" | "clear" | "vpn" | "newEmployee" | "compliance") => void; onStartGuide: () => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-white">Demo Controls</h2>
        <span className="rounded border border-signal-cyan/25 bg-signal-cyan/10 px-2 py-1 text-[11px] text-cyan-100">Demo Environment</span>
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-400">Fictional users and devices. Remote actions are simulated. No real systems are accessed; state is stored locally in this browser.</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onStartGuide} className="min-h-11 rounded-md bg-signal-blue px-2 text-xs font-bold text-white">Start Guided Demo</button>
        <button onClick={() => onConfirm("vpn")} className="min-h-11 rounded-md border border-white/10 px-2 text-xs text-slate-200">VPN Scenario</button>
        <button onClick={() => onConfirm("newEmployee")} className="min-h-11 rounded-md border border-white/10 px-2 text-xs text-slate-200">New Employee</button>
        <button onClick={() => onConfirm("compliance")} className="min-h-11 rounded-md border border-white/10 px-2 text-xs text-slate-200">Compliance</button>
        <button onClick={() => onConfirm("reset")} className="min-h-11 rounded-md border border-signal-orange/30 px-2 text-xs text-orange-100">Reset Data</button>
        <button onClick={() => onConfirm("clear")} className="min-h-11 rounded-md border border-signal-red/30 px-2 text-xs text-red-100">Clear Local</button>
      </div>
    </section>
  );
}

function Checklist({ checklist, done, canResolve, validation, onToggle, onCompleteAll, onResolve }: { checklist: ReturnType<typeof useWorkspaceStore>["checklist"]; done: string[]; canResolve: boolean; validation: string | null; onToggle: (id: string) => void; onCompleteAll: () => void; onResolve: () => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-white">Resolution Checklist</h2><span className="text-xs text-slate-500">{done.length}/{checklist.length}</span></div>
      <div className="space-y-2">
        {checklist.map((item) => {
          const checked = done.includes(item.id);
          return (
            <button key={item.id} onClick={() => onToggle(item.id)} className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-black/18 p-2.5 text-left text-sm hover:border-signal-cyan/30">
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded border", checked ? "border-signal-green bg-signal-green text-ink-950" : "border-white/20")}><Check className="h-3.5 w-3.5" /></span>
              <span className={checked ? "text-slate-400 line-through" : "text-slate-200"}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {validation && <p className="mt-3 rounded-md border border-signal-orange/30 bg-signal-orange/10 p-2 text-xs text-orange-100">{validation}</p>}
      {!canResolve && <button onClick={onCompleteAll} className="mt-3 h-10 w-full rounded-md border border-signal-cyan/30 bg-signal-cyan/10 text-xs font-bold text-cyan-100">Complete Remaining Required Steps</button>}
      <button onClick={onResolve} disabled={!canResolve} className="mt-3 h-11 w-full rounded-md bg-signal-green font-bold text-ink-950 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500">Resolve Ticket</button>
    </section>
  );
}

function Notes(props: { notes: ReturnType<typeof useWorkspaceStore>["notes"]; noteText: string; editingNote?: string; onText: (text: string) => void; onSubmit: () => void; onEdit: (note: ReturnType<typeof useWorkspaceStore>["notes"][number]) => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <h2 className="mb-3 font-bold text-white">Technician Notes</h2>
      <textarea value={props.noteText} onChange={(event) => props.onText(event.target.value)} placeholder="Add internal note..." className="min-h-24 w-full rounded-md border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-slate-500" />
      <button onClick={props.onSubmit} className="mt-2 h-10 w-full rounded-md bg-signal-blue text-sm font-bold text-white">{props.editingNote ? "Update Note" : "Add Note"}</button>
      <div className="mt-3 space-y-2">
        {props.notes.map((note) => <button key={note.id} onClick={() => props.onEdit(note)} className="w-full rounded-md border border-white/10 bg-black/18 p-3 text-left"><p className="text-sm text-slate-200">{note.body}</p><p className="mt-2 text-xs text-slate-500">{note.technician} · {note.updatedAt}</p></button>)}
      </div>
    </section>
  );
}

function PublicUpdates(props: { updates: ReturnType<typeof useWorkspaceStore>["publicUpdates"]; value: string; onText: (text: string) => void; onSubmit: () => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <h2 className="mb-3 font-bold text-white">Public Updates</h2>
      <textarea value={props.value} onChange={(event) => props.onText(event.target.value)} placeholder="Add customer-facing update..." className="min-h-20 w-full rounded-md border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-slate-500" />
      <button onClick={props.onSubmit} className="mt-2 h-10 w-full rounded-md border border-signal-cyan/30 bg-signal-cyan/10 text-sm font-bold text-cyan-100">Post Public Update</button>
      <div className="mt-3 space-y-2">
        {props.updates.map((update) => <div key={update.id} className="rounded-md border border-white/10 bg-black/18 p-3"><p className="text-sm text-slate-200">{update.message}</p><p className="mt-2 text-xs text-slate-500">{update.author} · {update.createdAt}</p></div>)}
      </div>
    </section>
  );
}

function Alerts({ alerts, onRead }: { alerts: ReturnType<typeof useWorkspaceStore>["alerts"]; onRead: (id: string) => void }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <h2 className="mb-3 font-bold text-white">Alerts</h2>
      <div className="space-y-2">
        {alerts.map((alert) => <button key={alert.id} onClick={() => onRead(alert.id)} className={cn("w-full rounded-md border p-3 text-left", alert.read ? "border-white/8 bg-white/[0.025] opacity-65" : "border-white/10 bg-black/18")}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-white">{alert.title}</p><span className={cn("rounded border px-2 py-0.5 text-[11px]", priorityClass(alert.severity))}>{alert.severity}</span></div><p className="mt-1 text-xs text-slate-400">{alert.detail}</p><p className="mt-2 text-[11px] text-slate-500">{alert.time}</p></button>)}
      </div>
    </section>
  );
}

function Activity({ items }: { items: ReturnType<typeof useWorkspaceStore>["activity"] }) {
  return (
    <section className="thin-panel rounded-lg p-4">
      <h2 className="mb-3 font-bold text-white">Recent Activity</h2>
      <div className="space-y-2">
        {items.map((item) => <div key={item.id} className="border-l border-signal-cyan/30 pl-3"><p className="text-xs text-slate-500">{item.time} · {item.actor}</p><p className="text-sm text-slate-300">{item.message}</p></div>)}
      </div>
    </section>
  );
}

function RemoteToolbar({ onOpen }: { onOpen: (label: string) => void }) {
  return (
    <div className="fixed bottom-0 left-16 right-0 z-30 hidden border-t border-white/10 bg-ink-950/95 px-3 py-2 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        {toolbarItems.map((item) => <button key={item.label} onClick={() => onOpen(item.label)} className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-300 hover:border-signal-cyan/35 hover:text-white"><item.icon className="h-4 w-4 text-signal-cyan" />{item.label}</button>)}
      </div>
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-white/10 bg-ink-950/95 p-2 backdrop-blur lg:hidden">
      {[["/workspace", LayoutDashboard, "Work"], ["/tickets", ClipboardCheck, "Tickets"], ["/devices", Laptop, "Devices"], ["/employee", Smartphone, "Employee"]].map(([href, Icon, label]) => (
        <Link key={label as string} href={href as string} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] text-slate-300 hover:bg-white/5">
          <Icon className="h-5 w-5 text-signal-cyan" />{label as string}
        </Link>
      ))}
    </nav>
  );
}

function ResolveModal(props: { value: string; validation: string | null; canResolve: boolean; missing: string[]; onText: (value: string) => void; onClose: () => void; onResolve: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-label="Resolve ticket">
      <div className="w-full max-w-lg rounded-lg border border-signal-green/25 bg-ink-900 p-4 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Resolve Ticket</h2>
          <button onClick={props.onClose} className="h-10 rounded-md border border-white/10 px-3 text-sm">Close</button>
        </div>
        {!props.canResolve && <p className="mt-3 rounded-md border border-signal-orange/30 bg-signal-orange/10 p-3 text-sm text-orange-100">Remaining required steps: {props.missing.join(", ")}.</p>}
        <label className="mt-4 block text-sm font-semibold text-slate-300">Resolution summary
          <textarea value={props.value} onChange={(event) => props.onText(event.target.value)} className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-black/22 p-3 text-sm text-white" placeholder="Example: Reset VPN adapter, flushed DNS cache, verified gateway connectivity, and confirmed with user." />
        </label>
        {props.validation && <p className="mt-3 rounded-md border border-signal-orange/30 bg-signal-orange/10 p-2 text-xs text-orange-100">{props.validation}</p>}
        <button onClick={props.onResolve} className="mt-4 h-11 w-full rounded-md bg-signal-green font-bold text-ink-950">Resolve and Notify Employee</button>
      </div>
    </div>
  );
}

function ConfirmModal({ action, onCancel, onConfirm }: { action: string; onCancel: () => void; onConfirm: () => void }) {
  const copy = action === "clear" ? "Clear browser local data and reload the default demo?" : action === "reset" ? "Reset all tickets, diagnostics, notes, and updates to the default demo data?" : "Load this scenario and replace the current demo state?";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Confirm demo action">
      <div className="w-full max-w-md rounded-lg border border-signal-orange/25 bg-ink-900 p-4 shadow-glow">
        <h2 className="text-lg font-bold text-white">Confirm Demo Action</h2>
        <p className="mt-2 text-sm text-slate-300">{copy}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-11 rounded-md border border-white/10 text-sm font-bold text-slate-200">Cancel</button>
          <button onClick={onConfirm} className="h-11 rounded-md bg-signal-orange text-sm font-bold text-ink-950">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function GuidedDemo({ step, onNext, onClose }: { step: number; onNext: () => void; onClose: () => void }) {
  const steps = [
    "Select the critical VPN ticket INC-4821 in the queue.",
    "Review Sarah Johnson and Dell Latitude context in the device inspector.",
    "Run VPN diagnostics to reveal adapter and DNS failures.",
    "Reset the VPN adapter and clear DNS cache from Quick Actions.",
    "Add an internal technician note.",
    "Complete the resolution checklist.",
    "Resolve the ticket with a summary.",
    "Switch to Employee Portal to see the public update."
  ];
  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 mx-auto max-w-xl rounded-lg border border-signal-cyan/30 bg-ink-900 p-4 shadow-glow lg:bottom-20 lg:left-auto lg:right-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-signal-cyan">Guided Recruiter Demo · Step {step + 1}/8</p>
          <p className="mt-2 text-sm font-semibold text-white">{steps[step]}</p>
        </div>
        <button onClick={onClose} className="h-9 rounded-md border border-white/10 px-2 text-xs">Dismiss</button>
      </div>
      <button onClick={onNext} className="mt-3 h-10 w-full rounded-md bg-signal-blue text-sm font-bold text-white">{step >= 7 ? "Finish" : "Next"}</button>
    </div>
  );
}

function SupportModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-lg border border-signal-cyan/25 bg-ink-900 p-4 shadow-glow">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">{title}</h2><button onClick={onClose} className="h-10 rounded-md border border-white/10 px-3 text-sm">Close</button></div>
        <div className="mt-4 rounded-md border border-white/10 bg-black/22 p-4">
          <p className="text-sm text-slate-300">This is a polished simulated support panel. It records local demo activity only and does not connect to a real employee device.</p>
          <div className="mt-4 h-36 rounded-md border border-dashed border-signal-cyan/25 bg-signal-cyan/5" />
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <button onClick={onClose} className="fixed right-4 top-20 z-50 max-w-sm rounded-md border border-signal-green/35 bg-ink-900 px-4 py-3 text-left text-sm text-green-100 shadow-glow">{message}</button>;
}

function Metric({ label, value }: { label: string; value: string; tone: string }) {
  return <div className="rounded-md border border-white/10 bg-black/18 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-white">{value}</p></div>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "red" | "orange" }) {
  const classes = { green: "border-signal-green/35 bg-signal-green/10 text-green-100", red: "border-signal-red/35 bg-signal-red/10 text-red-100", orange: "border-signal-orange/35 bg-signal-orange/10 text-orange-100" };
  return <span className={cn("rounded-md border px-2 py-1 text-xs font-bold", classes[tone])}>{children}</span>;
}
