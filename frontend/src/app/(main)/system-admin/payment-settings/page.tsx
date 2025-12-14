'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProviderSettings {
    enabled: boolean;
    testMode: boolean;
    publicKey?: string | null;
    secretKey?: string | null;
    webhookSecret?: string | null;
    merchantId?: string | null;
    merchantKey?: string | null;
    merchantSalt?: string | null;
}

interface PaymentSettings {
    stripe: ProviderSettings;
    paytr: ProviderSettings;
    routing: {
        turkeyProvider: string;
        defaultProvider: string;
        fallbackEnabled: boolean;
    };
}

export default function PaymentSettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'stripe' | 'paytr' | 'routing'>('stripe');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('castfash_access_token');
            const res = await fetch(`${API_URL}/admin/payment/settings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            } else {
                // Mock data for development
                setSettings({
                    stripe: {
                        enabled: true,
                        testMode: true,
                        publicKey: '****',
                        secretKey: '****',
                        webhookSecret: '****',
                    },
                    paytr: {
                        enabled: false,
                        testMode: true,
                        merchantId: null,
                        merchantKey: null,
                        merchantSalt: null,
                    },
                    routing: {
                        turkeyProvider: 'paytr',
                        defaultProvider: 'stripe',
                        fallbackEnabled: true,
                    },
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (provider: string) => {
        try {
            const token = localStorage.getItem('castfash_access_token');
            const res = await fetch(`${API_URL}/admin/payment/test/${provider}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success(`${provider.toUpperCase()} bağlantısı başarılı!`);
            } else {
                toast.error(`${provider.toUpperCase()} bağlantı hatası`);
            }
        } catch {
            toast.error('Bağlantı testi başarısız');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/system-admin"
                        className="text-primary hover:underline text-sm mb-2 inline-block"
                    >
                        ← Admin Panel
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Ödeme Sağlayıcı Ayarları</h1>
                    <p className="text-muted-foreground">
                        Stripe ve PayTR entegrasyonlarını yönetin
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                    <button
                        onClick={() => setActiveTab('stripe')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'stripe'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Stripe (Uluslararası)
                    </button>
                    <button
                        onClick={() => setActiveTab('paytr')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'paytr'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        PayTR (Türkiye)
                    </button>
                    <button
                        onClick={() => setActiveTab('routing')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'routing'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Yönlendirme Kuralları
                    </button>
                </div>

                {/* Stripe Settings */}
                {activeTab === 'stripe' && settings && (
                    <div className="bg-card rounded-xl p-6 border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Stripe</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Uluslararası ödemeler için
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${settings.stripe.enabled
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                {settings.stripe.enabled ? 'Aktif' : 'Pasif'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Publishable Key
                                </label>
                                <input
                                    type="text"
                                    value={settings.stripe.publicKey || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="pk_test_..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Secret Key
                                </label>
                                <input
                                    type="password"
                                    value={settings.stripe.secretKey || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="sk_test_..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Webhook Secret
                                </label>
                                <input
                                    type="password"
                                    value={settings.stripe.webhookSecret || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="whsec_..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="stripe-test-mode"
                                    checked={settings.stripe.testMode}
                                    readOnly
                                    className="w-4 h-4"
                                />
                                <label htmlFor="stripe-test-mode" className="text-sm">
                                    Test Modu
                                </label>
                            </div>

                            <div className="pt-4 border-t flex gap-3">
                                <button
                                    onClick={() => handleTestConnection('stripe')}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                                >
                                    Bağlantıyı Test Et
                                </button>
                                <a
                                    href="https://dashboard.stripe.com/test/apikeys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-primary hover:underline"
                                >
                                    Stripe Dashboard →
                                </a>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Not:</strong> Stripe ayarları environment variables ile yönetilir.
                                    <code className="ml-1 px-1 bg-muted rounded">STRIPE_SECRET_KEY</code>,
                                    <code className="ml-1 px-1 bg-muted rounded">STRIPE_PUBLISHABLE_KEY</code>,
                                    <code className="ml-1 px-1 bg-muted rounded">STRIPE_WEBHOOK_SECRET</code>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PayTR Settings */}
                {activeTab === 'paytr' && settings && (
                    <div className="bg-card rounded-xl p-6 border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-orange-500 font-bold">₺</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">PayTR</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Türkiye için yerel ödeme çözümü
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${settings.paytr.enabled
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                {settings.paytr.enabled ? 'Aktif' : 'Pasif'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Merchant ID
                                </label>
                                <input
                                    type="text"
                                    value={settings.paytr.merchantId || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="Merchant ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Merchant Key
                                </label>
                                <input
                                    type="password"
                                    value={settings.paytr.merchantKey || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="Merchant Key"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Merchant Salt
                                </label>
                                <input
                                    type="password"
                                    value={settings.paytr.merchantSalt || ''}
                                    readOnly
                                    className="w-full p-3 bg-muted rounded-lg"
                                    placeholder="Merchant Salt"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="paytr-test-mode"
                                    checked={settings.paytr.testMode}
                                    readOnly
                                    className="w-4 h-4"
                                />
                                <label htmlFor="paytr-test-mode" className="text-sm">
                                    Test Modu
                                </label>
                            </div>

                            <div className="pt-4 border-t flex gap-3">
                                <button
                                    onClick={() => handleTestConnection('paytr')}
                                    disabled={!settings.paytr.enabled}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50"
                                >
                                    Bağlantıyı Test Et
                                </button>
                                <a
                                    href="https://www.paytr.com/magaza/entegrasyon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-primary hover:underline"
                                >
                                    PayTR Panel →
                                </a>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Not:</strong> PayTR ayarları environment variables ile yönetilir.
                                    <code className="ml-1 px-1 bg-muted rounded">PAYTR_MERCHANT_ID</code>,
                                    <code className="ml-1 px-1 bg-muted rounded">PAYTR_MERCHANT_KEY</code>,
                                    <code className="ml-1 px-1 bg-muted rounded">PAYTR_MERCHANT_SALT</code>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Routing Rules */}
                {activeTab === 'routing' && settings && (
                    <div className="bg-card rounded-xl p-6 border">
                        <h2 className="text-xl font-semibold mb-6">Yönlendirme Kuralları</h2>

                        <div className="space-y-6">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h3 className="font-medium mb-3">🇹🇷 Türkiye Trafiği</h3>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={settings.routing.turkeyProvider}
                                        disabled
                                        className="p-2 bg-muted rounded-lg"
                                    >
                                        <option value="paytr">PayTR</option>
                                        <option value="stripe">Stripe</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground">
                                        Türkiye&apos;den gelen ödemeler için
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                                <h3 className="font-medium mb-3">🌍 Uluslararası Trafik</h3>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={settings.routing.defaultProvider}
                                        disabled
                                        className="p-2 bg-muted rounded-lg"
                                    >
                                        <option value="stripe">Stripe</option>
                                        <option value="paytr">PayTR</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground">
                                        Diğer ülkelerden gelen ödemeler için
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="fallback-enabled"
                                    checked={settings.routing.fallbackEnabled}
                                    readOnly
                                    className="w-4 h-4"
                                />
                                <div>
                                    <label htmlFor="fallback-enabled" className="font-medium">
                                        Yedek Sağlayıcı Aktif
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                        Birincil sağlayıcı başarısız olursa diğerine geç
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Ülke Algılama
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Sistem, kullanıcının IP adresinden ülkesini otomatik algılar ve
                                    uygun ödeme sağlayıcısına yönlendirir. Türkiye IP&apos;leri PayTR,
                                    diğerleri Stripe kullanır.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Provider Status Summary */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-4 border">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${settings?.stripe.enabled ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className="font-medium">Stripe</span>
                            <span className="text-sm text-muted-foreground ml-auto">
                                {settings?.stripe.testMode ? 'Test' : 'Canlı'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 border">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${settings?.paytr.enabled ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className="font-medium">PayTR</span>
                            <span className="text-sm text-muted-foreground ml-auto">
                                {settings?.paytr.enabled ? (settings?.paytr.testMode ? 'Test' : 'Canlı') : 'Yapılandırılmadı'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
