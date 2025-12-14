'use client';

import React from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import Link from 'next/link';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <AppCard className="w-full max-w-md p-8 text-center">
                {/* Cancel Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 text-yellow-400">
                    Ödeme İptal Edildi
                </h1>

                <p className="text-textMuted mb-6">
                    Ödeme işleminiz tamamlanmadı. Kredi kartınızdan herhangi bir ücret kesilmedi.
                </p>

                {/* Info Box */}
                <div className="p-4 bg-surface rounded-xl mb-6 text-left">
                    <h3 className="font-medium mb-2">Neden iptal olmuş olabilir?</h3>
                    <ul className="text-sm text-textMuted space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            <span>Ödeme sayfasını kendiniz kapattınız</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            <span>Kart bilgilerinde bir sorun oluştu</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            <span>Bağlantı kesildi veya zaman aşımı oluştu</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link href="/billing/packages" className="block">
                        <AppButton className="w-full">
                            Tekrar Dene
                        </AppButton>
                    </Link>

                    <Link href="/dashboard" className="block">
                        <AppButton variant="secondary" className="w-full">
                            Ana Sayfaya Dön
                        </AppButton>
                    </Link>
                </div>

                {/* Support Note */}
                <p className="text-xs text-textMuted mt-6">
                    Yardıma mı ihtiyacınız var?{' '}
                    <Link href="/support" className="text-primary hover:underline">
                        Destek ekibimizle iletişime geçin
                    </Link>
                </p>
            </AppCard>
        </div>
    );
}
