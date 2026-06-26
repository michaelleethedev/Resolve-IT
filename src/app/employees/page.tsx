import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { devices, employees, tickets } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <main className="min-h-screen p-5 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Link href="/workspace" className="mb-5 inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm"><ArrowLeft className="h-4 w-4" /> Workspace</Link>
        <section className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2"><UserRound className="h-5 w-5 text-signal-cyan" /><h1 className="text-xl font-bold text-white">Employee Directory</h1></div>
          <div className="grid gap-3 md:grid-cols-2">
            {employees.map((employee) => {
              const device = devices.find((item) => item.employeeId === employee.id);
              const openTickets = tickets.filter((ticket) => ticket.employeeId === employee.id).length;
              return <Link key={employee.id} href="/workspace" className="rounded-md border border-white/10 bg-white/[0.035] p-4 hover:border-signal-cyan/35"><p className="font-bold text-white">{employee.name}</p><p className="text-sm text-slate-400">{employee.role} · {employee.department}</p><p className="mt-3 text-xs text-slate-500">{device?.model ?? "No assigned device"} · {openTickets} open ticket(s) · {employee.setupStatus}</p></Link>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
