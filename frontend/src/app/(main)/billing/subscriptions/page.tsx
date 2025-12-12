"use client";

import React, { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    features: string[];
    limits: {
        creditsPerMonth: number;
        teamMembers: number;
        storage: string;
        support: string;
    };
    popular?: boolean;
    enterprise?: boolean;
}

// =============================================================================
// Plans Data
// =============================================================================

const plans: SubscriptionPlan[] = [
    {
        id: "free",
        name: "Ücretsiz",
        description: "Başlangıç için ideal",
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: "TRY",
        features: [
            "Aylık 10 görsel üretimi",
            "Temel modeller",
            "Standart çözünürlük",
            "Email destek",
        ],
        limits: {
            creditsPerMonth: 10,
            teamMembers: 1,
            storage: "1 GB",
            support: "Email",
        },
    },
    {
        id: "starter",
        name: "Başlangıç",
        description: "Bireysel kullanıcılar için",
        monthlyPrice: 299,
        yearlyPrice: 2499,
        currency: "TRY",
        features: [
            "Aylık 100 görsel üretimi",
            "Tüm modeller",
            "Yüksek çözünürlük",
            "Öncelikli destek",
            "API erişimi",
        ],
        limits: {
            creditsPerMonth: 100,
            teamMembers: 1,
            storage: "10 GB",
            support: "Öncelikli",
        },
    },
    {
        id: "professional",
        name: "Profesyonel",
        description: "Büyüyen işletmeler için",
        monthlyPrice: 699,
        yearlyPrice: 5999,
        currency: "TRY",
        popular: true,
        features: [
            "Aylık 500 görsel üretimi",
            "Tüm modeller + Beta",
            "4K çözünürlük",
            "7/24 destek",
            "API erişimi",
            "5 takım üyesi",
            "Özel şablonlar",
        ],
        limits: {
            creditsPerMonth: 500,
            teamMembers: 5,
            storage: "50 GB",
            support: "7/24",
        },
    },
    {
        id: "enterprise",
        name: "Kurumsal",
        description: "Büyük ekipler için özel çözümler",
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: "TRY",
        enterprise: true,
        features: [
            "Sınırsız üretim",
            "Özel model eğitimi",
            "Beyaz etiket seçeneği",
            "Özel entegrasyon",
            "Ayrılmış hesap yöneticisi",
            "SLA garantisi",
            "Yerinde kurulum",
        ],
        limits: {
            creditsPerMonth: -1, // Unlimited
            teamMembers: -1,
            storage: "Sınırsız",
            support: "Özel",
        },
    },
];

// =============================================================================
// Plan Card Component
// =============================================================================

interface PlanCardProps {
    plan: SubscriptionPlan;
    billingPeriod: "monthly" | "yearly";
    currentPlan?: string;
    onSelect: (plan: SubscriptionPlan) => void;
}

