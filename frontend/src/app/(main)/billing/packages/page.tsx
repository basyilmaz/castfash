"use client";

import React, { useState, useEffect } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { cn } from "@/lib/utils";

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

// =============================================================================
// Mock Data
// =============================================================================

const creditPackages: CreditPackage[] = [
    {
        id: "starter",
        name: "Başlangıç",
        credits: 50,
        price: 99,
        currency: "TRY",
        description: "Küçük projeler için ideal",
        features: [
            "50 AI Görsel Üretimi",
            "Temel Destek",
            "7 Gün Geçerlilik",
        ],
    },
    {
        id: "professional",
        name: "Profesyonel",
        credits: 200,
        price: 349,
        currency: "TRY",
        discount: 12,
        popular: true,
        description: "En popüler seçim",
        features: [
            "200 AI Görsel Üretimi",
            "Öncelikli Destek",
            "30 Gün Geçerlilik",
            "Yüksek Çözünürlük",
        ],
    },
    {
        id: "business",
        name: "Kurumsal",
        credits: 500,
        price: 749,
        currency: "TRY",
        discount: 25,
        description: "Büyük ekipler için",
        features: [
            "500 AI Görsel Üretimi",
            "7/24 Destek",
            "90 Gün Geçerlilik",
            "Yüksek Çözünürlük",
            "API Erişimi",
        ],
    },
    {
        id: "enterprise",
        name: "Unlimited",
        credits: 2000,
        price: 2499,
        currency: "TRY",
        discount: 38,
        description: "Sınırsız büyüme için",
        features: [
            "2000 AI Görsel Üretimi",
            "Özel Hesap Yöneticisi",
            "1 Yıl Geçerlilik",
            "Yüksek Çözünürlük",
            "API Erişimi",
            "Özel Entegrasyon",
        ],
    },
];

// =============================================================================
// Package Card Component
// =============================================================================

interface PackageCardProps {
    pkg: CreditPackage;
    onSelect: (pkg: CreditPackage) => void;
    isSelected?: boolean;
}

function PackageCard({ pkg, onSelect, isSelected }: PackageCardProps) {
    const originalPrice = pkg.discount
        ? Math.round(pkg.price / (1 - pkg.discount / 100))
        : pkg.price;
    const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);

    return (
        <AppCard
            className={cn(
                "relative p-6 transition-all duration-300",
                pkg.popular
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 ring-2 ring-primary/30"
                    : "hover:border-border/80",
                isSelected && "ring-2 ring-primary"
            )}
        >
            {/* Popular Badge */}
            {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black text-xs font-bold rounded-full">
                    EN POPÜLERİ ⭐
                </div>
            )}

            {/* Discount Badge */}
            {pkg.discount && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    %{pkg.discount} İNDİRİM
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
                {pkg.discount && (
                    <div className="text-sm text-textMuted line-through mb-1">
                        {originalPrice.toLocaleString()} {pkg.currency}
                    </div>
                )}
                <div className="text-3xl font-bold">
                    {pkg.price.toLocaleString()} <span className="text-lg">{pkg.currency}</span>
                </div>
                <div className="text-xs text-textMuted mt-1">
                    Kredi başına {pricePerCredit} {pkg.currency}
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
                    "w-full",
                    pkg.popular
                        ? "bg-primary text-black hover:bg-primary/90"
                        : ""
                )}
                variant={pkg.popular ? "primary" : "secondary"}
            >
                Satın Al
            </AppButton>
        </AppCard>
    );
}

// =============================================================================
// Payment Modal
// =============================================================================

interface PaymentModalProps {
    pkg: CreditPackage | null;
    onClose: () => void;
    onConfirm: (pkg: CreditPackage, paymentMethod: string) => Promise<void>;
}

function PaymentModal({ pkg, onClose, onConfirm }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>("card");
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!pkg) return null;

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            await onConfirm(pkg, paymentMethod);
            setSuccess(true);
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <AppCard className="w-full max-w-md p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">Ödeme Başarılı!</h2>
                    <p className="text-textMuted mb-6">
                        {pkg.credits} kredi hesabınıza eklendi.
                    </p>
                    <AppButton onClick={onClose} className="w-full">
                        Tamam
                    </AppButton>
                </AppCard>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <AppCard className="w-full max-w-lg p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Ödeme</h2>
                    <button
                        onClick={onClose}
                        className="text-xl text-textMuted hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-background rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                        <span>{pkg.name} Paketi</span>
                        <span className="font-medium">{pkg.credits} Kredi</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Toplam</span>
                        <span className="text-primary">
                            {pkg.price.toLocaleString()} {pkg.currency}
                        </span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Ödeme Yöntemi</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: "card", label: "Kredi Kartı", icon: "💳" },
                            { id: "bank", label: "Havale/EFT", icon: "🏦" },
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={cn(
                                    "p-4 rounded-lg border-2 transition-colors text-center",
                                    paymentMethod === method.id
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-border/80"
                                )}
                            >
                                <div className="text-2xl mb-1">{method.icon}</div>
                                <div className="text-sm">{method.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Form (Placeholder) */}
                {paymentMethod === "card" && (
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <p className="text-sm text-textMuted text-center">
                                🔒 Güvenli ödeme Stripe ile gerçekleştirilecektir.
                                <br />
                                <span className="text-xs">(Demo modunda simüle edilmektedir)</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Bank Transfer Info */}
                {paymentMethod === "bank" && (
                    <div className="space-y-3 mb-6 p-4 bg-background rounded-lg">
                        <h4 className="font-medium">Havale Bilgileri</h4>
                        <div className="text-sm space-y-1">
                            <p><span className="text-textMuted">Banka:</span> Garanti BBVA</p>
                            <p><span className="text-textMuted">IBAN:</span> TR00 0000 0000 0000 0000 0000 00</p>
                            <p><span className="text-textMuted">Alıcı:</span> Castfash A.Ş.</p>
                        </div>
                        <p className="text-xs text-textMuted">
                            Açıklama kısmına kullanıcı ID&lsquo;nizi yazınız.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <AppButton
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={processing}
                    >
                        İptal
                    </AppButton>
                    <AppButton
                        onClick={handleConfirm}
                        className="flex-1"
                        disabled={processing}
                    >
                        {processing ? "İşleniyor..." : "Ödemeyi Tamamla"}
                    </AppButton>
                </div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Credit Balance Display
// =============================================================================

function CreditBalance({ balance }: { balance: number }) {
    return (
        <AppCard className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-textMuted mb-1">Mevcut Bakiyeniz</p>
                    <p className="text-4xl font-bold text-primary">
                        {balance.toLocaleString()}
                        <span className="text-lg ml-2 text-textMuted">Kredi</span>
                    </p>
                </div>
                <div className="text-5xl">💰</div>
            </div>
        </AppCard>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function CreditPackagesPage() {
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [currentBalance, setCurrentBalance] = useState(150); // Mock balance
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handlePurchase = async (pkg: CreditPackage, _paymentMethod: string) => {
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update balance
        setCurrentBalance((prev) => prev + pkg.credits);
    };

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

            {/* Current Balance */}
            <CreditBalance balance={currentBalance} />

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditPackages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onSelect={setSelectedPackage}
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
                </div>
            </AppCard>

            {/* Payment Modal */}
            <PaymentModal
                pkg={selectedPackage}
                onClose={() => setSelectedPackage(null)}
                onConfirm={handlePurchase}
            />
        </div>
    );
}
