import { clsx, type ClassValue } from "clsx";
import type { DiagnosticStatus, Priority, TicketStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function priorityClass(priority: Priority) {
  return {
    Critical: "border-signal-red/40 bg-signal-red/12 text-red-200",
    High: "border-signal-orange/40 bg-signal-orange/12 text-orange-200",
    Medium: "border-yellow-300/35 bg-yellow-300/10 text-yellow-100",
    Low: "border-signal-green/30 bg-signal-green/10 text-green-100"
  }[priority];
}

export function statusClass(status: TicketStatus | DiagnosticStatus) {
  return {
    New: "border-signal-blue/40 bg-signal-blue/10 text-blue-100",
    Assigned: "border-indigo-300/40 bg-indigo-300/10 text-indigo-100",
    "In Progress": "border-signal-cyan/40 bg-signal-cyan/10 text-cyan-100",
    "Waiting on User": "border-signal-orange/40 bg-signal-orange/10 text-orange-100",
    Resolved: "border-signal-green/40 bg-signal-green/10 text-green-100",
    Closed: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    Passed: "border-signal-green/40 bg-signal-green/10 text-green-100",
    Warning: "border-signal-orange/40 bg-signal-orange/10 text-orange-100",
    Failed: "border-signal-red/40 bg-signal-red/10 text-red-100",
    Running: "border-signal-blue/40 bg-signal-blue/10 text-blue-100"
  }[status];
}
