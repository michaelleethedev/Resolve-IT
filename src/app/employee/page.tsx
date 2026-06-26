"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle, Laptop, LifeBuoy, Paperclip, Send, ShieldQuestion } from "lucide-react";
import { devices, employees } from "@/lib/mock-data";
import { useWorkspaceStore, type EmployeeTicketDraft } from "@/lib/workspace-store";
import { cn, priorityClass, statusClass } from "@/lib/utils";
import type { IssueCategory, Priority } from "@/lib/types";

const categories: IssueCategory[] = ["Account and Password", "Network and VPN", "Hardware", "Software", "Access Request", "Email and Collaboration", "Mobile Device", "Other"];
const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];

export default function EmployeePortal() {
  const store = useWorkspaceStore();
  const employee = employees[0];
  const employeeDevices = devices.filter((device) => device.employeeId === employee.id);
  const [step, setStep] = useState<"compose" | "review" | "done">("compose");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmployeeTicketDraft>({
    category: "Network and VPN",
    urgency: "High",
    deviceId: employeeDevices[0]?.id ?? devices[0].id,
    subject: "VPN disconnects after sign-in",
    description: "GlobalProtect accepts my Okta push but never connects to company resources. I can access normal websites.",
    attachmentName: "",
    preferredContact: "Slack"
  });

  const assignedDevice = devices.find((device) => device.id === draft.deviceId) ?? devices[0];
  const requests = useMemo(() => store.tickets.filter((ticket) => ticket.employeeId === employee.id), [employee.id, store.tickets]);

  function submitTicket() {
    const id = store.submitEmployeeTicket({ ...draft, attachmentName: draft.attachmentName || undefined }, employee.id);
    setSubmittedId(id);
    setStep("done");
  }

  return (
    <main className="min-h-screen px-4 pb-24 pt-5 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/workspace" className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Technician Workspace
          </Link>
          <span className="rounded-full border border-signal-cyan/25 bg-signal-cyan/10 px-3 py-1 text-xs text-cyan-100">Employee Portal</span>
        </div>

        <section className="glass-panel rounded-lg p-4 sm:p-6">
          <p className="text-sm text-slate-400">ResolveIT Self-Service · {employee.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Submit and track IT requests</h1>

          {step === "compose" && (
            <form className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs text-slate-400">Issue category
                  <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as IssueCategory })} className="mt-1 h-12 w-full rounded-md border border-white/10 bg-ink-850 px-3 text-sm text-white">
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-400">Urgency
                  <select value={draft.urgency} onChange={(event) => setDraft({ ...draft, urgency: event.target.value as Priority })} className="mt-1 h-12 w-full rounded-md border border-white/10 bg-ink-850 px-3 text-sm text-white">
                    {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-400">Device
                  <select value={draft.deviceId} onChange={(event) => setDraft({ ...draft, deviceId: event.target.value })} className="mt-1 h-12 w-full rounded-md border border-white/10 bg-ink-850 px-3 text-sm text-white">
                    {employeeDevices.map((device) => <option value={device.id} key={device.id}>{device.model}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-400">Preferred contact
                  <select value={draft.preferredContact} onChange={(event) => setDraft({ ...draft, preferredContact: event.target.value as EmployeeTicketDraft["preferredContact"] })} className="mt-1 h-12 w-full rounded-md border border-white/10 bg-ink-850 px-3 text-sm text-white">
                    {["Slack", "Email", "Phone"].map((method) => <option key={method}>{method}</option>)}
                  </select>
                </label>
              </div>
              <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className="h-12 rounded-md border border-white/10 bg-ink-850 px-3 text-sm text-white" placeholder="Subject" />
              <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="min-h-28 rounded-md border border-white/10 bg-ink-850 p-3 text-sm text-white placeholder:text-slate-500" placeholder="Describe what is happening, what changed, and any error messages." />
              <label className="flex min-h-12 items-center gap-2 rounded-md border border-dashed border-white/15 bg-black/16 px-3 text-sm text-slate-300">
                <Paperclip className="h-4 w-4 text-signal-cyan" />
                <input value={draft.attachmentName} onChange={(event) => setDraft({ ...draft, attachmentName: event.target.value })} className="min-w-0 flex-1 bg-transparent focus:outline-none" placeholder="Optional attachment simulation, e.g. vpn-error.png" />
              </label>
              <button type="button" onClick={() => setStep("review")} disabled={!draft.subject.trim() || !draft.description.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-signal-blue text-sm font-bold text-white disabled:bg-white/10 disabled:text-slate-500">
                Review Request
              </button>
            </form>
          )}

          {step === "review" && (
            <div className="mt-5 rounded-lg border border-white/10 bg-black/18 p-4">
              <h2 className="font-bold text-white">Review before submitting</h2>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <p>Category: <span className="text-white">{draft.category}</span></p>
                <p>Urgency: <span className={cn("rounded border px-2 py-0.5 text-xs", priorityClass(draft.urgency))}>{draft.urgency}</span></p>
                <p>Device: <span className="text-white">{assignedDevice.model}</span></p>
                <p>Contact: <span className="text-white">{draft.preferredContact}</span></p>
                <p className="sm:col-span-2">Subject: <span className="text-white">{draft.subject}</span></p>
                <p className="sm:col-span-2">Description: <span className="text-white">{draft.description}</span></p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button onClick={() => setStep("compose")} className="h-12 rounded-md border border-white/10 text-sm font-bold">Edit</button>
                <button onClick={submitTicket} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-signal-green text-sm font-bold text-ink-950"><Send className="h-4 w-4" /> Submit Ticket</button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="mt-5 rounded-lg border border-signal-green/30 bg-signal-green/10 p-4">
              <div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-signal-green" /><h2 className="font-bold text-white">Ticket {submittedId} submitted</h2></div>
              <p className="mt-2 text-sm text-green-100">It now appears in the technician queue and is stored locally for this demo.</p>
              <button onClick={() => setStep("compose")} className="mt-4 h-11 rounded-md border border-signal-green/30 px-3 text-sm font-bold text-green-100">Submit another request</button>
            </div>
          )}
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr]">
          <section className="thin-panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2"><Laptop className="h-5 w-5 text-signal-cyan" /><h2 className="font-bold text-white">Assigned device</h2></div>
            <p className="text-sm font-semibold text-white">{assignedDevice.model}</p>
            <p className="text-sm text-slate-400">{assignedDevice.os} · Health {assignedDevice.healthScore}% · {assignedDevice.lastCheckIn}</p>
          </section>
          <section className="thin-panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-signal-cyan" /><h2 className="font-bold text-white">My requests</h2></div>
            <div className="space-y-3">
              {requests.map((ticket) => {
                const updates = store.allPublicUpdates.filter((update) => update.ticketId === ticket.id);
                return (
                  <div key={ticket.id} className="rounded-md border border-white/10 bg-black/18 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-sm font-bold text-cyan-100">{ticket.id}</p>
                      <span className={cn("rounded border px-2 py-1 text-xs", statusClass(ticket.status))}>{ticket.status}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">{ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{ticket.publicSummary}</p>
                    {ticket.status === "Resolved" && <button onClick={() => store.closeTicket(ticket.id)} className="mt-3 h-10 rounded-md border border-signal-green/30 px-3 text-xs font-bold text-green-100">Confirm Fixed</button>}
                    <div className="mt-3 space-y-1 border-t border-white/8 pt-2">
                      {updates.slice(0, 3).map((update) => <p key={update.id} className="text-xs text-slate-400">{update.createdAt} · {update.message}</p>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-4 thin-panel rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><ShieldQuestion className="h-5 w-5 text-signal-cyan" /><h2 className="font-bold text-white">Troubleshooting guides</h2></div>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Reset your password", "Troubleshoot VPN", "Prepare a laptop swap"].map((guide) => <button key={guide} className="min-h-12 rounded-md border border-white/10 bg-white/5 px-3 text-left text-sm text-slate-200">{guide}</button>)}
          </div>
        </section>
      </div>
    </main>
  );
}
