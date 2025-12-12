"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { toast } from "sonner";

interface AuditLog {
    id: number;
    action: string;
    userId: number | null;
    targetType: string | null;
    targetId: number | null;
    changes: any;
    metadata: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

interface AuditStats {
    total: number;
    last24Hours: number;
    last7Days: number;
    topActions: Array<{
        action: string;
        count: number;
    }>;
}

export default function AuditLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");
    const [targetTypeFilter, setTargetTypeFilter] = useState("");
    const [userIdFilter, setUserIdFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [actionFilter, targetTypeFilter, userIdFilter, page]);

    async function loadLogs() {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                skip: String((page - 1) * pageSize),
                take: String(pageSize),
            });

            if (actionFilter) params.append("action", actionFilter);
            if (targetTypeFilter) params.append("targetType", targetTypeFilter);
            if (userIdFilter) params.append("userId", userIdFilter);

            const data = await apiFetch<{ logs: AuditLog[]; total: number }>(
                `/system-admin/audit-logs?${params.toString()}`
            );
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to load audit logs", err);
            toast.error("Audit loglar yüklenemedi");
            setLogs([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    async function loadStats() {
        try {
            const data = await apiFetch<AuditStats>("/system-admin/audit-logs/stats");
            setStats(data);
        } catch (err) {
            console.error("Failed to load audit stats", err);
        }
    }

    function exportLogs() {
        const csv = [
            ["ID", "İşlem", "Hedef Tip", "Hedef ID", "Kullanıcı ID", "IP", "Tarih"].join(","),
            ...logs.map(log => [
                log.id,
                log.action,
                log.targetType || "",
                log.targetId || "",
                log.userId || "",
                log.ipAddress || "",
                new Date(log.createdAt).toLocaleString("tr-TR"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Audit loglar dışa aktarıldı!");
    }

    function toggleExpanded(logId: number) {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId);
        } else {
            newExpanded.add(logId);
        }
        setExpandedLogs(newExpanded);
    }

    const getActionBadge = (action: string) => {
        if (action.includes("DELETED")) return <AppBadge variant="danger">{action}</AppBadge>;
        if (action.includes("CREATED")) return <AppBadge variant="success">{action}</AppBadge>;
        if (action.includes("UPDATED") || action.includes("ADJUSTED")) return <AppBadge variant="warning">{action}</AppBadge>;
        return <AppBadge variant="info">{action}</AppBadge>;
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
                    <p className="text-textMuted">Sistem aktivite geçmişi ve değişiklik kayıtları</p>
                </div>
                <AppButton variant="outline" onClick={exportLogs}>
                    📥 Dışa Aktar
                </AppButton>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AppCard className="p-6">
                        <div className="text-sm text-textMuted mb-1">Toplam Log</div>
                        <div className="text-3xl font-bold text-primary">
                            {stats.total.toLocaleString()}
                        </div>
                    </AppCard>
                    <AppCard className="p-6">
                        <div className="text-sm text-textMuted mb-1">Son 24 Saat</div>
                        <div className="text-3xl font-bold text-accent">
                            {stats.last24Hours}
                        </div>
                    </AppCard>
                    <AppCard className="p-6">
                        <div className="text-sm text-textMuted mb-1">Son 7 Gün</div>
                        <div className="text-3xl font-bold text-secondary">
                            {stats.last7Days}
                        </div>
                    </AppCard>
                </div>
            )}

            {/* Top Actions */}
            {stats && stats.topActions.length > 0 && (
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">En Sık Yapılan İşlemler</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {stats.topActions.map((item) => (
                            <div key={item.action} className="text-center">
                                <div className="text-2xl font-bold text-primary mb-1">
                                    {item.count}
                                </div>
                                <div className="text-xs text-textMuted">{item.action}</div>
                            </div>
                        ))}
                    </div>
                </AppCard>
            )}

            {/* Filters */}
            <AppCard className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            İşlem Tipi
                        </label>
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="">Tümü</option>
                            <option value="USER_CREATED">Kullanıcı Oluşturma</option>
                            <option value="USER_UPDATED">Kullanıcı Güncelleme</option>
                            <option value="USER_DELETED">Kullanıcı Silme</option>
                            <option value="ORGANIZATION_CREATED">Organizasyon Oluşturma</option>
                            <option value="ORGANIZATION_UPDATED">Organizasyon Güncelleme</option>
                            <option value="ORGANIZATION_DELETED">Organizasyon Silme</option>
                            <option value="CREDITS_ADJUSTED">Kredi Düzenleme</option>
                            <option value="SYSTEM_CONFIG_UPDATED">Sistem Ayarı Güncelleme</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Hedef Tipi
                        </label>
                        <select
                            value={targetTypeFilter}
                            onChange={(e) => {
                                setTargetTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="">Tümü</option>
                            <option value="User">Kullanıcı</option>
                            <option value="Organization">Organizasyon</option>
                            <option value="Product">Ürün</option>
                            <option value="Model">Model</option>
                        </select>
                    </div>
                    <div>
                        <AppInput
                            label="Kullanıcı ID"
                            placeholder="Kullanıcı ID ile filtrele..."
                            value={userIdFilter}
                            onChange={(e) => {
                                setUserIdFilter(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </AppCard>

            {/* Logs List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-textMuted text-center py-8">Yükleniyor...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <div className="text-xl font-semibold mb-2">Log bulunamadı</div>
                        <div className="text-textMuted mb-6 max-w-md mx-auto">
                            Seçili filtrelere uygun audit log kaydı yok
                        </div>
                    </div>
                ) : (
                    logs.map((log) => (
                        <AppCard key={log.id} className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    {getActionBadge(log.action)}
                                    <div className="flex-1">
                                        <div className="font-semibold">
                                            {log.targetType && log.targetId && (
                                                <span
                                                    className="cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => {
                                                        if (log.targetType === "User") {
                                                            router.push(`/system-admin/users/${log.targetId}`);
                                                        } else if (log.targetType === "Organization") {
                                                            router.push(`/system-admin/organizations/${log.targetId}`);
                                                        }
                                                    }}
                                                >
                                                    {log.targetType} #{log.targetId}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-textMuted">
                                            {new Date(log.createdAt).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {log.userId && (
                                        <div
                                            className="text-sm text-textMuted cursor-pointer hover:text-primary"
                                            onClick={() => router.push(`/system-admin/users/${log.userId}`)}
                                        >
                                            User #{log.userId}
                                        </div>
                                    )}
                                    {(log.changes || log.metadata) && (
                                        <AppButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpanded(log.id)}
                                        >
                                            {expandedLogs.has(log.id) ? "▼ Gizle" : "▶ Detay"}
                                        </AppButton>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedLogs.has(log.id) && (
                                <>
                                    {/* Changes */}
                                    {log.changes && (
                                        <div className="mt-3 p-3 bg-surface rounded-lg border border-border">
                                            <div className="text-xs text-textMuted mb-2">Değişiklikler:</div>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                {log.changes.before && (
                                                    <div>
                                                        <div className="text-xs text-textMuted mb-1">Önce:</div>
                                                        <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(log.changes.before, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {log.changes.after && (
                                                    <div>
                                                        <div className="text-xs text-textMuted mb-1">Sonra:</div>
                                                        <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(log.changes.after, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="mt-2 p-3 bg-surface rounded-lg border border-border">
                                            <div className="text-xs text-textMuted mb-1">Metadata:</div>
                                            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {/* IP & User Agent */}
                                    <div className="mt-2 flex gap-4 text-xs text-textMuted">
                                        {log.ipAddress && <div>IP: {log.ipAddress}</div>}
                                        {log.userAgent && (
                                            <div className="truncate max-w-md">UA: {log.userAgent}</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </AppCard>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && logs.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-textMuted">
                        Gösterilen: {logs.length} / Toplam: {total.toLocaleString()}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Önceki
                            </AppButton>
                            <div className="text-sm text-textMuted">
                                Sayfa {page} / {totalPages}
                            </div>
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Sonraki →
                            </AppButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
