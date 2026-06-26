import Link from "next/link";
import { ArrowRight, Code2, MonitorCog, PlayCircle, ShieldCheck, TicketCheck } from "lucide-react";

export default function Home() {
  const capabilities = ["Ticket lifecycle and SLA triage", "Device health inspection", "Guided VPN diagnostics", "Employee self-service loop"];
  const stack = ["Next.js App Router", "TypeScript", "Tailwind CSS", "Lucide React", "Recharts", "localStorage state"];

  return (
    <main className="min-h-screen px-5 py-6 text-slate-100">
      <section className="mx-auto grid min-h-[82vh] max-w-6xl content-center gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-signal-cyan/25 bg-signal-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Portfolio project · simulated IT operations
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-normal text-white sm:text-6xl">ResolveIT</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            ResolveIT is a responsive IT support and device operations simulation for triaging incidents, inspecting device health, running guided diagnostics, and managing ticket resolution across desktop and mobile.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/workspace" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-signal-blue px-5 text-sm font-bold text-white shadow-glow hover:bg-blue-400">
              Launch Technician Workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/employee" className="inline-flex h-12 items-center justify-center rounded-md border border-white/12 bg-white/6 px-5 text-sm font-bold text-slate-100 hover:border-signal-cyan/40">
              Open Employee Portal
            </Link>
            <Link href="/workspace" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-signal-green/25 bg-signal-green/10 px-5 text-sm font-bold text-green-100">
              <PlayCircle className="h-4 w-4" /> Explore Demo Scenario
            </Link>
          </div>
        </div>
        <div className="glass-panel scanline rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interface Preview</p>
              <h2 className="text-lg font-bold text-white">Critical VPN incident</h2>
            </div>
            <span className="rounded-md border border-signal-red/35 bg-signal-red/10 px-2 py-1 text-xs font-semibold text-red-100">SLA 42m</span>
          </div>
          <div className="grid gap-3">
            {[
              { icon: TicketCheck, label: "INC-4821", value: "Assigned, diagnosed, resolved, and visible to employee" },
              { icon: MonitorCog, label: "Dell Latitude 5430", value: "Hardware, software, network, security, event log" },
              { icon: ShieldCheck, label: "Guided workflow", value: "Checklist, diagnostics, notes, public updates" }
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/18 p-3">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-signal-cyan" />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 pb-12 md:grid-cols-3">
        <div className="thin-panel rounded-lg p-4 md:col-span-1">
          <h2 className="font-bold text-white">Why I Built This</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">To demonstrate product thinking beyond static dashboards: realistic IT workflows, shared state between user roles, responsive operations UI, and careful simulation boundaries.</p>
        </div>
        <div className="thin-panel rounded-lg p-4">
          <h2 className="mb-3 font-bold text-white">Key Capabilities</h2>
          <div className="grid gap-2">{capabilities.map((item) => <p key={item} className="rounded-md border border-white/10 bg-black/18 p-2 text-sm text-slate-300">{item}</p>)}</div>
        </div>
        <div className="thin-panel rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><Code2 className="h-5 w-5 text-signal-cyan" /><h2 className="font-bold text-white">Technology Stack</h2></div>
          <div className="flex flex-wrap gap-2">{stack.map((item) => <span key={item} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">{item}</span>)}</div>
          <p className="mt-4 rounded-md border border-signal-cyan/20 bg-signal-cyan/10 p-3 text-xs leading-5 text-cyan-100">All users and devices are fictional. Remote support actions are simulations. No real systems are accessed.</p>
        </div>
      </section>
    </main>
  );
}
