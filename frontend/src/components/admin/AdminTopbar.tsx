"use client";

import { useI18n } from "@/lib/i18n";

export function AdminTopbar() {
  const { lang, setLang } = useI18n();

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-end px-6 gap-4 bg-slate-950/80 backdrop-blur-xl relative z-10">
      <div className="flex items-center gap-2 text-xs border border-slate-700 rounded-full px-1 py-1 bg-slate-900/70 shadow-inner shadow-slate-900">
        <button
          onClick={() => setLang("en")}
          className={`px-2 py-0.5 rounded-full transition ${
            lang === "en" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang("tr")}
          className={`px-2 py-0.5 rounded-full transition ${
            lang === "tr" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          TR
        </button>
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 shadow-lg shadow-indigo-500/30" />
    </header>
  );
}
