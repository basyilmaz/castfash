'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/http';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        async function loadBalance() {
            try {
                const response = await apiFetch<{ balance: number }>('/credits/balance');
                setBalance(response?.balance || 0);
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            } finally {
                setLoading(false);
            }
        }

        loadBalance();
    }, []);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <AppCard className="w-full max-w-md p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 text-green-400">
                    Ödeme Başarılı! 🎉
                </h1>

                <p className="text-textMuted mb-6">
                    Kredi satın alımınız başarıyla tamamlandı. Krediler hesabınıza eklendi.
                </p>

                {/* Updated Balance */}
                {!loading && balance !== null && (
                    <div className="p-4 bg-surface rounded-xl mb-6">
                        <p className="text-sm text-textMuted mb-1">Güncel Bakiyeniz</p>
                        <p className="text-3xl font-bold text-primary">
                            {balance.toLocaleString()}
                            <span className="text-lg ml-2 text-textMuted">Kredi</span>
                        </p>
                    </div>
                )}

                {/* Transaction ID */}
                {sessionId && (
                    <div className="p-3 bg-surface/50 rounded-lg mb-6">
                        <p className="text-xs text-textMuted">İşlem No</p>
                        <p className="text-sm font-mono text-gray-400 break-all">
                            {sessionId.slice(0, 30)}...
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <Link href="/dashboard" className="block">
                        <AppButton className="w-full">
                            Görsel Üretmeye Başla
                        </AppButton>
                    </Link>

                    <Link href="/billing/packages" className="block">
                        <AppButton variant="secondary" className="w-full">
                            Daha Fazla Kredi Al
                        </AppButton>
                    </Link>
                </div>

                {/* Support Note */}
                <p className="text-xs text-textMuted mt-6">
                    Sorun mu yaşıyorsunuz?{' '}
                    <Link href="/support" className="text-primary hover:underline">
                        Destek ekibimizle iletişime geçin
                    </Link>
                </p>
            </AppCard>
        </div>
    );
}
