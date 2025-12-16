"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";

interface LogFile {
    filename: string;
    size: number;
    sizeHuman: string;
    modified: string;
}

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    context?: string;
    data?: Record<string, any>;
    stack?: string;
    raw?: string;
}

export default function LogsPage() {
    const [logFiles, setLogFiles] = useState<LogFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showLive, setShowLive] = useState(true);

    const loadLogFiles = useCallback(async () => {
        try {
            const data = await apiFetch<{ files: LogFile[] }>("/system-admin/logs");
            setLogFiles(data.files || []);
        } catch (err: any) {
            console.error("Failed to load log files", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRecentLogs = useCallback(async () => {
        try {
            setLoadingContent(true);
            const data = await apiFetch<{ entries: LogEntry[] }>("/system-admin/logs/live/recent?minutes=5");
            setLogEntries(data.entries || []);
            setSelectedFile(null);
        } catch (err: any) {
            console.error("Failed to load recent logs", err);
        } finally {
            setLoadingContent(false);
        }
    }, []);

    const loadLogContent = async (filename: string) => {
        try {
            setLoadingContent(true);
            setShowLive(false);
            const data = await apiFetch<{ entries: LogEntry[] }>(`/system-admin/logs/${filename}?lines=100`);
            setLogEntries(data.entries || []);
            setSelectedFile(filename);
        } catch (err: any) {
            toast.error("Log içeriği yüklenemedi");
        } finally {
            setLoadingContent(false);
        }
    };

    useEffect(() => {
        loadLogFiles();
        if (showLive) {
            loadRecentLogs();
        }
    }, [loadLogFiles, loadRecentLogs, showLive]);

    useEffect(() => {
        if (!autoRefresh || !showLive) return;

        const interval = setInterval(() => {
            loadRecentLogs();
        }, 3000);

        return () => clearInterval(interval);
    }, [autoRefresh, showLive, loadRecentLogs]);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error':
                return <AppBadge variant="danger">ERROR</AppBadge>;
            case 'warn':
                return <AppBadge variant="warning">WARN</AppBadge>;
            case 'info':
                return <AppBadge variant="info">INFO</AppBadge>;
            case 'debug':
                return <AppBadge variant="secondary">DEBUG</AppBadge>;
            default:
                return <AppBadge variant="secondary">{level}</AppBadge>;
        }
    };

    const formatTime = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString('tr-TR');
        } catch {
            return timestamp;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Sistem Logları</h1>
                    <p className="text-textMuted">
                        Uygulama loglarını görüntüle ve izle
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-surface text-primary"
                        />
                        Otomatik Yenile (3s)
                    </label>
                    <AppButton
                        variant={showLive ? "primary" : "outline"}
                        onClick={() => {
                            setShowLive(true);
                            loadRecentLogs();
                        }}
                    >
                        🔴 Canlı
                    </AppButton>
                    <AppButton variant="outline" onClick={loadLogFiles}>
                        🔄 Yenile
                    </AppButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Log Files Sidebar */}
                <div className="lg:col-span-1">
                    <AppCard className="p-4">
                        <h3 className="font-semibold text-white mb-4">📁 Log Dosyaları</h3>
                        {logFiles.length === 0 ? (
                            <p className="text-sm text-textMuted">Henüz log dosyası yok</p>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {logFiles.map((file) => (
                                    <button
                                        key={file.filename}
                                        onClick={() => loadLogContent(file.filename)}
                                        className={`w-full text-left p-3 rounded-lg transition ${selectedFile === file.filename
                                                ? "bg-primary/20 border border-primary"
                                                : "bg-surfaceAlt hover:bg-surfaceAlt/80"
                                            }`}
                                    >
                                        <div className="text-sm font-medium text-white truncate">
                                            {file.filename}
                                        </div>
                                        <div className="text-xs text-textMuted mt-1">
                                            {file.sizeHuman} • {new Date(file.modified).toLocaleString('tr-TR')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </AppCard>
                </div>

                {/* Log Content */}
                <div className="lg:col-span-3">
                    <AppCard className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">
                                {showLive ? "🔴 Canlı Loglar (Son 5 dakika)" : `📄 ${selectedFile || "Log Seçin"}`}
                            </h3>
                            {loadingContent && (
                                <span className="text-sm text-textMuted">Yükleniyor...</span>
                            )}
                        </div>

                        {logEntries.length === 0 ? (
                            <div className="text-center py-12 text-textMuted">
                                {showLive ? "Henüz log kaydı yok" : "Görüntülemek için bir log dosyası seçin"}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto font-mono text-sm">
                                {logEntries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg ${entry.level === 'error'
                                                ? 'bg-red-500/10 border border-red-500/20'
                                                : entry.level === 'warn'
                                                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                                                    : 'bg-surfaceAlt'
                                            }`}
                                    >
                                        {entry.raw ? (
                                            <span className="text-textSecondary">{entry.raw}</span>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-textMuted text-xs">
                                                        {formatTime(entry.timestamp)}
                                                    </span>
                                                    {getLevelBadge(entry.level)}
                                                    {entry.context && (
                                                        <span className="text-xs text-purple-400">[{entry.context}]</span>
                                                    )}
                                                </div>
                                                <div className="text-white">{entry.message}</div>
                                                {entry.data && Object.keys(entry.data).length > 0 && (
                                                    <div className="mt-2 text-xs text-textSecondary">
                                                        {Object.entries(entry.data).map(([key, value]) => (
                                                            <span key={key} className="mr-3">
                                                                <span className="text-cyan-400">{key}:</span>{' '}
                                                                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {entry.stack && (
                                                    <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap">
                                                        {entry.stack}
                                                    </pre>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </AppCard>
                </div>
            </div>

            {/* Legend */}
            <AppCard className="p-4 bg-blue-500/5 border-blue-500/30">
                <h3 className="font-semibold text-white mb-3">📊 Log Seviyeleri</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <AppBadge variant="danger">ERROR</AppBadge>
                        <span className="text-textMuted">Kritik hatalar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppBadge variant="warning">WARN</AppBadge>
                        <span className="text-textMuted">Uyarılar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppBadge variant="info">INFO</AppBadge>
                        <span className="text-textMuted">Bilgi mesajları</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppBadge variant="secondary">DEBUG</AppBadge>
                        <span className="text-textMuted">Geliştirme detayları</span>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}
