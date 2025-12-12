"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";

interface Organization {
    id: number;
    name: string;
    remainingCredits: number;
    createdAt: string;
    owner: {
        id: number;
        email: string;
    };
    _count: {
        users: number;
        products: number;
        modelProfiles: number;
        generationRequests: number;
    };
}

export default function OrganizationsPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterCredits, setFilterCredits] = useState<string>("all");
    const [filterUsers, setFilterUsers] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create organization form
    const [newName, setNewName] = useState("");
    const [newOwnerEmail, setNewOwnerEmail] = useState("");
    const [newInitialCredits, setNewInitialCredits] = useState(100);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadOrganizations();
    }, [search, filterCredits, filterUsers, sortBy, sortOrder, page]);

    async function loadOrganizations() {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                skip: String((page - 1) * pageSize),
                take: String(pageSize),
            });

            const data = await apiFetch<{ organizations: Organization[]; total: number }>(
                `/system-admin/organizations?${params.toString()}`
            );

            let filteredOrgs = data.organizations;

            // Client-side filtering
            if (filterCredits !== "all") {
                filteredOrgs = filteredOrgs.filter(org => {
                    if (filterCredits === "high") return org.remainingCredits > 100;
                    if (filterCredits === "medium") return org.remainingCredits > 0 && org.remainingCredits <= 100;
                    if (filterCredits === "low") return org.remainingCredits === 0;
                    return true;
                });
            }

            if (filterUsers !== "all") {
                filteredOrgs = filteredOrgs.filter(org => {
                    if (filterUsers === "many") return org._count.users > 5;
                    if (filterUsers === "some") return org._count.users > 0 && org._count.users <= 5;
                    if (filterUsers === "none") return org._count.users === 0;
                    return true;
                });
            }

            // Client-side sorting
            filteredOrgs.sort((a, b) => {
                let aVal: any, bVal: any;

                switch (sortBy) {
                    case "name":
                        aVal = a.name.toLowerCase();
                        bVal = b.name.toLowerCase();
                        break;
                    case "credits":
                        aVal = a.remainingCredits;
                        bVal = b.remainingCredits;
                        break;
                    case "users":
                        aVal = a._count.users;
                        bVal = b._count.users;
                        break;
                    case "generations":
                        aVal = a._count.generationRequests;
                        bVal = b._count.generationRequests;
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

            setOrganizations(filteredOrgs);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed to load organizations", err);
            toast.error("Organizasyonlar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateOrganization() {
        if (!newName || !newOwnerEmail) {
            toast.error("Organizasyon adı ve sahip email gerekli!");
            return;
        }

        try {
            setCreating(true);

            // Find user by email
            const usersData = await apiFetch<{ users: any[] }>(
                `/system-admin/users?search=${newOwnerEmail}`
            );
            const owner = usersData.users.find(u => u.email === newOwnerEmail);

            if (!owner) {
                toast.error("Kullanıcı bulunamadı! Önce kullanıcı oluşturun.");
                return;
            }

            // Create organization (Note: You'll need to implement this endpoint)
            await apiFetch("/organizations", {
                method: "POST",
                body: JSON.stringify({
                    name: newName,
                    ownerId: owner.id,
                    initialCredits: newInitialCredits,
                }),
            });

            toast.success("Organizasyon oluşturuldu!");
            setShowCreateModal(false);
            setNewName("");
            setNewOwnerEmail("");
            setNewInitialCredits(100);
            loadOrganizations();
        } catch (err: any) {
            console.error("Failed to create organization", err);
            toast.error(err.message || "Organizasyon oluşturulamadı!");
        } finally {
            setCreating(false);
        }
    }

    function exportOrganizations() {
        const csv = [
            ["ID", "Ad", "Sahip", "Kalan Kredi", "Kullanıcı", "Ürün", "Model", "Üretim", "Kayıt Tarihi"].join(","),
            ...organizations.map(org => [
                org.id,
                `"${org.name}"`,
                `"${org.owner.email}"`,
                org.remainingCredits,
                org._count.users,
                org._count.products,
                org._count.modelProfiles,
                org._count.generationRequests,
                new Date(org.createdAt).toLocaleDateString("tr-TR"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `organizasyonlar-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Organizasyonlar dışa aktarıldı!");
    }

    const totalPages = Math.ceil(total / pageSize);

    const getCreditBadge = (credits: number) => {
        if (credits > 100) return <AppBadge variant="success">{credits}</AppBadge>;
        if (credits > 0) return <AppBadge variant="warning">{credits}</AppBadge>;
        return <AppBadge variant="danger">{credits}</AppBadge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Organizasyon Yönetimi</h1>
                    <p className="text-textMuted">Toplam {total} organizasyon</p>
                </div>
                <div className="flex gap-3">
                    <AppButton variant="outline" onClick={exportOrganizations}>
                        📥 Dışa Aktar
                    </AppButton>
                    <AppButton onClick={() => setShowCreateModal(true)}>
                        ➕ Yeni Organizasyon
                    </AppButton>
                </div>
            </div>

            {/* Filters & Search */}
            <AppCard className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <AppInput
                            label="Organizasyon Ara"
                            placeholder="İsim ile ara..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Kredi Durumu
                        </label>
                        <select
                            value={filterCredits}
                            onChange={(e) => {
                                setFilterCredits(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="high">Yüksek (&gt;100)</option>
                            <option value="medium">Orta (1-100)</option>
                            <option value="low">Düşük (0)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Kullanıcı Sayısı
                        </label>
                        <select
                            value={filterUsers}
                            onChange={(e) => {
                                setFilterUsers(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                        >
                            <option value="all">Tümü</option>
                            <option value="many">Çok (&gt;5)</option>
                            <option value="some">Az (1-5)</option>
                            <option value="none">Yok (0)</option>
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
                                <option value="name">İsim</option>
                                <option value="credits">Kredi</option>
                                <option value="users">Kullanıcı</option>
                                <option value="generations">Üretim</option>
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

            {/* Organization List */}
            {loading ? (
                <div className="text-textMuted text-center py-8">Yükleniyor...</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {organizations.map((org) => (
                            <AppCard
                                key={org.id}
                                className="p-6 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => router.push(`/system-admin/organizations/${org.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-2">{org.name}</h3>
                                        <div className="text-sm text-textMuted mb-3">
                                            Sahip: {org.owner.email} • Kayıt: {new Date(org.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-textMuted mb-1">Kalan Kredi</div>
                                        {getCreditBadge(org.remainingCredits)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <div className="text-xs text-textMuted">Kullanıcılar</div>
                                        <div className="text-2xl font-bold text-primary">{org._count.users}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted">Ürünler</div>
                                        <div className="text-2xl font-bold text-secondary">{org._count.products}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted">Modeller</div>
                                        <div className="text-2xl font-bold text-accent">{org._count.modelProfiles}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-textMuted">Üretimler</div>
                                        <div className="text-2xl font-bold text-green-400">{org._count.generationRequests}</div>
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

            {/* Create Organization Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={() => {
                        setShowCreateModal(false);
                        setNewName("");
                        setNewOwnerEmail("");
                        setNewInitialCredits(100);
                    }}
                >
                    <AppCard
                        className="w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-6">
                            <h2 className="text-2xl font-bold">Yeni Organizasyon Oluştur</h2>
                            <div className="space-y-4">
                                <AppInput
                                    label="Organizasyon Adı"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Şirket Adı"
                                />
                                <AppInput
                                    label="Sahip Email"
                                    type="email"
                                    value={newOwnerEmail}
                                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                                    placeholder="sahip@example.com"
                                />
                                <AppInput
                                    label="Başlangıç Kredisi"
                                    type="number"
                                    value={newInitialCredits}
                                    onChange={(e) => setNewInitialCredits(parseInt(e.target.value) || 0)}
                                    placeholder="100"
                                />
                                <div className="flex gap-3 pt-2 border-t border-border">
                                    <AppButton
                                        onClick={handleCreateOrganization}
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
                                            setNewName("");
                                            setNewOwnerEmail("");
                                            setNewInitialCredits(100);
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