function PlanCard({ plan, billingPeriod, currentPlan, onSelect }: PlanCardProps) {
    const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    const monthlyEquivalent = billingPeriod === "yearly" && plan.yearlyPrice > 0
        ? Math.round(plan.yearlyPrice / 12)
        : plan.monthlyPrice;
    const savings = billingPeriod === "yearly" && plan.monthlyPrice > 0
        ? Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)
        : 0;
    const isCurrentPlan = currentPlan === plan.id;

    return (
        <AppCard
            className={cn(
                "relative p-6 transition-all duration-300 flex flex-col",
                plan.popular
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 ring-2 ring-primary/30"
                    : "",
                plan.enterprise
                    ? "border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20"
                    : "",
                isCurrentPlan && "ring-2 ring-green-500/50"
            )}
        >
            {/* Popular Badge */}
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black text-xs font-bold rounded-full">
                    EN POPÜLERİ ⭐
                </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    MEVCUT PLAN
                </div>
            )}

            {/* Header */}
            <div className="mb-6 pt-2">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-textMuted">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
                {plan.enterprise ? (
                    <div className="text-2xl font-bold">Özel Fiyatlandırma</div>
                ) : price === 0 ? (
                    <div className="text-3xl font-bold text-green-400">Ücretsiz</div>
                ) : (
                    <>
                        <div className="text-3xl font-bold">
                            {price.toLocaleString()}{" "}
                            <span className="text-lg text-textMuted">{plan.currency}</span>
                        </div>
                        <div className="text-sm text-textMuted">
                            {billingPeriod === "yearly" ? (
                                <>
                                    <span className="text-green-400">%{savings} tasarruf</span>
                                    {" - "}aylık {monthlyEquivalent.toLocaleString()} {plan.currency}
                                </>
                            ) : (
                                "aylık"
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-background rounded-lg">
                <div>
                    <div className="text-lg font-bold text-primary">
                        {plan.limits.creditsPerMonth === -1
                            ? "∞"
                            : plan.limits.creditsPerMonth}
                    </div>
                    <div className="text-xs text-textMuted">Aylık Kredi</div>
                </div>
                <div>
                    <div className="text-lg font-bold">
                        {plan.limits.teamMembers === -1 ? "∞" : plan.limits.teamMembers}
                    </div>
                    <div className="text-xs text-textMuted">Takım Üyesi</div>
                </div>
                <div>
                    <div className="text-lg font-bold">{plan.limits.storage}</div>
                    <div className="text-xs text-textMuted">Depolama</div>
                </div>
                <div>
                    <div className="text-lg font-bold">{plan.limits.support}</div>
                    <div className="text-xs text-textMuted">Destek</div>
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <AppButton
                onClick={() => onSelect(plan)}
                className={cn(
                    "w-full",
                    plan.popular && "bg-primary text-black hover:bg-primary/90"
                )}
                variant={isCurrentPlan ? "secondary" : plan.popular ? "primary" : "secondary"}
                disabled={isCurrentPlan}
            >
                {isCurrentPlan
                    ? "Mevcut Planınız"
                    : plan.enterprise
                        ? "İletişime Geçin"
                        : plan.monthlyPrice === 0
                            ? "Ücretsiz Başla"
                            : "Plana Geç"}
            </AppButton>
        </AppCard>
    );
}

// =============================================================================
// Comparison Table
// =============================================================================

function ComparisonTable({ billingPeriod }: { billingPeriod: "monthly" | "yearly" }) {
    const features = [
        { name: "Aylık Görsel Üretimi", key: "creditsPerMonth" },
        { name: "Takım Üyesi", key: "teamMembers" },
        { name: "Depolama", key: "storage" },
        { name: "Destek", key: "support" },
        { name: "API Erişimi", key: "api" },
        { name: "Yüksek Çözünürlük", key: "hd" },
        { name: "Özel Şablonlar", key: "templates" },
        { name: "Beyaz Etiket", key: "whitelabel" },
    ];

    const getPlanValue = (plan: SubscriptionPlan, key: string): string | boolean => {
        switch (key) {
            case "creditsPerMonth":
                return plan.limits.creditsPerMonth === -1 ? "Sınırsız" : String(plan.limits.creditsPerMonth);
            case "teamMembers":
                return plan.limits.teamMembers === -1 ? "Sınırsız" : String(plan.limits.teamMembers);
            case "storage":
                return plan.limits.storage;
            case "support":
                return plan.limits.support;
            case "api":
                return plan.id !== "free";
            case "hd":
                return plan.id !== "free";
            case "templates":
                return plan.id === "professional" || plan.id === "enterprise";
            case "whitelabel":
                return plan.id === "enterprise";
            default:
                return false;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="py-4 px-4 text-left font-medium">Özellik</th>
                        {plans.map((plan) => (
                            <th key={plan.id} className="py-4 px-4 text-center font-medium">
                                {plan.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature) => (
                        <tr key={feature.key} className="border-b border-border/50">
                            <td className="py-3 px-4 text-sm">{feature.name}</td>
                            {plans.map((plan) => {
                                const value = getPlanValue(plan, feature.key);
                                return (
                                    <td key={plan.id} className="py-3 px-4 text-center">
                                        {typeof value === "boolean" ? (
                                            value ? (
                                                <span className="text-green-400">✓</span>
                                            ) : (
                                                <span className="text-textMuted">-</span>
                                            )
                                        ) : (
                                            <span className="text-sm">{value}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export default function SubscriptionPlansPage() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
    const [showComparison, setShowComparison] = useState(false);
    const currentPlan = "free"; // Would come from user context

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        if (plan.enterprise) {
            window.location.href = "/contact?subject=enterprise";
        } else {
            window.location.href = `/billing/checkout?plan=${plan.id}&period=${billingPeriod}`;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <SectionHeader
                    title="💎 Abonelik Planları"
                    subtitle="İhtiyaçlarınıza uygun planı seçin"
                />
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 p-1 bg-surface rounded-xl">
                    <button
                        onClick={() => setBillingPeriod("monthly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            billingPeriod === "monthly"
                                ? "bg-primary text-black"
                                : "text-textMuted hover:text-white"
                        )}
                    >
                        Aylık
                    </button>
                    <button
                        onClick={() => setBillingPeriod("yearly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            billingPeriod === "yearly"
                                ? "bg-primary text-black"
                                : "text-textMuted hover:text-white"
                        )}
                    >
                        Yıllık
                        <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            %30 Tasarruf
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        billingPeriod={billingPeriod}
                        currentPlan={currentPlan}
                        onSelect={handleSelectPlan}
                    />
                ))}
            </div>

            {/* Comparison Toggle */}
            <div className="text-center">
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="text-primary hover:underline text-sm"
                >
                    {showComparison ? "Karşılaştırmayı Gizle ▲" : "Detaylı Karşılaştırma ▼"}
                </button>
            </div>

            {/* Comparison Table */}
            {showComparison && (
                <AppCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Plan Karşılaştırması</h3>
                    <ComparisonTable billingPeriod={billingPeriod} />
                </AppCard>
            )}

            {/* FAQ */}
            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">❓ Sık Sorulan Sorular</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium mb-2">Planımı değiştirebilir miyim?</h4>
                        <p className="text-sm text-textMuted">
                            Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz.
                            Değişiklikler bir sonraki fatura döneminde geçerli olur.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">İptal politikası nedir?</h4>
                        <p className="text-sm text-textMuted">
                            Herhangi bir zamanda iptal edebilirsiniz. Kalan süre için kredi iadesi yapılır.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Kullanılmayan krediler devredilir mi?</h4>
                        <p className="text-sm text-textMuted">
                            Aylık krediler devredilemez. Yıllık planlarda toplam kredi havuzunuz olur.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Fatura bilgilerimi nasıl alırım?</h4>
                        <p className="text-sm text-textMuted">
                            Faturalarınız otomatik olarak e-posta adresinize gönderilir ve
                            hesabınızdan indirilebilir.
                        </p>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}
