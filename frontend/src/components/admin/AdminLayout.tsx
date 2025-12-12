"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute right-0 top-20 h-60 w-60 rounded-full bg-sky-500/25 blur-[120px]" />
        <div className="absolute left-1/2 bottom-0 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>
      <AdminSidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <AdminTopbar />
        <main className="flex-1 px-6 py-6 md:px-10 md:py-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
