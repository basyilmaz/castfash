"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";

interface User {
    id: number;
    email: string;
    isSuperAdmin: boolean;
    createdAt: string;
    organizations: Array<{
        role: string;
        organization: {
            id: number;
            name: string;
        };
    }>;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterSuperAdmin, setFilterSuperAdmin] = useState<string>("all");
    const [filterHasOrg, setFilterHasOrg] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create user form
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newIsSuperAdmin, setNewIsSuperAdmin] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [search, filterSuperAdmin, filterHasOrg, sortBy, sortOrder, page]);

    async function loadUsers() {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                skip: String((page - 1) * pageSize),
                take: String(pageSize),
            });

            const data = await apiFetch<{ users: User[]; total: number }>(`/system-admin/users?${params.toString()}`);

            let filteredUsers = data.users;

            // Client-side filtering
            if (filterSuperAdmin !== "all") {
                filteredUsers = filteredUsers.filter(u =>
                    filterSuperAdmin === "yes" ? u.isSuperAdmin : !u.isSuperAdmin
                );
            }

            if (filterHasOrg !== "all") {
                filteredUsers = filteredUsers.filter(u =>
                    filterHasOrg === "yes" ? u.organizations.length > 0 : u.organizations.length === 0
                );
            }

            // Client-side sorting
            filteredUsers.sort((a, b) => {
                let aVal: any, bVal: any;

                switch (sortBy) {
                    case "email":
                        aVal = a.email.toLowerCase();
                        bVal = b.email.toLowerCase();
                        break;
                    case "orgCount":
                        aVal = a.organizations.length;
                        bVal = b.organizations.length;
                        break;
                    case "createdAt":
                    default:
                        aVal = new Date(a.createdAt).getTime();
                        bVal = new Date(b.createdAt).getTime();
                        break;
                }

                if (sortOrder === "asc") {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            setUsers(filteredUsers);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed to load users", err);
            toast.error("Kullanıcılar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateUser() {
        if (!newEmail || !newPassword) {
            toast.error("Email ve şifre gerekli!");
            return;
        }

        try {
            setCreating(true);
            await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: newEmail,
                    password: newPassword,
                }),
            });

            // If super admin, update user
            if (newIsSuperAdmin) {
                // Get the created user and update
                const usersData = await apiFetch<{ users: User[] }>(`/system-admin/users?search=${newEmail}`);
                const createdUser = usersData.users.find(u => u.email === newEmail);

                if (createdUser) {
                    await apiFetch(`/system-admin/users/${createdUser.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ isSuperAdmin: true }),
                    });
                }
            }

            toast.success("Kullanıcı oluşturuldu!");
            setShowCreateModal(false);
            setNewEmail("");
            setNewPassword("");
            setNewIsSuperAdmin(false);
            loadUsers();
        } catch (err: any) {
            console.error("Failed to create user", err);
            toast.error(err.message || "Kullanıcı oluşturulamadı!");
        } finally {
            setCreating(false);
        }
    }

    function exportUsers() {
        const csv = [
            ["ID", "Email", "Super Admin", "Organizasyon Sayısı", "Kayıt Tarihi"].join(","),
            ...users.map(u => [
                u.id,
                u.email,
                u.isSuperAdmin ? "Evet" : "Hayır",
                u.organizations.length,
                new Date(u.createdAt).toLocaleDateString("tr-TR"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kullanicilar-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Kullanıcılar dışa aktarıldı!");
    }

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
                    <p className="text-textMuted">Toplam {total} kullanıcı</p>
                </div>
                <div className="flex gap-3">
                    <AppButton variant="outline" onClick={exportUsers}>
                        📥 Dışa Aktar
                    </AppButton>
                    <AppButton onClick={() => setShowCreateModal(true)}>
                        ➕ Yeni Kullanıcı
                    </AppButton>
                </div>
            </div>

            {/* Filters & Search */}
            <AppCard className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <AppInput
                            label="Kullanıcı Ara"
                            placeholder="Email ile ara..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Super Admin
                        </label>
                        <select
                            value={filterSuperAdmin}
                            onChange={(e) => {
                                setFilterSuperAdmin(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="yes">Evet</option>
                            <option value="no">Hayır</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Organizasyon
                        </label>
                        <select
                            value={filterHasOrg}
                            onChange={(e) => {
                                setFilterHasOrg(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="yes">Var</option>
                            <option value="no">Yok</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Sırala
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm"
                            >
                                <option value="createdAt">Tarih</option>
                                <option value="email">Email</option>
                                <option value="orgCount">Org Sayısı</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="px-3 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors"
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>
            </AppCard>

            {/* User List */}
            {loading ? (
                <div className="text-textMuted text-center py-8">Yükleniyor...</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <AppCard
                                key={user.id}
                                className="p-6 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => router.push(`/system-admin/users/${user.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{user.email}</h3>
                                            {user.isSuperAdmin && (
                                                <AppBadge variant="danger">Super Admin</AppBadge>
                                            )}
                                        </div>
                                        <div className="text-sm text-textMuted mb-3">
                                            Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-textSecondary">
                                                Organizasyonlar: {user.organizations.length}
                                            </div>
                                            {user.organizations.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {user.organizations.map((org) => (
                                                        <div
                                                            key={org.organization.id}
                                                            className="bg-surface px-3 py-1 rounded-lg text-sm border border-border"
                                                        >
                                                            {org.organization.name}
                                                            <span className="text-textMuted ml-2">({org.role})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AppCard>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Önceki
                            </AppButton>
                            <div className="text-sm text-textMuted">
                                Sayfa {page} / {totalPages}
                            </div>
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Sonraki →
                            </AppButton>
                        </div>
                    )}
                </>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={() => {
                        setShowCreateModal(false);
                        setNewEmail("");
                        setNewPassword("");
                        setNewIsSuperAdmin(false);
                    }}
                >
                    <AppCard
                        className="w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-6">
                            <h2 className="text-2xl font-bold">Yeni Kullanıcı Oluştur</h2>
                            <div className="space-y-4">
                                <AppInput
                                    label="Email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="kullanici@example.com"
                                />
                                <AppInput
                                    label="Şifre"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Güçlü bir şifre"
                                />
                                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                                    <input
                                        type="checkbox"
                                        id="newSuperAdmin"
                                        checked={newIsSuperAdmin}
                                        onChange={(e) => setNewIsSuperAdmin(e.target.checked)}
                                        className="w-5 h-5 rounded border-border bg-card text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                    />
                                    <label htmlFor="newSuperAdmin" className="text-sm font-medium cursor-pointer flex-1">
                                        Super Admin Yetkisi Ver
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-border">
                                    <AppButton
                                        onClick={handleCreateUser}
                                        loading={creating}
                                        fullWidth
                                        variant="primary"
                                    >
                                        ➕ Oluştur
                                    </AppButton>
                                    <AppButton
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewEmail("");
                                            setNewPassword("");
                                            setNewIsSuperAdmin(false);
                                        }}
                                        fullWidth
                                        disabled={creating}
                                    >
                                        ✕ İptal
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    </AppCard>
                </div>
            )}
        </div>
    );
}
