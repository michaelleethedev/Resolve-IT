import Link from "next/link";
import { ArrowLeft, Laptop } from "lucide-react";
import { devices, employees } from "@/lib/mock-data";

export default function DevicesPage() {
  return (
    <main className="min-h-screen p-5 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Link href="/workspace" className="mb-5 inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm"><ArrowLeft className="h-4 w-4" /> Workspace</Link>
        <section className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2"><Laptop className="h-5 w-5 text-signal-cyan" /><h1 className="text-xl font-bold text-white">Device Inventory</h1></div>
          <div className="grid gap-3 md:grid-cols-2">
            {devices.map((device) => {
              const employee = employees.find((item) => item.id === device.employeeId);
              return <Link key={device.id} href="/workspace" className="rounded-md border border-white/10 bg-white/[0.035] p-4 hover:border-signal-cyan/35"><p className="font-bold text-white">{device.model}</p><p className="text-sm text-slate-400">{employee?.name} · {device.os}</p><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-signal-cyan" style={{ width: `${device.healthScore}%` }} /></div><p className="mt-2 text-xs text-slate-500">Health {device.healthScore}% · {device.lastCheckIn}</p></Link>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
