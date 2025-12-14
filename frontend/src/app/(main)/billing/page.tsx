'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import Link from 'next/link';

interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    description?: string;
    popular?: boolean;
}

interface Subscription {
    organizationId: number;
    organizationName: string;
    status: string;
    plan: string;
    expiresAt: string | null;
    remainingCredits: number;
    isActive: boolean;
}

interface Invoice {
    id: number;
    status: string;
    totalAmount: number;
    currency: string;
    createdAt: string;
    paidAt: string | null;
    items: Array<{
        description: string;
        quantity: number;
        totalPrice: number;
    }>;
}

export default function BillingPage() {
    const { token, organization } = useAuth();
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

    useEffect(() => {
        fetchBillingData();
    }, [token]);

    const fetchBillingData = async () => {
        if (!token) return;

        try {
            setLoading(true);

            // Fetch packages
            const packagesRes = await fetch(`${API_URL}/payment/packages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (packagesRes.ok) {
                const data = await packagesRes.json();
                setPackages(data);
            }

            // Fetch subscription
            const subRes = await fetch(`${API_URL}/payment/subscription`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (subRes.ok) {
                const data = await subRes.json();
                setSubscription(data);
            }

            // Fetch invoices
            const invoicesRes = await fetch(`${API_URL}/payment/invoices`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (invoicesRes.ok) {
                const data = await invoicesRes.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error('Failed to fetch billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        if (!token) return;

        try {
            setPurchasing(packageId);

            const res = await fetch(`${API_URL}/payment/checkout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageId,
                    successUrl: `${window.location.origin}/billing/success`,
                    cancelUrl: `${window.location.origin}/billing/cancel`,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error('Ödeme sayfası oluşturulamadı');
                }
            } else {
                const error = await res.json();
                toast.error(error.message || 'Ödeme başlatılamadı');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('Bir hata oluştu');
        } finally {
            setPurchasing(null);
        }
    };

    const formatPrice = (amount: number) => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Faturalama</h1>
                    <p className="text-muted-foreground text-lg">
                        Kredi satın alın ve hesabınızı yönetin
                    </p>
                </div>

                {/* Current Credits */}
                {subscription && (
                    <div className="bg-card rounded-xl p-6 mb-8 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Mevcut Bakiye</h2>
                                <p className="text-muted-foreground">
                                    {subscription.organizationName}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-primary">
                                    {subscription.remainingCredits}
                                </p>
                                <p className="text-muted-foreground">Kredi</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Credit Packages */}
                <h2 className="text-2xl font-bold mb-6">Kredi Paketleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`bg-card rounded-xl p-6 border-2 relative ${pkg.popular
                                    ? 'border-primary shadow-lg'
                                    : 'border-border hover:border-primary/50'
                                } transition-all`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                        Popüler
                                    </span>
                                </div>
                            )}

                            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                {pkg.description}
                            </p>

                            <div className="mb-4">
                                <span className="text-3xl font-bold">{formatPrice(pkg.price)}</span>
                            </div>

                            <div className="mb-6">
                                <span className="text-2xl font-semibold text-primary">
                                    {pkg.credits}
                                </span>
                                <span className="text-muted-foreground ml-2">Kredi</span>
                            </div>

                            <button
                                onClick={() => handlePurchase(pkg.id)}
                                disabled={purchasing !== null}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${pkg.popular
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {purchasing === pkg.id ? 'İşleniyor...' : 'Satın Al'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Invoice History */}
                <h2 className="text-2xl font-bold mb-6">Fatura Geçmişi</h2>
                {invoices.length === 0 ? (
                    <div className="bg-card rounded-xl p-8 text-center border">
                        <p className="text-muted-foreground">Henüz faturanız bulunmuyor</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Tarih</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Açıklama</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Tutar</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-muted/30">
                                        <td className="px-6 py-4 text-sm">
                                            {formatDate(invoice.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {invoice.items[0]?.description || 'Kredi Satın Alımı'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {formatPrice(invoice.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${invoice.status === 'paid'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}
                                            >
                                                {invoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/dashboard"
                        className="text-primary hover:underline"
                    >
                        ← Dashboard&apos;a Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
