'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type GenerationStep =
    | 'queued'
    | 'preparing'
    | 'loading_model'
    | 'generating'
    | 'post_processing'
    | 'completed'
    | 'failed';

export interface GenerationProgress {
    step: GenerationStep;
    progress: number; // 0-100
    currentImage?: number;
    totalImages?: number;
    estimatedTimeRemaining?: number; // seconds
    message?: string;
    error?: string;
}

interface GenerationProgressProps {
    progress: GenerationProgress;
    onCancel?: () => void;
    className?: string;
}

export function GenerationProgressComponent({
    progress,
    onCancel,
    className,
}: GenerationProgressProps) {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (progress.step !== 'completed' && progress.step !== 'failed') {
            const interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [progress.step]);

    const getStepInfo = (step: GenerationStep) => {
        switch (step) {
            case 'queued':
                return { label: 'Sırada', icon: '⏳', color: 'text-yellow-400' };
            case 'preparing':
                return { label: 'Hazırlanıyor', icon: '📦', color: 'text-blue-400' };
            case 'loading_model':
                return { label: 'Model Yükleniyor', icon: '🤖', color: 'text-purple-400' };
            case 'generating':
                return { label: 'Üretiliyor', icon: '✨', color: 'text-primary' };
            case 'post_processing':
                return { label: 'İşleniyor', icon: '🎨', color: 'text-green-400' };
            case 'completed':
                return { label: 'Tamamlandı', icon: '✅', color: 'text-green-400' };
            case 'failed':
                return { label: 'Başarısız', icon: '❌', color: 'text-red-400' };
        }
    };

    const stepInfo = getStepInfo(progress.step);
    const isActive = !['completed', 'failed'].includes(progress.step);

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    const steps: GenerationStep[] = [
        'queued',
        'preparing',
        'loading_model',
        'generating',
        'post_processing',
        'completed',
    ];

    const currentStepIndex = steps.indexOf(progress.step);

    return (
        <div className={cn('space-y-6', className)}>
            {/* Main Progress Card */}
            <div className={cn(
                'p-6 rounded-xl border-2 transition-all',
                progress.step === 'completed' ? 'border-green-500/50 bg-green-500/10' :
                    progress.step === 'failed' ? 'border-red-500/50 bg-red-500/10' :
                        'border-primary/30 bg-primary/10'
            )}>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                        <div className={cn('text-4xl', isActive && 'animate-pulse')}>
                            {stepInfo.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Görsel Üretimi</h3>
                            <p className={cn('text-sm font-medium', stepInfo.color)}>
                                {stepInfo.label}
                            </p>
                        </div>
                    </div>

                    {isActive && onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            İptal Et
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="relative h-4 bg-surface rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                                progress.step === 'completed' ? 'bg-green-500' :
                                    progress.step === 'failed' ? 'bg-red-500' :
                                        'bg-gradient-to-r from-primary to-accentBlue'
                            )}
                            style={{ width: `${progress.progress}%` }}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className={cn('font-bold', stepInfo.color)}>
                            {progress.progress}%
                        </span>
                        {progress.currentImage && progress.totalImages && (
                            <span className="text-textMuted">
                                {progress.currentImage}/{progress.totalImages} görsel
                            </span>
                        )}
                        {progress.estimatedTimeRemaining !== undefined && isActive && (
                            <span className="text-primary">
                                ~{formatTime(progress.estimatedTimeRemaining)} kaldı
                            </span>
                        )}
                    </div>
                </div>

                {/* Message */}
                {progress.message && (
                    <div className="mt-4 p-3 bg-surface rounded-lg">
                        <p className="text-sm text-textMuted">{progress.message}</p>
                    </div>
                )}

                {/* Error */}
                {progress.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{progress.error}</p>
                    </div>
                )}

                {/* Time Info */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                    <div>
                        <span className="text-textMuted">Geçen Süre: </span>
                        <span className="font-medium">{formatTime(elapsedTime)}</span>
                    </div>
                    {progress.estimatedTimeRemaining !== undefined && isActive && (
                        <div>
                            <span className="text-textMuted">Tahmini Toplam: </span>
                            <span className="font-medium">
                                {formatTime(elapsedTime + progress.estimatedTimeRemaining)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-textMuted">İşlem Adımları</h4>
                <div className="space-y-2">
                    {steps.slice(0, -1).map((step, index) => {
                        const info = getStepInfo(step);
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <div
                                key={step}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg transition-all',
                                    isCompleted && 'bg-green-500/10',
                                    isCurrent && 'bg-primary/10 border-2 border-primary/30',
                                    isPending && 'bg-surface/50'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                                        isCompleted && 'bg-green-500 text-white',
                                        isCurrent && 'bg-primary text-black animate-pulse',
                                        isPending && 'bg-surface border border-border text-textMuted'
                                    )}
                                >
                                    {isCompleted ? '✓' : info.icon}
                                </div>
                                <div className="flex-1">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            isCompleted && 'text-green-400',
                                            isCurrent && 'text-primary',
                                            isPending && 'text-textMuted'
                                        )}
                                    >
                                        {info.label}
                                    </p>
                                    {isCurrent && progress.message && (
                                        <p className="text-xs text-textMuted mt-1">{progress.message}</p>
                                    )}
                                </div>
                                {isCurrent && (
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
