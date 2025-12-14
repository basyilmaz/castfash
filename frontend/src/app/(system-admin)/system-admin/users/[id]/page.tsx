"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";

interface UserDetail {
    id: number;
    email: string;
    isSuperAdmin: boolean;
    isActive?: boolean;
    isVerified?: boolean;
    createdAt: string;
    organizations: Array<{
        role: string;
        organization: {
            id: number;
            name: string;
            remainingCredits: number;
            _count: {
                products: number;
                modelProfiles: number;
                generationRequests: number;
            };
        };
    }>;
    stats: {
        totalGenerations: number;
        totalCreditsSpent: number;
    };
}

interface AuditLog {
    id: number;
    action: string;
    targetType: string | null;
    targetId: number | null;
    createdAt: string;
}

interface Generation {
    id: number;
    status: string;
    creditsConsumed: number;
    createdAt: string;
    product: {
        id: number;
        name: string;
    };
}

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<UserDetail | null>(null);
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
    const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [suspending, setSuspending] = useState(false);

    // Edit form state
    const [email, setEmail] = useState("");
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Password reset
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [resettingPassword, setResettingPassword] = useState(false);

    useEffect(() => {
        loadUserDetail();
        loadRecentActivity();
        loadRecentGenerations();
    }, [userId]);

    async function loadUserDetail() {
        try {
            setLoading(true);
            const data = await apiFetch<UserDetail>(`/system-admin/users/${userId}`);
            setUser(data);
            setEmail(data.email);
            setIsSuperAdmin(data.isSuperAdmin);
        } catch (err) {
            console.error("Failed to load user detail", err);
            toast.error("Kullanıcı bilgileri yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function loadRecentActivity() {
        try {
            const data = await apiFetch<{ logs: AuditLog[] }>(
                `/system-admin/audit-logs?userId=${userId}&take=10`
            );
            setRecentActivity(data.logs);
        } catch (err) {
            console.error("Failed to load activity", err);
        }
    }

    async function loadRecentGenerations() {
        try {
            // Get all generations and filter by user's organizations
            const data = await apiFetch<Generation[]>(`/system-admin/generations?take=50`);
            setRecentGenerations(data.slice(0, 10));
        } catch (err) {
            console.error("Failed to load generations", err);
        }
    }

    async function handleSave() {
        try {
            setSaving(true);
            await apiFetch(`/system-admin/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify({ email, isSuperAdmin }),
            });
            await loadUserDetail();
            setEditing(false);
            toast.success("Kullanıcı güncellendi!");
        } catch (err) {
            console.error("Failed to update user", err);
            toast.error("Kullanıcı güncellenemedi!");
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordReset() {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Şifre en az 6 karakter olmalı!");
            return;
        }

        try {
            setResettingPassword(true);
            // Note: You'll need to implement this endpoint in backend
            await apiFetch(`/system-admin/users/${userId}/reset-password`, {
                method: "POST",
                body: JSON.stringify({ newPassword }),
            });
            toast.success("Şifre sıfırlandı!");
            setShowPasswordReset(false);
            setNewPassword("");
        } catch (err) {
            console.error("Failed to reset password", err);
            toast.error("Şifre sıfırlanamadı!");
        } finally {
            setResettingPassword(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
            return;
        }

        try {
            setDeleting(true);
            await apiFetch(`/system-admin/users/${userId}/delete`, {
                method: "POST",
            });
            toast.success("Kullanıcı silindi!");
            router.push("/system-admin/users");
        } catch (err) {
            console.error("Failed to delete user", err);
            toast.error("Kullanıcı silinemedi!");
        } finally {
            setDeleting(false);
        }
    }

    async function handleToggleSuspend() {
        const action = user?.isActive !== false ? "askıya almak" : "aktifleştirmek";
        if (!confirm(`Bu kullanıcıyı ${action} istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            setSuspending(true);
            const newStatus = user?.isActive === false;
            await apiFetch(`/system-admin/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify({ isActive: newStatus }),
            });
            toast.success(newStatus ? "Kullanıcı aktifleştirildi!" : "Kullanıcı askıya alındı!");
            await loadUserDetail();
        } catch (err) {
            console.error("Failed to toggle suspend", err);
            toast.error("İşlem başarısız!");
        } finally {
            setSuspending(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Yükleniyor...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-textMuted">Kullanıcı bulunamadı</div>
            </div>
        );
    }

    const getActionBadge = (action: string) => {
        if (action.includes("DELETED")) return <AppBadge variant="danger">{action}</AppBadge>;
        if (action.includes("CREATED")) return <AppBadge variant="success">{action}</AppBadge>;
        if (action.includes("UPDATED")) return <AppBadge variant="warning">{action}</AppBadge>;
        return <AppBadge variant="info">{action}</AppBadge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">Kullanıcı Detayı</h1>
                        {user.isSuperAdmin && (
                            <AppBadge variant="danger">Super Admin</AppBadge>
                        )}
                    </div>
                    <p className="text-textMuted">
                        Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                </div>
                <div className="flex gap-3">
                    <AppButton
                        variant="outline"
                        onClick={() => router.push("/system-admin/users")}
                    >
                        ← Geri
                    </AppButton>
                    {!editing && (
                        <>
                            <AppButton onClick={() => setEditing(true)}>
                                Düzenle
                            </AppButton>
                            <AppButton
                                variant="outline"
                                onClick={() => setShowPasswordReset(true)}
                            >
                                🔑 Şifre Sıfırla
                            </AppButton>
                            <AppButton
                                variant="outline"
                                onClick={handleToggleSuspend}
                                loading={suspending}
                                className={user.isActive !== false ? "border-yellow-500 text-yellow-500" : "border-green-500 text-green-500"}
                            >
                                {user.isActive !== false ? "⏸️ Askıya Al" : "▶️ Aktifleştir"}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Toplam Üretim</div>
                    <div className="text-3xl font-bold text-primary">
                        {user.stats.totalGenerations}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Harcanan Kredi</div>
                    <div className="text-3xl font-bold text-accent">
                        {user.stats.totalCreditsSpent}
                    </div>
                </AppCard>
                <AppCard className="p-6">
                    <div className="text-sm text-textMuted mb-1">Organizasyon Sayısı</div>
                    <div className="text-3xl font-bold text-secondary">
                        {user.organizations.length}
                    </div>
                </AppCard>
            </div>

            {/* User Info */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
                {editing ? (
                    <div className="space-y-4">
                        <AppInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="superAdmin"
                                checked={isSuperAdmin}
                                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="superAdmin" className="text-sm font-medium">
                                Super Admin Yetkisi
                            </label>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <AppButton onClick={handleSave} loading={saving}>
                                Kaydet
                            </AppButton>
                            <AppButton
                                variant="outline"
                                onClick={() => {
                                    setEditing(false);
                                    setEmail(user.email);
                                    setIsSuperAdmin(user.isSuperAdmin);
                                }}
                            >
                                İptal
                            </AppButton>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-textMuted">Email</div>
                            <div className="text-lg font-medium">{user.email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-textMuted">Yetki</div>
                            <div className="text-lg font-medium">
                                {user.isSuperAdmin ? "Super Admin" : "Normal Kullanıcı"}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-textMuted">Durum</div>
                            <AppBadge variant="success">Aktif</AppBadge>
                        </div>
                    </div>
                )}
            </AppCard>

            {/* Organizations */}
            <AppCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Organizasyonlar ({user.organizations.length})
                </h2>
                {user.organizations.length > 0 ? (
                    <div className="space-y-4">
                        {user.organizations.map((org) => (
                            <div
                                key={org.organization.id}
                                className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                                onClick={() => router.push(`/system-admin/organizations/${org.organization.id}`)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">
                                            {org.organization.name}
                                        </h3>
                                        <AppBadge variant="info">{org.role}</AppBadge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-textMuted">Kalan Kredi</div>
                                        <div className="text-xl font-bold text-accent">
                                            {org.organization.remainingCredits}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                                    <div>
                                        <div className="text-xs text-textMuted">Ürünler</div>
                                        <div className="text-lg font-semibold">
                                            {org.organization._count.products}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted">Modeller</div>
                                        <div className="text-lg font-semibold">
                                            {org.organization._count.modelProfiles}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted">Üretimler</div>
                                        <div className="text-lg font-semibold">
                                            {org.organization._count.generationRequests}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-textMuted">
                        Bu kullanıcının organizasyonu bulunmuyor
                    </div>
                )}
            </AppCard>

            {/* Recent Activity & Generations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                                >
                                    <div className="flex items-center gap-3">
                                        {getActionBadge(log.action)}
                                        <div className="text-xs text-textMuted">
                                            {new Date(log.createdAt).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-textMuted">
                            Henüz aktivite kaydı yok
                        </div>
                    )}
                </AppCard>

                {/* Recent Generations */}
                <AppCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Son Üretimler</h2>
                    {recentGenerations.length > 0 ? (
                        <div className="space-y-3">
                            {recentGenerations.slice(0, 5).map((gen) => (
                                <div
                                    key={gen.id}
                                    className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => router.push(`/system-admin/generations/${gen.id}`)}
                                >
                                    <div>
                                        <div className="font-medium">{gen.product.name}</div>
                                        <div className="text-xs text-textMuted">
                                            {new Date(gen.createdAt).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AppBadge
                                            variant={
                                                gen.status === "DONE" ? "success" :
                                                    gen.status === "ERROR" ? "danger" : "warning"
                                            }
                                        >
                                            {gen.status}
                                        </AppBadge>
                                        <div className="text-sm text-accent">
                                            {gen.creditsConsumed} kredi
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-textMuted">
                            Henüz üretim yok
                        </div>
                    )}
                </AppCard>
            </div>

            {/* Password Reset Modal */}
            {showPasswordReset && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <AppCard className="p-6 w-full max-w-md mx-4">
                        <h2 className="text-2xl font-bold mb-4">Şifre Sıfırla</h2>
                        <div className="space-y-4">
                            <AppInput
                                label="Yeni Şifre"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="En az 6 karakter"
                            />
                            <div className="flex gap-3">
                                <AppButton
                                    onClick={handlePasswordReset}
                                    loading={resettingPassword}
                                    fullWidth
                                >
                                    Şifreyi Sıfırla
                                </AppButton>
                                <AppButton
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordReset(false);
                                        setNewPassword("");
                                    }}
                                    fullWidth
                                >
                                    İptal
                                </AppButton>
                            </div>
                        </div>
                    </AppCard>
                </div>
            )}
        </div>
    );
}
