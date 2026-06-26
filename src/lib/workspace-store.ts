"use client";

import { useEffect, useMemo, useState } from "react";
import { activityLog, alerts, checklist, diagnostics, employees, publicUpdates, technicians, tickets } from "./mock-data";
import type { Activity, Alert, ChecklistItem, Diagnostic, IssueCategory, Note, Priority, PublicUpdate, Ticket, TicketStatus } from "./types";

const storageKey = "resolveit-workspace-v2";

type Persisted = {
  tickets: Ticket[];
  alerts: Alert[];
  notes: Note[];
  publicUpdates: PublicUpdate[];
  checklistDoneByTicket: Record<string, string[]>;
  diagnosticsByTicket: Record<string, Diagnostic[]>;
  activity: Activity[];
};

export type EmployeeTicketDraft = {
  category: IssueCategory;
  urgency: Priority;
  deviceId: string;
  subject: string;
  description: string;
  attachmentName?: string;
  preferredContact: "Slack" | "Email" | "Phone";
};

const initialNotes: Note[] = [
  {
    id: "note-1",
    ticketId: "INC-4821",
    technician: "Maya Lee",
    body: "User reports VPN fails after successful Okta push. Internet connection confirmed on home network.",
    updatedAt: "10:41"
  }
];

const initialData: Persisted = {
  tickets,
  alerts,
  notes: initialNotes,
  publicUpdates,
  checklistDoneByTicket: { "INC-4821": ["auth", "internet"] },
  diagnosticsByTicket: { "INC-4821": diagnostics },
  activity: activityLog
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function cloneInitialData(): Persisted {
  return JSON.parse(JSON.stringify(initialData)) as Persisted;
}

function migrate(value: unknown): Persisted {
  const maybe = value as Partial<Persisted> | null;
  return {
    ...cloneInitialData(),
    ...maybe,
    publicUpdates: maybe?.publicUpdates ?? publicUpdates,
    checklistDoneByTicket: maybe?.checklistDoneByTicket ?? { "INC-4821": ["auth", "internet"] },
    diagnosticsByTicket: maybe?.diagnosticsByTicket ?? { "INC-4821": diagnostics }
  };
}

export function useWorkspaceStore() {
  const [selectedTicketId, setSelectedTicketId] = useState("INC-4821");
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<Persisted>(cloneInitialData);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setData(migrate(JSON.parse(saved)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, hydrated]);

  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId) ?? data.tickets[0];
  const selectedEmployee = employees.find((employee) => employee.id === selectedTicket.employeeId) ?? employees[0];
  const activeTechnician = technicians.find((tech) => tech.id === selectedTicket.assignedTechnicianId) ?? technicians[0];
  const selectedNotes = data.notes.filter((note) => note.ticketId === selectedTicket.id);
  const selectedPublicUpdates = data.publicUpdates.filter((update) => update.ticketId === selectedTicket.id);
  const checklistDone = data.checklistDoneByTicket[selectedTicket.id] ?? [];
  const completedRequired = checklist.every((item) => !item.required || checklistDone.includes(item.id));
  const missingChecklist = checklist.filter((item) => item.required && !checklistDone.includes(item.id));
  const unreadAlerts = data.alerts.filter((alert) => !alert.read).length;

  const ticketDiagnostics = useMemo<Diagnostic[]>(() => {
    if (data.diagnosticsByTicket[selectedTicket.id]) return data.diagnosticsByTicket[selectedTicket.id];
    return diagnostics.map((diagnostic) => ({
      ...diagnostic,
      status: selectedTicket.category === "Network and VPN" ? diagnostic.status : diagnostic.status === "Failed" ? "Warning" : diagnostic.status
    }));
  }, [data.diagnosticsByTicket, selectedTicket.category, selectedTicket.id]);

  function pushActivity(current: Persisted, message: string, actor = "Maya Lee"): Persisted {
    return {
      ...current,
      activity: [{ id: crypto.randomUUID(), time: nowLabel(), actor, message }, ...current.activity].slice(0, 20)
    };
  }

  function addActivity(message: string, actor = "Maya Lee") {
    setData((current) => pushActivity(current, message, actor));
  }

  function updateTicket(ticketId: string, patch: Partial<Ticket>, activity?: string, publicMessage?: string) {
    setData((current) => {
      const next: Persisted = {
        ...current,
        tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...patch } : ticket))
      };
      if (publicMessage) {
        next.publicUpdates = [{ id: crypto.randomUUID(), ticketId, author: "Maya Lee", message: publicMessage, createdAt: nowLabel() }, ...next.publicUpdates];
      }
      return activity ? pushActivity(next, activity) : next;
    });
  }

  function updateTicketStatus(ticketId: string, status: TicketStatus) {
    const message = status === "Waiting on User" ? "IT needs a response before continuing." : `Your request is now ${status.toLowerCase()}.`;
    updateTicket(ticketId, { status, publicSummary: message }, `${ticketId} moved to ${status}.`, message);
  }

  function updatePriority(ticketId: string, priority: Priority) {
    updateTicket(ticketId, { priority }, `${ticketId} priority changed to ${priority}.`);
  }

  function updateAssignment(ticketId: string, technicianId: string) {
    const technician = technicians.find((tech) => tech.id === technicianId);
    updateTicket(ticketId, { assignedTechnicianId: technicianId, status: "Assigned", publicSummary: `${technician?.name ?? "A technician"} has been assigned.` }, `${ticketId} assigned to ${technician?.name ?? "technician"}.`, `${technician?.name ?? "A technician"} has been assigned to your request.`);
  }

  function toggleChecklist(itemId: string) {
    setValidation(null);
    setData((current) => {
      const existing = current.checklistDoneByTicket[selectedTicket.id] ?? [];
      const done = existing.includes(itemId) ? existing.filter((id) => id !== itemId) : [...existing, itemId];
      return {
        ...current,
        checklistDoneByTicket: { ...current.checklistDoneByTicket, [selectedTicket.id]: done }
      };
    });
  }

  function completeRequiredChecklist() {
    setValidation(null);
    setData((current) => ({
      ...current,
      checklistDoneByTicket: {
        ...current.checklistDoneByTicket,
        [selectedTicket.id]: checklist.filter((item) => item.required).map((item) => item.id)
      }
    }));
  }

  function addOrUpdateNote(body: string, noteId?: string) {
    setData((current) => {
      const next: Persisted = {
        ...current,
        notes: noteId
          ? current.notes.map((note) => (note.id === noteId ? { ...note, body, updatedAt: nowLabel() } : note))
          : [{ id: crypto.randomUUID(), ticketId: selectedTicket.id, technician: "Maya Lee", body, updatedAt: nowLabel() }, ...current.notes]
      };
      return pushActivity(next, noteId ? "Updated internal note." : "Added internal note.");
    });
  }

  function addPublicUpdate(ticketId: string, message: string) {
    if (!message.trim()) return;
    setData((current) => pushActivity({
      ...current,
      publicUpdates: [{ id: crypto.randomUUID(), ticketId, author: "Maya Lee", message, createdAt: nowLabel() }, ...current.publicUpdates],
      tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, publicSummary: message } : ticket))
    }, `Added public update to ${ticketId}.`));
  }

  function markAlertRead(alertId: string) {
    setData((current) => ({
      ...current,
      alerts: current.alerts.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert))
    }));
  }

  async function runDiagnosticFlow() {
    setRunningAction("Run VPN Diagnostics");
    setToast(null);
    const running = diagnostics.map((diagnostic) => ({ ...diagnostic, status: "Running" as const, detail: "Running simulated endpoint check..." }));
    setData((current) => ({
      ...current,
      diagnosticsByTicket: { ...current.diagnosticsByTicket, [selectedTicket.id]: running }
    }));
    await new Promise((resolve) => setTimeout(resolve, 900));
    setData((current) => pushActivity({
      ...current,
      diagnosticsByTicket: { ...current.diagnosticsByTicket, [selectedTicket.id]: diagnostics }
    }, `VPN diagnostics completed for ${selectedTicket.id}.`));
    if (!checklistDone.includes("diagnostics")) toggleChecklist("diagnostics");
    setToast("VPN diagnostics completed. Adapter reset and DNS cache clear are recommended.");
    setRunningAction(null);
  }

  async function runAction(action: string) {
    if (action === "Run Diagnostics") return runDiagnosticFlow();
    setRunningAction(action);
    setToast(null);
    await new Promise((resolve) => setTimeout(resolve, 750));
    const message = `${action} completed in simulated mode.`;
    if (action === "Reset VPN Adapter" && !checklistDone.includes("adapter")) toggleChecklist("adapter");
    if (action === "Clear DNS Cache" && !checklistDone.includes("dns")) toggleChecklist("dns");
    if (action === "Restart VPN Service" && !checklistDone.includes("service")) toggleChecklist("service");
    if (action === "Reset Credentials" && !checklistDone.includes("auth")) toggleChecklist("auth");
    if (action === "Escalate Ticket") updateAssignment(selectedTicket.id, "tech-2");
    addActivity(`${action} completed for ${selectedTicket.id}.`);
    setToast(message);
    setRunningAction(null);
  }

  function resolveTicket(summary: string) {
    if (!completedRequired) {
      setValidation(`Complete required troubleshooting first: ${missingChecklist.map((item) => item.label).join(", ")}.`);
      return false;
    }
    if (!summary.trim()) {
      setValidation("Add a resolution summary before resolving the ticket.");
      return false;
    }
    const resolvedAt = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    updateTicket(selectedTicket.id, {
      status: "Resolved",
      resolutionSummary: summary,
      resolutionTimestamp: resolvedAt,
      publicSummary: `Resolved: ${summary}`
    }, `${selectedTicket.id} resolved.`, `Resolved: ${summary}`);
    setValidation(null);
    setToast(`${selectedTicket.id} resolved and visible in the employee portal.`);
    return true;
  }

  function reopenTicket(ticketId: string) {
    updateTicket(ticketId, { status: "In Progress", reopenedAt: nowLabel(), publicSummary: "This request has been reopened for technician review." }, `${ticketId} reopened.`, "Your request has been reopened for technician review.");
  }

  function closeTicket(ticketId: string) {
    updateTicket(ticketId, { status: "Closed", publicSummary: "The request was confirmed fixed and closed." }, `${ticketId} closed.`, "Thanks for confirming. This request is now closed.");
  }

  function submitEmployeeTicket(draft: EmployeeTicketDraft, employeeId = "emp-1") {
    const employee = employees.find((item) => item.id === employeeId) ?? employees[0];
    const number = Math.max(...data.tickets.map((ticket) => Number(ticket.id.replace("INC-", "")))) + 1;
    const id = `INC-${number}`;
    const ticket: Ticket = {
      id,
      title: draft.subject,
      description: draft.description,
      category: draft.category,
      employeeId,
      department: employee.department,
      priority: draft.urgency,
      status: "New",
      submittedAgo: "Just now",
      submittedMinutes: 0,
      slaMinutes: draft.urgency === "Critical" ? 60 : draft.urgency === "High" ? 120 : 360,
      assignedTechnicianId: "tech-3",
      deviceId: draft.deviceId,
      deviceType: "Laptop",
      publicSummary: "Ticket submitted and waiting for technician triage.",
      createdAt: "Just now",
      preferredContact: draft.preferredContact,
      attachmentName: draft.attachmentName
    };
    const next = pushActivity({
      ...data,
      tickets: [ticket, ...data.tickets],
      publicUpdates: [{ id: crypto.randomUUID(), ticketId: id, author: "ResolveIT", message: "Ticket submitted and waiting for technician triage.", createdAt: nowLabel() }, ...data.publicUpdates],
      checklistDoneByTicket: { ...data.checklistDoneByTicket, [id]: [] }
    }, `${id} submitted by ${employee.name}.`, employee.name);
    setData(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setSelectedTicketId(id);
    return id;
  }

  function resetDemoData() {
    setData(cloneInitialData());
    setSelectedTicketId("INC-4821");
    setToast("Demo data reset.");
  }

  function clearLocalData() {
    window.localStorage.removeItem(storageKey);
    resetDemoData();
  }

  function loadScenario(scenario: "vpn" | "newEmployee" | "compliance") {
    const next = cloneInitialData();
    if (scenario === "newEmployee") {
      next.tickets = [{ ...tickets[1], id: "INC-4902", title: "New employee laptop setup blocked", category: "Access Request", status: "Assigned", priority: "High", publicSummary: "Endpoint support is provisioning required access.", createdAt: "Just now", submittedAgo: "Just now", submittedMinutes: 0 }, ...next.tickets];
      setSelectedTicketId("INC-4902");
    } else if (scenario === "compliance") {
      next.tickets = [{ ...tickets[2], id: "INC-4903", title: "Device compliance check failed", category: "Software", status: "In Progress", priority: "High", publicSummary: "IT is reviewing patch and security posture.", createdAt: "Just now", submittedAgo: "Just now", submittedMinutes: 0 }, ...next.tickets];
      setSelectedTicketId("INC-4903");
    } else {
      setSelectedTicketId("INC-4821");
    }
    setData(pushActivity(next, `Loaded ${scenario} demo scenario.`, "System"));
    setToast("Scenario loaded.");
  }

  return {
    selectedTicket,
    selectedEmployee,
    activeTechnician,
    selectedTicketId,
    setSelectedTicketId,
    tickets: data.tickets,
    alerts: data.alerts,
    notes: selectedNotes,
    publicUpdates: selectedPublicUpdates,
    allPublicUpdates: data.publicUpdates,
    checklist: checklist as ChecklistItem[],
    checklistDone,
    missingChecklist,
    activity: data.activity,
    diagnostics: ticketDiagnostics,
    unreadAlerts,
    completedRequired,
    runningAction,
    toast,
    validation,
    setToast,
    setValidation,
    updateTicketStatus,
    updatePriority,
    updateAssignment,
    toggleChecklist,
    completeRequiredChecklist,
    addOrUpdateNote,
    addPublicUpdate,
    markAlertRead,
    runAction,
    resolveTicket,
    reopenTicket,
    closeTicket,
    submitEmployeeTicket,
    resetDemoData,
    clearLocalData,
    loadScenario
  };
}
