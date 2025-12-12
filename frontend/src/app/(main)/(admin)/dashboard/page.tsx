"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSummaryStats, StatsSummary } from "@/lib/api/stats";
import { QuickStartGuide } from "@/components/onboarding";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

type StatTile = {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  href: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSummaryStats();
        setStats(data);

        // Update onboarding completion status
        if (data.productsCount > 0) {
          localStorage.setItem("castfash_has_products", "true");
        }
        if (data.generatedImagesCount > 0) {
          localStorage.setItem("castfash_has_generations", "true");
        }
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : "Veriler alınırken bir hata oluştu.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-0">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-red-400 mb-4">Hata: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition font-medium active:scale-[0.98]"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const tiles: StatTile[] = [
    {
      label: "Toplam Ürün",
      value: stats?.productsCount || 0,
      icon: "📦",
      color: "#a78bfa",
      href: "/products",
    },
    {
      label: "Üretilen Görsel",
      value: stats?.generatedImagesCount || 0,
      icon: "🖼️",
      color: "#22c55e",
      href: "/generations",
    },
  ];

  const quickActions = [
    {
      title: "Yeni Ürün Ekle",
      description: "Katalog görselinizi yükleyin",
      icon: "📦",
      href: "/products/new",
      color: "#a78bfa",
    },
    {
      title: "Görsel Üret",
      description: "AI ile profesyonel görsel oluşturun",
      icon: "✨",
      href: "/generations/new",
      color: "#f472b6",
    },
    {
      title: "Sahne Oluştur",
      description: "Yeni arka plan/ortam ekleyin",
      icon: "🎨",
      href: "/scenes/new",
      color: "#fb923c",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 px-4 md:px-0 pb-20 md:pb-8">
      {/* Welcome Section - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          eyebrow="Hoş geldiniz 👋"
          title="Dashboard"
          description="Ürün, model ve AI üretim akışınızı buradan takip edin."
        />
        {/* Desktop button */}
        <Link
          href="/generations/new"
          className="hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <span>✨</span>
          Yeni Üretim
        </Link>
      </div>

      {/* Mobile floating action button */}
      <Link
        href="/generations/new"
        className="sm:hidden fixed bottom-20 right-4 z-30 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-purple-500 text-white text-xl rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        aria-label="Yeni Üretim"
      >
        ✨
      </Link>

      {/* Quick Start Guide for New Users */}
      <QuickStartGuide />

      {/* Stats Grid - Mobile: 2 columns, Desktop: 4 columns */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group rounded-2xl border border-border bg-card hover:border-primary/30 p-4 md:p-6 transition-all hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl">{tile.icon}</span>
              <span
                className="text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full hidden sm:inline-block"
                style={{ backgroundColor: `${tile.color}20`, color: tile.color }}
              >
                Görüntüle →
              </span>
            </div>
            <p className="text-xs md:text-sm text-textMuted mb-1">{tile.label}</p>
            <p
              className="text-2xl md:text-4xl font-bold"
              style={{ color: tile.color }}
            >
              {tile.value}
            </p>
          </Link>
        ))}

        {/* Empty state cards if no data */}
        {tiles.every(t => t.value === 0) && (
          <>
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 md:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl md:text-3xl mb-2">🎯</span>
              <p className="text-xs md:text-sm text-textMuted">Model profilleri ekleyerek başlayın</p>
              <Link
                href="/model-profiles"
                className="mt-2 md:mt-3 text-xs text-primary hover:underline"
              >
                Modelleri Gör →
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 md:p-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl md:text-3xl mb-2">🎨</span>
              <p className="text-xs md:text-sm text-textMuted">Sahneler oluşturun</p>
              <Link
                href="/scenes"
                className="mt-2 md:mt-3 text-xs text-primary hover:underline"
              >
                Sahneleri Gör →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions - Mobile: Stack, Desktop: 3 columns */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Hızlı İşlemler</h3>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 md:gap-4 rounded-2xl border border-border bg-card hover:border-primary/30 p-4 md:p-5 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
                style={{ backgroundColor: `${action.color}15` }}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white group-hover:text-primary transition text-sm md:text-base truncate">
                  {action.title}
                </h4>
                <p className="text-xs md:text-sm text-textMuted truncate">{action.description}</p>
              </div>
              <span className="text-textMuted group-hover:text-primary transition hidden sm:block">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity - Mobile optimized */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-white">Son Aktiviteler</h3>
          <Link href="/generations" className="text-xs md:text-sm text-primary hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        {stats?.generatedImagesCount === 0 ? (
          <div className="text-center py-8 md:py-12">
            <span className="text-4xl md:text-5xl mb-3 md:mb-4 block">🎨</span>
            <h4 className="text-base md:text-lg font-medium text-white mb-2">Henüz aktivite yok</h4>
            <p className="text-textMuted text-sm md:text-base mb-4 md:mb-6">İlk görselinizi oluşturarak başlayın!</p>
            <Link
              href="/generations/new"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition active:scale-[0.98]"
            >
              <span>✨</span>
              İlk Görselinizi Oluşturun
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-textMuted text-xs md:text-sm">
              Son üretimlerinizi görmek için Üretimler sayfasını ziyaret edin.
            </p>
            <Link
              href="/generations"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 md:py-2 bg-primary/10 text-primary font-medium rounded-xl md:rounded-lg hover:bg-primary/20 transition active:scale-[0.98]"
            >
              Üretimlere Git →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

