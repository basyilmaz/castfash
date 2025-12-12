'use client';

import { cn } from '@/lib/utils';

export interface QueueItem {
    id: number;
    position: number;
    productName: string;
    modelName: string;
    quality: 'fast' | 'standard' | 'high';
    estimatedWaitTime: number; // seconds
}

interface QueueStatusProps {
    currentItem?: QueueItem;
    queueLength: number;
    averageProcessingTime: number; // seconds
    className?: string;
}

export function QueueStatus({
    currentItem,
    queueLength,
    averageProcessingTime,
    className,
}: QueueStatusProps) {
    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds} saniye`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes < 60) return `${minutes} dakika ${secs > 0 ? `${secs} saniye` : ''}`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours} saat ${mins > 0 ? `${mins} dakika` : ''}`;
    };

    const getQualityInfo = (quality: string) => {
        switch (quality) {
            case 'fast':
                return { label: 'Hızlı', color: 'text-green-400', icon: '⚡' };
            case 'standard':
                return { label: 'Standart', color: 'text-blue-400', icon: '⭐' };
            case 'high':
                return { label: 'Yüksek', color: 'text-purple-400', icon: '💎' };
            default:
                return { label: 'Standart', color: 'text-blue-400', icon: '⭐' };
        }
    };

    const getQueueStatus = () => {
        if (queueLength === 0) {
            return { label: 'Boş', color: 'text-green-400', bg: 'bg-green-500/20' };
        } else if (queueLength < 5) {
            return { label: 'Az Yoğun', color: 'text-blue-400', bg: 'bg-blue-500/20' };
        } else if (queueLength < 10) {
            return { label: 'Orta Yoğun', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        } else {
            return { label: 'Çok Yoğun', color: 'text-red-400', bg: 'bg-red-500/20' };
        }
    };

    const queueStatus = getQueueStatus();

    return (
        <div className={cn('space-y-4', className)}>
            {/* Queue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Queue Length */}
                <div className={cn('p-4 rounded-lg border', queueStatus.bg, 'border-border')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-textMuted mb-1">Sıradaki İşlem</p>
                            <p className={cn('text-2xl font-bold', queueStatus.color)}>{queueLength}</p>
                        </div>
                        <div className="text-3xl">📊</div>
                    </div>
                    <p className={cn('text-xs mt-2', queueStatus.color)}>{queueStatus.label}</p>
                </div>

                {/* Average Processing Time */}
                <div className="p-4 bg-surface rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-textMuted mb-1">Ort. İşlem Süresi</p>
                            <p className="text-2xl font-bold text-primary">
                                {Math.round(averageProcessingTime / 60)}dk
                            </p>
                        </div>
                        <div className="text-3xl">⏱️</div>
                    </div>
                    <p className="text-xs text-textMuted mt-2">Son 10 işlem ortalaması</p>
                </div>

                {/* Estimated Wait */}
                {currentItem && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-primary mb-1">Tahmini Bekleme</p>
                                <p className="text-2xl font-bold text-primary">
                                    {formatTime(currentItem.estimatedWaitTime)}
                                </p>
                            </div>
                            <div className="text-3xl">⏳</div>
                        </div>
                        <p className="text-xs text-textMuted mt-2">Sıranız: #{currentItem.position}</p>
                    </div>
                )}
            </div>

            {/* Current Item Details */}
            {currentItem && (
                <div className="p-4 bg-surface rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold">Sizin İşleminiz</h4>
                        <span className={cn('text-xs px-2 py-1 rounded', queueStatus.bg, queueStatus.color)}>
                            Sıra #{currentItem.position}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-textMuted">Ürün:</span>
                            <span className="font-medium">{currentItem.productName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-textMuted">Model:</span>
                            <span className="font-medium">{currentItem.modelName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-textMuted">Kalite:</span>
                            <span className={cn('font-medium flex items-center gap-1', getQualityInfo(currentItem.quality).color)}>
                                {getQualityInfo(currentItem.quality).icon}
                                {getQualityInfo(currentItem.quality).label}
                            </span>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-textMuted">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span>Sırada bekleniyor...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue Info */}
            <div className="p-4 bg-surface/50 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div className="flex-1">
                        <h5 className="text-sm font-medium mb-2">Sıra Bilgisi</h5>
                        <ul className="text-xs text-textMuted space-y-1">
                            <li>• İşlemler kalite sırasına göre önceliklendirilir (Hızlı → Standart → Yüksek)</li>
                            <li>• Tahmini süreler gerçek sürelere göre değişebilir</li>
                            <li>• Yüksek yoğunluk dönemlerinde bekleme süresi artabilir</li>
                            <li>• İşleminiz tamamlandığında email ile bilgilendirileceksiniz</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
