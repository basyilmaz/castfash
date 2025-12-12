'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CreditWidgetProps {
    currentCredits: number;
    lowCreditThreshold?: number;
    className?: string;
    showBuyButton?: boolean;
}

export function CreditWidget({
    currentCredits,
    lowCreditThreshold = 100,
    className,
    showBuyButton = true,
}: CreditWidgetProps) {
    const [displayCredits, setDisplayCredits] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const isLowCredit = currentCredits < lowCreditThreshold;

    // Animated counter effect
    useEffect(() => {
        setIsAnimating(true);
        const duration = 1000; // 1 second
        const steps = 60;
        const increment = (currentCredits - displayCredits) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplayCredits(currentCredits);
                setIsAnimating(false);
                clearInterval(timer);
            } else {
                setDisplayCredits((prev) => Math.round(prev + increment));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [currentCredits]);

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('tr-TR').format(num);
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border-2 transition-all duration-300',
                isLowCredit
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-primary/30 bg-gradient-to-br from-primary/10 to-accentBlue/10',
                className
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'p-2 rounded-lg',
                            isLowCredit ? 'bg-red-500/20' : 'bg-primary/20'
                        )}>
                            <svg
                                className={cn(
                                    'h-5 w-5',
                                    isLowCredit ? 'text-red-400' : 'text-primary'
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-textMuted font-medium">Kredi Bakiyesi</p>
                            {isLowCredit && (
                                <p className="text-xs text-red-400 font-medium">⚠️ Düşük Bakiye</p>
                            )}
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className={cn(
                        'h-2 w-2 rounded-full animate-pulse',
                        isLowCredit ? 'bg-red-500' : 'bg-green-500'
                    )} />
                </div>

                {/* Credit Amount */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span
                            className={cn(
                                'text-4xl font-bold transition-all duration-300',
                                isAnimating && 'scale-110',
                                isLowCredit ? 'text-red-400' : 'text-primary'
                            )}
                        >
                            {formatNumber(displayCredits)}
                        </span>
                        <span className="text-lg text-textMuted">kredi</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isLowCredit
                                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                                    : 'bg-gradient-to-r from-primary to-accentBlue'
                            )}
                            style={{
                                width: `${Math.min((currentCredits / (lowCreditThreshold * 2)) * 100, 100)}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                {showBuyButton && (
                    <div className="flex gap-2">
                        <Link
                            href="/billing"
                            className={cn(
                                'flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-center transition-all duration-200 hover:scale-105',
                                isLowCredit
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-primary hover:bg-primary/90 text-black'
                            )}
                        >
                            💳 Kredi Satın Al
                        </Link>
                        <Link
                            href="/billing/history"
                            className="px-4 py-2.5 rounded-lg font-medium text-sm border-2 border-border hover:border-primary text-textMuted hover:text-white transition-all duration-200"
                        >
                            📊
                        </Link>
                    </div>
                )}

                {/* Low Credit Warning */}
                {isLowCredit && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-xs text-red-300">
                            Krediniz azalıyor! Kesintisiz hizmet için kredi satın alın.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
