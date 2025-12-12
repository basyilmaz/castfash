"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface ServiceStatus {
    name: string;
    status: "healthy" | "degraded" | "down";
    responseTime: number;
    uptime: number;
    lastCheck: Date;
}

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}

interface DatabaseStats {
    connections: number;
    maxConnections: number;
    queryTime: number;
    size: string;
}

interface ApiStats {
    requestsPerMinute: number;
    averageLatency: number;
    errorRate: number;
    activeUsers: number;
}

interface ErrorLog {
    id: string;
    message: string;
    level: "error" | "warning" | "info";
    timestamp: Date;
    count: number;
    service: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const mockServices: ServiceStatus[] = [
    { name: "API Gateway", status: "healthy", responseTime: 45, uptime: 99.99, lastCheck: new Date() },
    { name: "Auth Service", status: "healthy", responseTime: 23, uptime: 99.98, lastCheck: new Date() },
    { name: "Generation Service", status: "healthy", responseTime: 156, uptime: 99.95, lastCheck: new Date() },
    { name: "Storage Service", status: "healthy", responseTime: 89, uptime: 99.97, lastCheck: new Date() },
    { name: "Email Service", status: "degraded", responseTime: 234, uptime: 98.5, lastCheck: new Date() },
    { name: "Redis Cache", status: "healthy", responseTime: 12, uptime: 99.99, lastCheck: new Date() },
];

const mockMetrics: SystemMetrics = {
    cpu: 42,
    memory: 68,
    disk: 55,
    network: 23,
};

const mockDbStats: DatabaseStats = {
    connections: 45,
    maxConnections: 100,
    queryTime: 15,
    size: "4.2 GB",
};

const mockApiStats: ApiStats = {
    requestsPerMinute: 1240,
    averageLatency: 89,
    errorRate: 0.5,
    activeUsers: 156,
};

const mockErrors: ErrorLog[] = [
    { id: "1", message: "Connection timeout to external API", level: "error", timestamp: new Date(Date.now() - 1000 * 60 * 5), count: 3, service: "Generation" },
    { id: "2", message: "Rate limit exceeded for provider X", level: "warning", timestamp: new Date(Date.now() - 1000 * 60 * 15), count: 12, service: "Generation" },
    { id: "3", message: "Email delivery delayed", level: "warning", timestamp: new Date(Date.now() - 1000 * 60 * 30), count: 5, service: "Email" },
    { id: "4", message: "Cache miss rate increased", level: "info", timestamp: new Date(Date.now() - 1000 * 60 * 60), count: 1, service: "Redis" },
];

// =============================================================================
// Status Badge
// =============================================================================

function StatusBadge({ status }: { status: ServiceStatus["status"] }) {
    const config = {
        healthy: { label: "Sağlıklı", color: "bg-green-500", pulse: false },
        degraded: { label: "Düşük Performans", color: "bg-yellow-500", pulse: true },
        down: { label: "Çalışmıyor", color: "bg-red-500", pulse: true },
    };

    const { label, color, pulse } = config[status];

    return (
        <span className="flex items-center gap-2">
            <span className={cn(
                "w-2 h-2 rounded-full",
                color,
                pulse && "animate-pulse"
            )} />
            <span className={cn(
                "text-xs font-medium",
                status === "healthy" && "text-green-400",
                status === "degraded" && "text-yellow-400",
                status === "down" && "text-red-400"
            )}>
                {label}
            </span>
        </span>
    );
}

// =============================================================================
// Metric Card
// =============================================================================

interface MetricCardProps {
    label: string;
    value: number;
    unit?: string;
    icon: string;
    color: string;
    threshold?: { warning: number; critical: number };
}

function MetricCard({ label, value, unit = "%", icon, color, threshold }: MetricCardProps) {
    const getStatus = () => {
        if (!threshold) return "normal";
        if (value >= threshold.critical) return "critical";
        if (value >= threshold.warning) return "warning";
        return "normal";
    };

    const status = getStatus();

    return (
        <AppCard className="p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <StatusBadge status={status === "critical" ? "down" : status === "warning" ? "degraded" : "healthy"} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color }}>
                {value}{unit}
            </div>
            <div className="text-sm text-textMuted">{label}</div>
            <div className="mt-3 h-2 bg-background rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full transition-all",
                        status === "critical" ? "bg-red-500" :
                            status === "warning" ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </AppCard>
    );
}

// =============================================================================
// Service List
// =============================================================================

function ServiceList({ services }: { services: ServiceStatus[] }) {
    return (
        <div className="space-y-2">
            {services.map((service) => (
                <div
                    key={service.name}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                    <div className="flex items-center gap-3">
                        <StatusBadge status={service.status} />
                        <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                            <div className="text-textMuted">Yanıt Süresi</div>
                            <div className={cn(
                                service.responseTime > 200 ? "text-yellow-400" : "text-green-400"
                            )}>
                                {service.responseTime}ms
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-textMuted">Uptime</div>
                            <div className={cn(
                                service.uptime < 99 ? "text-yellow-400" : "text-green-400"
                            )}>
                                {service.uptime}%
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// Error List
// =============================================================================

function ErrorList({ errors }: { errors: ErrorLog[] }) {
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        const diff = now - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} dk önce`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} saat önce`;
        return `${Math.floor(hours / 24)} gün önce`;
    };

    return (
        <div className="space-y-2">
            {errors.map((error) => (
                <div
                    key={error.id}
                    className={cn(
                        "p-3 rounded-lg border-l-4",
                        error.level === "error" && "bg-red-500/10 border-red-500",
                        error.level === "warning" && "bg-yellow-500/10 border-yellow-500",
                        error.level === "info" && "bg-blue-500/10 border-blue-500"
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-medium text-sm">{error.message}</p>
                            <p className="text-xs text-textMuted mt-1">
                                {error.service} • {formatTime(error.timestamp)}
                            </p>
                        </div>
                        <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            error.level === "error" && "bg-red-500/20 text-red-400",
                            error.level === "warning" && "bg-yellow-500/20 text-yellow-400",
                            error.level === "info" && "bg-blue-500/20 text-blue-400"
                        )}>
                            {error.count}x
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// Quick Stats
// =============================================================================

function QuickStats({ apiStats, dbStats }: { apiStats: ApiStats; dbStats: DatabaseStats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AppCard className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                    {apiStats.requestsPerMinute.toLocaleString()}
                </div>
                <div className="text-xs text-textMuted">İstek/dk</div>
            </AppCard>
            <AppCard className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                    {apiStats.averageLatency}ms
                </div>
                <div className="text-xs text-textMuted">Ortalama Gecikme</div>
            </AppCard>
            <AppCard className="p-4 text-center">
                <div className={cn(
                    "text-2xl font-bold",
                    apiStats.errorRate > 1 ? "text-red-400" : "text-green-400"
                )}>
                    {apiStats.errorRate}%
                </div>
                <div className="text-xs text-textMuted">Hata Oranı</div>
            </AppCard>
            <AppCard className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                    {apiStats.activeUsers}
                </div>
                <div className="text-xs text-textMuted">Aktif Kullanıcı</div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function SystemHealthPage() {
    const [services, setServices] = useState<ServiceStatus[]>(mockServices);
    const [metrics, setMetrics] = useState<SystemMetrics>(mockMetrics);
    const [apiStats, setApiStats] = useState<ApiStats>(mockApiStats);
    const [dbStats, setDbStats] = useState<DatabaseStats>(mockDbStats);
    const [errors, setErrors] = useState<ErrorLog[]>(mockErrors);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Simulate data refresh
    const refreshData = useCallback(() => {
        // Simulate random metric changes
        setMetrics({
            cpu: Math.min(100, Math.max(0, mockMetrics.cpu + Math.random() * 10 - 5)),
            memory: Math.min(100, Math.max(0, mockMetrics.memory + Math.random() * 5 - 2.5)),
            disk: mockMetrics.disk,
            network: Math.min(100, Math.max(0, mockMetrics.network + Math.random() * 10 - 5)),
        });
        setApiStats({
            ...mockApiStats,
            requestsPerMinute: Math.round(mockApiStats.requestsPerMinute + Math.random() * 100 - 50),
            activeUsers: Math.round(mockApiStats.activeUsers + Math.random() * 10 - 5),
        });
        setLastRefresh(new Date());
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshData]);

    const overallHealth = services.every(s => s.status === "healthy")
        ? "healthy"
        : services.some(s => s.status === "down")
            ? "down"
            : "degraded";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <SectionHeader
                    title="🏥 Sistem Sağlığı"
                    subtitle="Altyapı ve servis durumu izleme"
                />
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-border bg-surface"
                        />
                        Otomatik Yenile
                    </label>
                    <AppButton variant="secondary" onClick={refreshData}>
                        🔄 Yenile
                    </AppButton>
                </div>
            </div>

            {/* Overall Status */}
            <AppCard className={cn(
                "p-6 border-l-4",
                overallHealth === "healthy" && "border-green-500 bg-green-500/10",
                overallHealth === "degraded" && "border-yellow-500 bg-yellow-500/10",
                overallHealth === "down" && "border-red-500 bg-red-500/10"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">
                            {overallHealth === "healthy" ? "✅" :
                                overallHealth === "degraded" ? "⚠️" : "❌"}
                        </span>
                        <div>
                            <h2 className="text-xl font-bold">
                                {overallHealth === "healthy" ? "Tüm Sistemler Çalışıyor" :
                                    overallHealth === "degraded" ? "Bazı Sistemlerde Sorun" :
                                        "Kritik Sistem Hatası"}
                            </h2>
                            <p className="text-sm text-textMuted">
                                Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={overallHealth} />
                </div>
            </AppCard>

            {/* Quick Stats */}
            <QuickStats apiStats={apiStats} dbStats={dbStats} />

            {/* System Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="CPU Kullanımı"
                    value={Math.round(metrics.cpu)}
                    icon="💻"
                    color="#3b82f6"
                    threshold={{ warning: 70, critical: 90 }}
                />
                <MetricCard
                    label="Bellek Kullanımı"
                    value={Math.round(metrics.memory)}
                    icon="🧠"
                    color="#8b5cf6"
                    threshold={{ warning: 80, critical: 95 }}
                />
                <MetricCard
                    label="Disk Kullanımı"
                    value={Math.round(metrics.disk)}
                    icon="💾"
                    color="#f59e0b"
                    threshold={{ warning: 80, critical: 95 }}
                />
                <MetricCard
                    label="Ağ Trafiği"
                    value={Math.round(metrics.network)}
                    icon="🌐"
                    color="#10b981"
                    threshold={{ warning: 80, critical: 95 }}
                />
            </div>

            {/* Services & Errors Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Services */}
                <AppCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">🔌 Servis Durumu</h3>
                    <ServiceList services={services} />
                </AppCard>

                {/* Database Stats */}
                <AppCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">🗄️ Veritabanı</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-background rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">
                                {dbStats.connections}/{dbStats.maxConnections}
                            </div>
                            <div className="text-xs text-textMuted">Bağlantılar</div>
                        </div>
                        <div className="p-4 bg-background rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {dbStats.queryTime}ms
                            </div>
                            <div className="text-xs text-textMuted">Ort. Sorgu Süresi</div>
                        </div>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-textMuted">Veritabanı Boyutu</span>
                            <span className="font-medium">{dbStats.size}</span>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Recent Errors */}
            <AppCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">🚨 Son Hatalar</h3>
                    <AppButton variant="secondary" className="text-sm">
                        Tümünü Gör
                    </AppButton>
                </div>
                <ErrorList errors={errors} />
            </AppCard>
        </div>
    );
}
