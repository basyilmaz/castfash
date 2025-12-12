"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";

export default function AiProviderSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI provider"
        subtitle="Connect your generation provider credentials. This is a placeholder view; wiring comes next."
        actions={<AppBadge>castfash</AppBadge>}
      />

      <AppCard className="p-5 space-y-3">
        <p className="text-sm text-slate-300">
          Configure base URL, API key, and preferred model ID. Choose between replicate, fal, or custom endpoints.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-sm text-white">Provider</p>
            <p className="text-xs text-slate-400">replicate</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-sm text-white">Status</p>
            <AppBadge variant="warning">Not connected</AppBadge>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-sm text-white">Model ID</p>
            <p className="text-xs text-slate-400">to be set</p>
          </div>
        </div>
        <div className="flex gap-2">
          <AppButton>Save config</AppButton>
          <AppButton variant="secondary">Test connection</AppButton>
        </div>
      </AppCard>
    </div>
  );
}
