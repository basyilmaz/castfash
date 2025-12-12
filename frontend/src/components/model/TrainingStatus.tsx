'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type TrainingStatus = 'pending' | 'preparing' | 'training' | 'completed' | 'failed';

export interface TrainingProgress {
    status: TrainingStatus;
    currentStep: number;
    totalSteps: number;
    currentEpoch?: number;
    totalEpochs?: number;
    estimatedTimeRemaining?: number; // in seconds
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

interface TrainingStatusProps {
    progress: TrainingProgress;
    modelName: string;
    className?: string;
    onCancel?: () => void;
    onRetry?: () => void;
}

export function TrainingStatus({
    progress,
    modelName,
    className,
    onCancel,
    onRetry,
}: TrainingStatusProps) {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (progress.status === 'training' && progress.startedAt) {
            const interval = setInterval(() => {
                const start = new Date(progress.startedAt!).getTime();
                const now = Date.now();
                setElapsedTime(Math.floor((now - start) / 1000));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [progress.status, progress.startedAt]);

    const getStatusInfo = (status: TrainingStatus) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Beklemede',
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-500/30',
                    icon: '⏳',
                };
            case 'preparing':
                return {
                    label: 'Hazırlanıyor',
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/20',
                    border: 'border-blue-500/30',
                    icon: '📦',
                };
            case 'training':
                return {
                    label: 'Eğitiliyor',
                    color: 'text-primary',
                    bg: 'bg-primary/20',
                    border: 'border-primary/30',
                    icon: '🔄',
                };
            case 'completed':
                return {
                    label: 'Tamamlandı',
                    color: 'text-green-400',
                    bg: 'bg-green-500/20',
                    border: 'border-green-500/30',
                    icon: '✅',
                };
            case 'failed':
                return {
                    label: 'Başarısız',
                    color: 'text-red-400',
                    bg: 'bg-red-500/20',
                    border: 'border-red-500/30',
                    icon: '❌',
                };
        }
    };

    const statusInfo = getStatusInfo(progress.status);
    const percentage = Math.round((progress.currentStep / progress.totalSteps) * 100);
    const isActive = progress.status === 'training' || progress.status === 'preparing';

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes < 60) return `${minutes}m ${secs}s`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStepDescription = () => {
        if (progress.status === 'pending') return 'Sırada bekleniyor...';
        if (progress.status === 'preparing') return 'Model hazırlanıyor...';
        if (progress.status === 'training') {
            if (progress.currentEpoch && progress.totalEpochs) {
                return `Epoch ${progress.currentEpoch}/${progress.totalEpochs} - Adım ${progress.currentStep}/${progress.totalSteps}`;
            }
            return `Adım ${progress.currentStep}/${progress.totalSteps}`;
        }
        if (progress.status === 'completed') return 'Model eğitimi tamamlandı';
        if (progress.status === 'failed') return progress.error || 'Eğitim başarısız oldu';
        return '';
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className={cn('p-6 rounded-xl border-2', statusInfo.bg, statusInfo.border)}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className={cn('text-3xl', isActive && 'animate-pulse')}>
                            {statusInfo.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">{modelName}</h3>
                            <div className="flex items-center gap-2">
                                <span className={cn('text-sm font-medium', statusInfo.color)}>
                                    {statusInfo.label}
                                </span>
                                {isActive && (
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {isActive && onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                İptal Et
                            </button>
                        )}
                        {progress.status === 'failed' && onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1.5 text-sm bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                            >
                                Tekrar Dene
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {(isActive || progress.status === 'completed') && (
                    <div className="space-y-2">
                        <div className="relative h-3 bg-surface rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                                    progress.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                                )}
                                style={{ width: `${percentage}%` }}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className={statusInfo.color}>{percentage}%</span>
                            <span className="text-textMuted">{getStepDescription()}</span>
                        </div>
                    </div>
                )}

                {/* Time Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                    {progress.startedAt && (
                        <div>
                            <p className="text-xs text-textMuted mb-1">Geçen Süre</p>
                            <p className="text-sm font-medium">{formatTime(elapsedTime)}</p>
                        </div>
                    )}

                    {progress.estimatedTimeRemaining !== undefined && isActive && (
                        <div>
                            <p className="text-xs text-textMuted mb-1">Tahmini Kalan</p>
                            <p className="text-sm font-medium text-primary">
                                {formatTime(progress.estimatedTimeRemaining)}
                            </p>
                        </div>
                    )}

                    {progress.completedAt && (
                        <div>
                            <p className="text-xs text-textMuted mb-1">Tamamlanma</p>
                            <p className="text-sm font-medium">
                                {new Date(progress.completedAt).toLocaleString('tr-TR')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {progress.status === 'failed' && progress.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{progress.error}</p>
                    </div>
                )}
            </div>

            {/* Training Steps */}
            {isActive && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-textMuted">Eğitim Adımları</h4>
                    <div className="space-y-1">
                        {[
                            { step: 1, label: 'Veri Hazırlama', completed: progress.currentStep >= 1 },
                            { step: 2, label: 'Model İnşası', completed: progress.currentStep >= 2 },
                            { step: 3, label: 'Eğitim', completed: progress.currentStep >= 3 },
                            { step: 4, label: 'Doğrulama', completed: progress.currentStep >= 4 },
                            { step: 5, label: 'Optimizasyon', completed: progress.currentStep >= 5 },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className={cn(
                                    'flex items-center gap-3 p-2 rounded-lg transition-colors',
                                    item.completed ? 'bg-green-500/10' : 'bg-surface'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                                        item.completed
                                            ? 'bg-green-500 text-white'
                                            : progress.currentStep === item.step
                                                ? 'bg-primary text-black animate-pulse'
                                                : 'bg-surface border border-border text-textMuted'
                                    )}
                                >
                                    {item.completed ? '✓' : item.step}
                                </div>
                                <span
                                    className={cn(
                                        'text-sm',
                                        item.completed
                                            ? 'text-green-400'
                                            : progress.currentStep === item.step
                                                ? 'text-primary font-medium'
                                                : 'text-textMuted'
                                    )}
                                >
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
