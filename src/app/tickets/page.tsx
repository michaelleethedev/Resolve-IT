import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { tickets, employees } from "@/lib/mock-data";
import { priorityClass, statusClass } from "@/lib/utils";

export default function TicketsPage() {
  return (
    <main className="min-h-screen p-5 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Link href="/workspace" className="mb-5 inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm"><ArrowLeft className="h-4 w-4" /> Workspace</Link>
        <section className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-signal-cyan" /><h1 className="text-xl font-bold text-white">Ticket Queue</h1></div>
          <div className="grid gap-2">
            {tickets.map((ticket) => {
              const employee = employees.find((item) => item.id === ticket.employeeId);
              return <Link key={ticket.id} href="/workspace" className="grid gap-2 rounded-md border border-white/10 bg-white/[0.035] p-3 hover:border-signal-cyan/35 sm:grid-cols-[120px_1fr_140px_120px]"><span className="font-mono text-sm text-cyan-100">{ticket.id}</span><span className="font-semibold text-white">{ticket.title}<span className="block text-xs font-normal text-slate-400">{employee?.name} · {ticket.department}</span></span><span className={`w-fit rounded border px-2 py-1 text-xs ${priorityClass(ticket.priority)}`}>{ticket.priority}</span><span className={`w-fit rounded border px-2 py-1 text-xs ${statusClass(ticket.status)}`}>{ticket.status}</span></Link>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
