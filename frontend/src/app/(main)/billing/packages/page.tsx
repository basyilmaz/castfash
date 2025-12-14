'use client';

import React, { useState, useEffect } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/http';

// =============================================================================
// Types
// =============================================================================

interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    discount?: number;
    popular?: boolean;
    description?: string;
    features?: string[];
}

interface CheckoutResponse {
    sessionId: string;
    url: string;
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchPackages(): Promise<CreditPackage[]> {
    try {
        const response = await apiFetch<{ data: CreditPackage[] }>('/payments/packages');
        // Map backend packages to frontend format
        return (response.data || []).map((pkg: any) => ({
            ...pkg,
            // Convert cents to display currency (e.g., $49.00)
            displayPrice: (pkg.price / 100).toFixed(2),
            features: getPackageFeatures(pkg.id),
        }));
    } catch (error) {
        console.error('Failed to fetch packages:', error);
        // Return default packages if API fails
        return defaultPackages;
    }
}

async function createCheckout(packageId: string): Promise<CheckoutResponse> {
    const response = await apiFetch<{ data: CheckoutResponse }>('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
            packageId,
            successUrl: `${window.location.origin}/billing/success`,
            cancelUrl: `${window.location.origin}/billing/packages`,
        }),
    });
    return response.data;
}

async function fetchBalance(): Promise<number> {
    try {
        const response = await apiFetch<{ balance: number }>('/credits/balance');
        return response?.balance || 0;
    } catch (error) {
        console.error('Failed to fetch balance:', error);
        return 0;
    }
}

function getPackageFeatures(packageId: string): string[] {
    const features: Record<string, string[]> = {
        starter: [
            '50 AI Görsel Üretimi',
            'Temel Destek',
            '7 Gün Geçerlilik',
        ],
        professional: [
            '200 AI Görsel Üretimi',
            'Öncelikli Destek',
            '30 Gün Geçerlilik',
            'Yüksek Çözünürlük',
        ],
        studio: [
            '600 AI Görsel Üretimi',
            '7/24 Destek',
            '90 Gün Geçerlilik',
            'Yüksek Çözünürlük',
            'API Erişimi',
        ],
        enterprise: [
            '2000 AI Görsel Üretimi',
            'Özel Hesap Yöneticisi',
            '1 Yıl Geçerlilik',
            'Yüksek Çözünürlük',
            'API Erişimi',
            'Özel Entegrasyon',
        ],
    };
    return features[packageId] || [];
}

// Default packages (fallback)
const defaultPackages: CreditPackage[] = [
    {
        id: 'starter',
        name: 'Başlangıç',
        credits: 50,
        price: 2500,
        currency: 'usd',
        description: 'Küçük projeler için ideal',
    },
    {
        id: 'professional',
        name: 'Profesyonel',
        credits: 200,
        price: 4900,
        currency: 'usd',
        popular: true,
        description: 'En popüler seçim',
    },
    {
        id: 'studio',
        name: 'Stüdyo',
        credits: 600,
        price: 9900,
        currency: 'usd',
        description: 'Büyük ekipler için',
    },
    {
        id: 'enterprise',
        name: 'Kurumsal',
        credits: 2000,
        price: 24900,
        currency: 'usd',
        description: 'Sınırsız büyüme için',
    },
];

// =============================================================================
// Package Card Component
// =============================================================================

interface PackageCardProps {
    pkg: CreditPackage;
    onSelect: (pkg: CreditPackage) => void;
    isLoading?: boolean;
    loadingPackageId?: string | null;
}

