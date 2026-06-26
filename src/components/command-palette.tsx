"use client";

import { Command, Laptop, Search, ShieldAlert, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type CommandItem = {
  label: string;
  hint: string;
  icon: React.ElementType;
  action: () => void;
};

export function CommandPalette({ onSelectTicket, onRunAction }: { onSelectTicket: (id: string) => void; onRunAction: (action: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo<CommandItem[]>(() => [
    { label: "Open ticket INC-4821", hint: "Active VPN incident", icon: ShieldAlert, action: () => onSelectTicket("INC-4821") },
    { label: "Search employee Sarah Johnson", hint: "Sales Ops device owner", icon: Search, action: () => onSelectTicket("INC-4821") },
    { label: "Run VPN diagnostics", hint: "Simulated endpoint action", icon: Wifi, action: () => onRunAction("Run Diagnostics") },
    { label: "View critical tickets", hint: "Queue focus", icon: ShieldAlert, action: () => onSelectTicket("INC-4821") },
    { label: "Open device Dell Latitude 5430", hint: "Device inspector", icon: Laptop, action: () => onSelectTicket("INC-4821") }
  ], [onRunAction, onSelectTicket]);

  const filtered = commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.hint.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:border-signal-cyan/40 md:flex">
        <Command className="h-3.5 w-3.5" />
        Cmd/Ctrl K
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={() => setOpen(false)}>
          <div className="mx-auto mt-20 max-w-2xl overflow-hidden rounded-lg border border-signal-cyan/25 bg-ink-900 shadow-glow" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-signal-cyan" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tickets, employees, devices, or run a command..."
                className="h-11 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn("flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-white/[0.07]", item.label.includes("Run") && "text-cyan-50")}
                >
                  <item.icon className="h-5 w-5 text-signal-cyan" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="block text-xs text-slate-400">{item.hint}</span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">No matching commands.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
