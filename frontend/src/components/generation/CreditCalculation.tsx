'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CreditCalculationProps {
    quality: 'fast' | 'standard' | 'high';
    steps?: number;
    quantity?: number;
    pricing: {
        fast: number;
        standard: number;
        high: number;
    };
    currentCredits: number;
    className?: string;
    onInsufficientCredits?: () => void;
}

export function CreditCalculation({
    quality,
    steps = 50,
    quantity = 1,
    pricing,
    currentCredits,
    className,
    onInsufficientCredits,
}: CreditCalculationProps) {
    const calculation = useMemo(() => {
        const basePrice = pricing[quality];
        const stepMultiplier = steps / 50; // 50 is base steps
        const totalCost = Math.ceil(basePrice * stepMultiplier * quantity);
        const remainingCredits = currentCredits - totalCost;
        const isInsufficient = remainingCredits < 0;

        return {
            basePrice,
            stepMultiplier,
            totalCost,
            remainingCredits,
            isInsufficient,
        };
    }, [quality, steps, quantity, pricing, currentCredits]);

    const getQualityInfo = (q: string) => {
        switch (q) {
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

    const qualityInfo = getQualityInfo(quality);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Calculation Card */}
            <div className={cn(
                'p-4 rounded-xl border-2 transition-all',
                calculation.isInsufficient
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-primary/30 bg-surface'
            )}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-2xl">{qualityInfo.icon}</span>
                        <span>Kredi Hesaplama</span>
                    </h3>
                    <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        calculation.isInsufficient
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-primary/20 text-primary'
                    )}>
                        {qualityInfo.label} Kalite
                    </div>
                </div>

                {/* Calculation Details */}
                <div className="space-y-3">
                    {/* Base Price */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-textMuted">Temel Fiyat:</span>
                        <span className="font-medium">{calculation.basePrice} kredi</span>
                    </div>

                    {/* Steps Multiplier */}
                    {steps !== 50 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-textMuted">Adım Çarpanı:</span>
                            <span className="font-medium">×{calculation.stepMultiplier.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Quantity */}
                    {quantity > 1 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-textMuted">Miktar:</span>
                            <span className="font-medium">×{quantity}</span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-border" />

                    {/* Total Cost */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Toplam Maliyet:</span>
                        <span className={cn(
                            'text-xl font-bold',
                            calculation.isInsufficient ? 'text-red-400' : 'text-primary'
                        )}>
                            {calculation.totalCost} kredi
                        </span>
                    </div>

                    {/* Current Balance */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-textMuted">Mevcut Bakiye:</span>
                        <span className="font-medium">{currentCredits} kredi</span>
                    </div>

                    {/* Remaining Balance */}
                    <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        calculation.isInsufficient
                            ? 'bg-red-500/20 border border-red-500/30'
                            : 'bg-green-500/20 border border-green-500/30'
                    )}>
                        <span className="text-sm font-semibold">
                            {calculation.isInsufficient ? 'Eksik Kredi:' : 'Kalan Bakiye:'}
                        </span>
                        <span className={cn(
                            'text-lg font-bold',
                            calculation.isInsufficient ? 'text-red-400' : 'text-green-400'
                        )}>
                            {Math.abs(calculation.remainingCredits)} kredi
                        </span>
                    </div>
                </div>

                {/* Insufficient Credits Warning */}
                {calculation.isInsufficient && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg
                                className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-400">Yetersiz Kredi</p>
                                <p className="text-xs text-red-300 mt-1">
                                    Bu işlemi gerçekleştirmek için {Math.abs(calculation.remainingCredits)} kredi daha gerekiyor.
                                </p>
                                {onInsufficientCredits && (
                                    <button
                                        onClick={onInsufficientCredits}
                                        className="mt-2 text-xs font-medium text-red-400 hover:text-red-300 underline"
                                    >
                                        Kredi Satın Al →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quality Comparison */}
            <div className="grid grid-cols-3 gap-2">
                {(['fast', 'standard', 'high'] as const).map((q) => {
                    const info = getQualityInfo(q);
                    const cost = Math.ceil(pricing[q] * (steps / 50) * quantity);
                    const isSelected = q === quality;

                    return (
                        <div
                            key={q}
                            className={cn(
                                'p-3 rounded-lg border-2 transition-all text-center',
                                isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-surface/50'
                            )}
                        >
                            <div className="text-xl mb-1">{info.icon}</div>
                            <div className="text-xs text-textMuted mb-1">{info.label}</div>
                            <div className={cn(
                                'text-sm font-bold',
                                isSelected ? 'text-primary' : 'text-white'
                            )}>
                                {cost}
                            </div>
                            <div className="text-xs text-textMuted">kredi</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