function PackageCard({ pkg, onSelect, isLoading, loadingPackageId }: PackageCardProps) {
    const displayPrice = (pkg.price / 100).toFixed(0);
    const pricePerCredit = (pkg.price / 100 / pkg.credits).toFixed(2);
    const isThisLoading = loadingPackageId === pkg.id;

    return (
        <AppCard
            className={cn(
                'relative p-6 transition-all duration-300',
                pkg.popular
                    ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 ring-2 ring-primary/30'
                    : 'hover:border-border/80'
            )}
        >
            {/* Popular Badge */}
            {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black text-xs font-bold rounded-full">
                    EN POPÜLERİ ⭐
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                {pkg.description && (
                    <p className="text-sm text-textMuted">{pkg.description}</p>
                )}
            </div>

            {/* Credits */}
            <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary mb-2">
                    {pkg.credits.toLocaleString()}
                </div>
                <div className="text-sm text-textMuted">Kredi</div>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
                <div className="text-3xl font-bold">
                    ${displayPrice}
                </div>
                <div className="text-xs text-textMuted mt-1">
                    Kredi başına ${pricePerCredit}
                </div>
            </div>

            {/* Features */}
            {pkg.features && (
                <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-green-400">✓</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA Button */}
            <AppButton
                onClick={() => onSelect(pkg)}
                className={cn(
                    'w-full',
                    pkg.popular ? 'bg-primary text-black hover:bg-primary/90' : ''
                )}
                variant={pkg.popular ? 'primary' : 'secondary'}
                disabled={isLoading}
            >
                {isThisLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        İşleniyor...
                    </span>
                ) : (
                    'Satın Al'
                )}
            </AppButton>
        </AppCard>
    );
}

// =============================================================================
// Credit Balance Display
// =============================================================================

function CreditBalance({ balance, loading }: { balance: number; loading: boolean }) {
    return (
        <AppCard className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-textMuted mb-1">Mevcut Bakiyeniz</p>
                    {loading ? (
                        <div className="h-10 w-32 bg-surface/50 animate-pulse rounded" />
                    ) : (
                        <p className="text-4xl font-bold text-primary">
                            {balance.toLocaleString()}
                            <span className="text-lg ml-2 text-textMuted">Kredi</span>
                        </p>
                    )}
                </div>
                <div className="text-5xl">💰</div>
            </div>
        </AppCard>
    );
}

// =============================================================================
// Payment Status Banner
// =============================================================================

function PaymentStatusBanner({ configured }: { configured: boolean }) {
    if (configured) return null;

    return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
            <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                    <p className="font-medium text-yellow-400">Ödeme Sistemi Yapılandırılıyor</p>
                    <p className="text-sm text-textMuted">
                        Stripe entegrasyonu tamamlandığında ödeme alabileceksiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function CreditPackagesPage() {
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [paymentConfigured, setPaymentConfigured] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Load packages
            const pkgs = await fetchPackages();
            setPackages(pkgs.map(pkg => ({
                ...pkg,
                features: getPackageFeatures(pkg.id),
            })));

            // Load balance
            const balance = await fetchBalance();
            setCurrentBalance(balance);

            // Check payment status
            try {
                const statusRes = await apiFetch<{ configured: boolean }>('/payments/status');
                setPaymentConfigured(statusRes?.configured ?? false);
            } catch {
                setPaymentConfigured(false);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setBalanceLoading(false);
        }
    }

    async function handlePackageSelect(pkg: CreditPackage) {
        if (!paymentConfigured) {
            setError('Ödeme sistemi henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.');
            return;
        }

        setCheckoutLoading(pkg.id);
        setError(null);

        try {
            const checkout = await createCheckout(pkg.id);

            // Redirect to Stripe Checkout
            if (checkout.url) {
                window.location.href = checkout.url;
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
        } finally {
            setCheckoutLoading(null);
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-surface rounded-xl" />
                <div className="h-8 w-64 bg-surface rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-96 bg-surface rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <SectionHeader
                title="💳 Kredi Paketleri"
                subtitle="AI görsel üretimi için kredi satın alın"
            />

            {/* Payment Status */}
            <PaymentStatusBanner configured={paymentConfigured} />

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Current Balance */}
            <CreditBalance balance={currentBalance} loading={balanceLoading} />

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onSelect={handlePackageSelect}
                        isLoading={checkoutLoading !== null}
                        loadingPackageId={checkoutLoading}
                    />
                ))}
            </div>

            {/* FAQ Section */}
            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">❓ Sık Sorulan Sorular</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-1">Krediler ne zaman geçersiz olur?</h4>
                        <p className="text-sm text-textMuted">
                            Her paketin geçerlilik süresi farklıdır. Detaylar için paket özelliklerine bakın.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">1 kredi kaç görsel üretir?</h4>
                        <p className="text-sm text-textMuted">
                            Standart üretim için 1 kredi kullanılır. Yüksek çözünürlük 2 kredi kullanır.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">İade politikası nedir?</h4>
                        <p className="text-sm text-textMuted">
                            Kullanılmamış krediler 7 gün içinde iade edilebilir.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">Hangi ödeme yöntemlerini kabul ediyorsunuz?</h4>
                        <p className="text-sm text-textMuted">
                            Tüm büyük kredi kartları (Visa, Mastercard, Amex) ile güvenli ödeme
                            yapabilirsiniz.
                        </p>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}
