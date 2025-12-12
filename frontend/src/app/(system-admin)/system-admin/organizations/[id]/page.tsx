"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";

interface OrganizationDetail {
    id: number;
    name: string;
    remainingCredits: number;
    createdAt: string;
    owner: {
        id: number;
        email: string;
    };
    users: Array<{
        role: string;
        user: {
            id: number;
            email: string;
        };
    }>;
    products: Array<{
        id: number;
        name: string;
        createdAt: string;
    }>;
    modelProfiles: Array<{
        id: number;
        name: string;
        createdAt: string;
    }>;
    generationRequests: Array<{
        id: number;
        status: string;
        createdAt: string;
        product: {
            id: number;
            name: string;
        };
    }>;
    creditTransactions: Array<{
        id: number;
        type: string;
        amount: number;
        note: string | null;
        createdAt: string;
    }>;
    _count: {
        users: number;
        products: number;
        modelProfiles: number;
        generationRequests: number;
    };
}

export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.id as string;

    const [org, setOrg] = useState<OrganizationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingCredits, setEditingCredits] = useState(false);
    const [updatingCredits, setUpdatingCredits] = useState(false);

    // Edit form state
    const [name, setName] = useState("");
    const [credits, setCredits] = useState(0);
    const [creditNote, setCreditNote] = useState("");

    useEffect(() => {
        loadOrgDetail();
    }, [orgId]);

    async function loadOrgDetail() {
        try {
            setLoading(true);
            const data = await apiFetch<OrganizationDetail>(`/system-admin/organizations/${orgId}`);
            setOrg(data);
            setName(data.name);
            setCredits(data.remainingCredits);
        } catch (err) {
            console.error("Failed to load organization detail", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            setSaving(true);
            await apiFetch(`/system-admin/organizations/${orgId}`, {
                method: "PUT",
                body: JSON.stringify({ name }),
            });
            await loadOrgDetail();
            setEditing(false);
            toast.success("Organizasyon güncellendi!");
        } catch (err) {
            console.error("Failed to update organization", err);
            toast.error("Organizasyon güncellenemedi!");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdateCredits() {
        try {
            setUpdatingCredits(true);
            await apiFetch(`/system-admin/organizations/${orgId}/credits`, {
                method: "PUT",
                body: JSON.stringify({ credits, note: creditNote }),
            });
            await loadOrgDetail();
            setEditingCredits(false);
            setCreditNote("");
            toast.success("Kredi güncellendi!");
        } catch (err) {
            console.error("Failed to update credits", err);
            toast.error("Kredi güncellenemedi!");
        } finally {
            setUpdatingCredits(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Bu organizasyonu silmek istediğinizden emin misiniz?")) {
            return;
        }

        try {
            setDeleting(true);
            await apiFetch(`/system-admin/organizations/${orgId}/delete`, {
                method: "POST",
            });
            toast.success("Organizasyon silindi!");
            router.push("/system-admin/organizations");
        } catch (err) {
            console.error("Failed to delete organization", err);
            toast.error("Organizasyon silinemedi!");
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Yükleniyor...</div>
            </div>
        );
    }

    if (!org) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Organizasyon bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{org.name}</h1>
                    <p className="text-textMuted">
                        Oluşturulma: {new Date(org.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                </div>
                <div className="flex gap-3">
                    <AppButton
                        variant="outline"
                        onClick={() => router.push("/system-admin/organizations")}
                    >
                        ← Geri
                    </AppButton>
                    {!editing && (
                        <>
                            <AppButton onClick={() => setEditing(true)}>
                                Düzenle
                            </AppButton>
                            <AppButton
                                variant="danger"
                                onClick={handleDelete}
                                loading={deleting}
                            >
                                Sil
                            </AppButton>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Kalan Kredi</div>
                    <div className="text-3xl font-bold text-accent">
                        {org.remainingCredits}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Kullanıcılar</div>
                    <div className="text-3xl font-bold text-primary">
                        {org._count.users}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Ürünler</div>
                    <div className="text-3xl font-bold text-secondary">
                        {org._count.products}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Üretimler</div>
                    <div className="text-3xl font-bold text-primary">
                        {org._count.generationRequests}
                    </div>
                </AppCard>
            </div>

            {/* Organization Info */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Organizasyon Bilgileri</h2>
                {editing ? (
                    <div className="space-y-4">
                        <AppInput
                            label="Organizasyon Adı"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="flex gap-3 pt-4">
                            <AppButton onClick={handleSave} loading={saving}>
                                Kaydet
                            </AppButton>
                            <AppButton
                                variant="outline"
                                onClick={() => {
                                    setEditing(false);
                                    setName(org.name);
                                }}
                            >
                                İptal
                            </AppButton>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-textMuted">Organizasyon Adı</div>
                            <div className="text-lg font-medium">{org.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-textMuted">Sahip</div>
                            <div
                                className="text-lg font-medium text-primary cursor-pointer hover:underline"
                                onClick={() => router.push(`/system-admin/users/${org.owner.id}`)}
                            >
                                {org.owner.email}
                            </div>
                        </div>
                    </div>
                )}
            </AppCard>

            {/* Credits Management */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Kredi Yönetimi</h2>
                {editingCredits ? (
                    <div className="space-y-4">
                        <AppInput
                            label="Yeni Kredi Miktarı"
                            type="number"
                            value={credits.toString()}
                            onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                        />
                        <AppInput
                            label="Not (Opsiyonel)"
                            value={creditNote}
                            onChange={(e) => setCreditNote(e.target.value)}
                            placeholder="Kredi değişikliği için not..."
                        />
                        <div className="flex gap-3">
                            <AppButton onClick={handleUpdateCredits} loading={updatingCredits}>
                                Kredi Güncelle
                            </AppButton>
                            <AppButton
                                variant="outline"
                                onClick={() => {
                                    setEditingCredits(false);
                                    setCredits(org.remainingCredits);
                                    setCreditNote("");
                                }}
                            >
                                İptal
                            </AppButton>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-textMuted">Mevcut Kredi</div>
                            <div className="text-2xl font-bold text-accent">
                                {org.remainingCredits}
                            </div>
                        </div>
                        <AppButton onClick={() => setEditingCredits(true)}>
                            Kredi Düzenle
                        </AppButton>
                    </div>
                )}
            </AppCard>

            {/* Users */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Kullanıcılar ({org.users.length})
                </h2>
                {org.users.length > 0 ? (
                    <div className="space-y-2">
                        {org.users.map((userOrg) => (
                            <div
                                key={userOrg.user.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/users/${userOrg.user.id}`)}
                            >
                                <div className="font-medium">{userOrg.user.email}</div>
                                <AppBadge variant="info">{userOrg.role}</AppBadge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Kullanıcı bulunmuyor
                    </div>
                )}
            </AppCard>

            {/* Recent Products */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Son Ürünler ({org.products.length > 0 ? `${org.products.length} / ${org._count.products}` : "0"})
                </h2>
                {org.products.length > 0 ? (
                    <div className="space-y-2">
                        {org.products.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/products/${product.id}`)}
                            >
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-textMuted">
                                    {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Ürün bulunmuyor
                    </div>
                )}
            </AppCard>

            {/* Recent Generations */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Son Üretimler ({org.generationRequests.length > 0 ? `${org.generationRequests.length} / ${org._count.generationRequests}` : "0"})
                </h2>
                {org.generationRequests.length > 0 ? (
                    <div className="space-y-2">
                        {org.generationRequests.map((gen) => (
                            <div
                                key={gen.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/generations/${gen.id}`)}
                            >
                                <div>
                                    <div className="font-medium">{gen.product.name}</div>
                                    <div className="text-sm text-textMuted">
                                        {new Date(gen.createdAt).toLocaleDateString("tr-TR")}
                                    </div>
                                </div>
                                <AppBadge
                                    variant={
                                        gen.status === "COMPLETED" ? "success" :
                                            gen.status === "FAILED" ? "danger" :
                                                gen.status === "PROCESSING" ? "warning" : "info"
                                    }
                                >
                                    {gen.status}
                                </AppBadge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Üretim bulunmuyor
                    </div>
                )}
            </AppCard>

            {/* Credit Transactions */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Son Kredi İşlemleri ({org.creditTransactions.length})
                </h2>
                {org.creditTransactions.length > 0 ? (
                    <div className="space-y-2">
                        {org.creditTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AppBadge
                                            variant={
                                                tx.type === "PURCHASE" || tx.type === "ADJUST" ? "success" : "warning"
                                            }
                                        >
                                            {tx.type}
                                        </AppBadge>
                                        <span className={`font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                                        </span>
                                    </div>
                                    {tx.note && (
                                        <div className="text-sm text-textMuted">{tx.note}</div>
                                    )}
                                </div>
                                <div className="text-sm text-textMuted">
                                    {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Kredi işlemi bulunmuyor
                    </div>
                )}
            </AppCard>
        </div>
    );
}
