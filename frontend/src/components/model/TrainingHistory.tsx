'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrainingStatus as TrainingStatusType } from './TrainingStatus';

export interface TrainingAttempt {
    id: number;
    modelName: string;
    status: TrainingStatusType;
    startedAt: string;
    completedAt?: string;
    duration?: number; // in seconds
    error?: string;
    metrics?: {
        accuracy?: number;
        loss?: number;
        epochs: number;
    };
    imageCount: number;
}

interface TrainingHistoryProps {
    attempts: TrainingAttempt[];
    onRetry?: (attemptId: number) => void;
    onViewLogs?: (attemptId: number) => void;
    className?: string;
}

export function TrainingHistory({
    attempts,
    onRetry,
    onViewLogs,
    className,
}: TrainingHistoryProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const getStatusInfo = (status: TrainingStatusType) => {
        switch (status) {
            case 'completed':
                return { label: 'Başarılı', color: 'text-green-400', bg: 'bg-green-500/20', icon: '✅' };
            case 'failed':
                return { label: 'Başarısız', color: 'text-red-400', bg: 'bg-red-500/20', icon: '❌' };
            case 'training':
                return { label: 'Devam Ediyor', color: 'text-primary', bg: 'bg-primary/20', icon: '🔄' };
            default:
                return { label: 'Beklemede', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⏳' };
        }
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes < 60) return `${minutes}m ${secs}s`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stats = {
        total: attempts.length,
        successful: attempts.filter((a) => a.status === 'completed').length,
        failed: attempts.filter((a) => a.status === 'failed').length,
        inProgress: attempts.filter((a) => a.status === 'training' || a.status === 'preparing').length,
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-surface border border-border rounded-lg">
                    <p className="text-xs text-textMuted mb-1">Toplam Deneme</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-300 mb-1">Başarılı</p>
                    <p className="text-2xl font-bold text-green-400">{stats.successful}</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-300 mb-1">Başarısız</p>
                    <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-xs text-primary mb-1">Devam Eden</p>
                    <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Eğitim Geçmişi</h3>

                {attempts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <div className="text-xl font-semibold mb-2">Eğitim Geçmişi Yok</div>
                        <div className="text-textMuted">Henüz model eğitimi başlatılmamış</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {attempts.map((attempt) => {
                            const statusInfo = getStatusInfo(attempt.status);
                            const isExpanded = expandedId === attempt.id;

                            return (
                                <div
                                    key={attempt.id}
                                    className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
                                >
                                    {/* Header */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={cn('p-2 rounded-lg', statusInfo.bg)}>
                                                    <span className="text-xl">{statusInfo.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold truncate">{attempt.modelName}</h4>
                                                        <span className={cn('text-xs px-2 py-0.5 rounded', statusInfo.bg, statusInfo.color)}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-textMuted">
                                                        <span>📅 {formatDate(attempt.startedAt)}</span>
                                                        {attempt.duration && <span>⏱️ {formatDuration(attempt.duration)}</span>}
                                                        <span>🖼️ {attempt.imageCount} görsel</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expand Icon */}
                                            <svg
                                                className={cn(
                                                    'h-5 w-5 text-textMuted transition-transform',
                                                    isExpanded && 'rotate-180'
                                                )}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-4 border-t border-border">
                                            {/* Metrics */}
                                            {attempt.metrics && attempt.status === 'completed' && (
                                                <div className="pt-4">
                                                    <h5 className="text-sm font-medium mb-3">Metrikler</h5>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {attempt.metrics.accuracy !== undefined && (
                                                            <div className="p-3 bg-card rounded-lg">
                                                                <p className="text-xs text-textMuted mb-1">Doğruluk</p>
                                                                <p className="text-lg font-bold text-green-400">
                                                                    {(attempt.metrics.accuracy * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        )}
                                                        {attempt.metrics.loss !== undefined && (
                                                            <div className="p-3 bg-card rounded-lg">
                                                                <p className="text-xs text-textMuted mb-1">Kayıp</p>
                                                                <p className="text-lg font-bold text-blue-400">
                                                                    {attempt.metrics.loss.toFixed(4)}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="p-3 bg-card rounded-lg">
                                                            <p className="text-xs text-textMuted mb-1">Epoch</p>
                                                            <p className="text-lg font-bold text-primary">{attempt.metrics.epochs}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {attempt.status === 'failed' && attempt.error && (
                                                <div className="pt-4">
                                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                        <h5 className="text-sm font-medium text-red-400 mb-1">Hata Detayı</h5>
                                                        <p className="text-sm text-red-300">{attempt.error}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                {onViewLogs && (
                                                    <button
                                                        onClick={() => onViewLogs(attempt.id)}
                                                        className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:border-primary transition-colors"
                                                    >
                                                        📋 Logları Görüntüle
                                                    </button>
                                                )}
                                                {attempt.status === 'failed' && onRetry && (
                                                    <button
                                                        onClick={() => onRetry(attempt.id)}
                                                        className="px-4 py-2 text-sm bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                                                    >
                                                        🔄 Tekrar Dene
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
