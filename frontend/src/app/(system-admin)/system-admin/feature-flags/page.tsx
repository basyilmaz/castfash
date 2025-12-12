"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    enabled: boolean;
    type: "boolean" | "percentage" | "user_list";
    value: boolean | number | string[];
    environment: "all" | "production" | "staging" | "development";
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const mockFlags: FeatureFlag[] = [
    {
        id: "1",
        key: "new_generation_ui",
        name: "Yeni Üretim Arayüzü",
        description: "Beta test için yeni görsel üretim arayüzü",
        enabled: true,
        type: "percentage",
        value: 25,
        environment: "production",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: "admin@castfash.com",
    },
    {
        id: "2",
        key: "ai_model_v2",
        name: "AI Model V2",
        description: "Geliştirilmiş AI model kullanımı",
        enabled: false,
        type: "boolean",
        value: false,
        environment: "staging",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: "dev@castfash.com",
    },
    {
        id: "3",
        key: "dark_mode_v2",
        name: "Gelişmiş Karanlık Mod",
        description: "OLED optimizasyonlu karanlık tema",
        enabled: true,
        type: "boolean",
        value: true,
        environment: "all",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: "admin@castfash.com",
    },
    {
        id: "4",
        key: "beta_testers",
        name: "Beta Test Kullanıcıları",
        description: "Beta özelliklerine erişimi olan kullanıcılar",
        enabled: true,
        type: "user_list",
        value: ["user1@test.com", "user2@test.com", "user3@test.com"],
        environment: "production",
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: "admin@castfash.com",
    },
    {
        id: "5",
        key: "maintenance_mode",
        name: "Bakım Modu",
        description: "Tüm sistem için bakım modu",
        enabled: false,
        type: "boolean",
        value: false,
        environment: "all",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: "admin@castfash.com",
    },
];

// =============================================================================
// Flag Toggle Component
// =============================================================================

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                "relative w-12 h-6 rounded-full transition-colors",
                checked ? "bg-green-500" : "bg-gray-600",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
        >
            <span
                className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    checked ? "translate-x-7" : "translate-x-1"
                )}
            />
        </button>
    );
}

// =============================================================================
// Flag Card Component
// =============================================================================

interface FlagCardProps {
    flag: FeatureFlag;
    onToggle: (id: string, enabled: boolean) => void;
    onEdit: (flag: FeatureFlag) => void;
    onDelete: (id: string) => void;
}

function FlagCard({ flag, onToggle, onEdit, onDelete }: FlagCardProps) {
    const getTypeLabel = () => {
        switch (flag.type) {
            case "boolean": return "Boolean";
            case "percentage": return `Yayılma (${flag.value}%)`;
            case "user_list": return `Kullanıcı Listesi (${(flag.value as string[]).length})`;
        }
    };

    const getEnvBadge = () => {
        const envColors = {
            all: "bg-blue-500/20 text-blue-400",
            production: "bg-red-500/20 text-red-400",
            staging: "bg-yellow-500/20 text-yellow-400",
            development: "bg-green-500/20 text-green-400",
        };
        const envLabels = {
            all: "Tümü",
            production: "Prod",
            staging: "Stage",
            development: "Dev",
        };

        return (
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", envColors[flag.environment])}>
                {envLabels[flag.environment]}
            </span>
        );
    };

    return (
        <AppCard className={cn(
            "p-4 transition-all",
            flag.enabled ? "border-green-500/30" : "border-border"
        )}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{flag.name}</h4>
                        {getEnvBadge()}
                    </div>
                    <p className="text-xs text-textMuted mb-2 line-clamp-2">
                        {flag.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-textMuted">
                        <code className="px-1.5 py-0.5 bg-surface rounded font-mono">
                            {flag.key}
                        </code>
                        <span>{getTypeLabel()}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <ToggleSwitch
                        checked={flag.enabled}
                        onChange={(enabled) => onToggle(flag.id, enabled)}
                    />
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(flag)}
                            className="p-1 text-textMuted hover:text-white text-sm"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onDelete(flag.id)}
                            className="p-1 text-red-400 hover:text-red-300 text-sm"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </AppCard>
    );
}

// =============================================================================
// Create/Edit Modal
// =============================================================================

interface FlagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (flag: Partial<FeatureFlag>) => void;
    editingFlag?: FeatureFlag;
}

function FlagModal({ isOpen, onClose, onSave, editingFlag }: FlagModalProps) {
    const [form, setForm] = useState({
        key: "",
        name: "",
        description: "",
        type: "boolean" as FeatureFlag["type"],
        environment: "all" as FeatureFlag["environment"],
        value: true as FeatureFlag["value"],
    });

    React.useEffect(() => {
        if (editingFlag) {
            setForm({
                key: editingFlag.key,
                name: editingFlag.name,
                description: editingFlag.description,
                type: editingFlag.type,
                environment: editingFlag.environment,
                value: editingFlag.value,
            });
        } else {
            setForm({
                key: "",
                name: "",
                description: "",
                type: "boolean",
                environment: "all",
                value: true,
            });
        }
    }, [editingFlag, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...form,
            id: editingFlag?.id,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <AppCard className="w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {editingFlag ? "Özellik Bayrağı Düzenle" : "Yeni Özellik Bayrağı"}
                </h3>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Anahtar *</label>
                        <AppInput
                            value={form.key}
                            onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                            placeholder="ornek_bayrak"
                            disabled={!!editingFlag}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Ad *</label>
                        <AppInput
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Örnek Özellik"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Açıklama</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Bu bayrak ne işe yarar..."
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tip</label>
                            <AppSelect
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value as FeatureFlag["type"] })}
                            >
                                <option value="boolean">Boolean (Açık/Kapalı)</option>
                                <option value="percentage">Yüzdelik Yayılma</option>
                                <option value="user_list">Kullanıcı Listesi</option>
                            </AppSelect>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Ortam</label>
                            <AppSelect
                                value={form.environment}
                                onChange={(e) => setForm({ ...form, environment: e.target.value as FeatureFlag["environment"] })}
                            >
                                <option value="all">Tümü</option>
                                <option value="production">Production</option>
                                <option value="staging">Staging</option>
                                <option value="development">Development</option>
                            </AppSelect>
                        </div>
                    </div>
                    {form.type === "percentage" && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Yayılma Oranı: {form.value as number}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={form.value as number}
                                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <AppButton variant="secondary" onClick={onClose}>
                        İptal
                    </AppButton>
                    <AppButton onClick={handleSave} disabled={!form.key || !form.name}>
                        {editingFlag ? "Güncelle" : "Oluştur"}
                    </AppButton>
                </div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
    const [showModal, setShowModal] = useState(false);
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | undefined>();
    const [searchQuery, setSearchQuery] = useState("");
    const [envFilter, setEnvFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Filter flags
    const filteredFlags = useMemo(() => {
        return flags.filter((flag) => {
            const matchesSearch =
                flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                flag.key.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEnv = envFilter === "all" || flag.environment === envFilter;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "enabled" && flag.enabled) ||
                (statusFilter === "disabled" && !flag.enabled);
            return matchesSearch && matchesEnv && matchesStatus;
        });
    }, [flags, searchQuery, envFilter, statusFilter]);

    // Toggle flag
    const handleToggle = useCallback((id: string, enabled: boolean) => {
        setFlags((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, enabled, updatedAt: new Date() } : f
            )
        );
    }, []);

    // Save flag
    const handleSave = useCallback((data: Partial<FeatureFlag>) => {
        if (data.id) {
            // Update
            setFlags((prev) =>
                prev.map((f) =>
                    f.id === data.id
                        ? { ...f, ...data, updatedAt: new Date() }
                        : f
                )
            );
        } else {
            // Create
            const newFlag: FeatureFlag = {
                id: `flag_${Date.now()}`,
                key: data.key || "",
                name: data.name || "",
                description: data.description || "",
                enabled: true,
                type: data.type || "boolean",
                value: data.value ?? true,
                environment: data.environment || "all",
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: "current@user.com",
            };
            setFlags((prev) => [newFlag, ...prev]);
        }
        setEditingFlag(undefined);
    }, []);

    // Delete flag
    const handleDelete = useCallback((id: string) => {
        if (confirm("Bu bayrağı silmek istediğinizden emin misiniz?")) {
            setFlags((prev) => prev.filter((f) => f.id !== id));
        }
    }, []);

    // Stats
    const stats = useMemo(() => ({
        total: flags.length,
        enabled: flags.filter((f) => f.enabled).length,
        disabled: flags.filter((f) => !f.enabled).length,
    }), [flags]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <SectionHeader
                    title="🚩 Özellik Bayrakları"
                    subtitle="Uygulamadaki özellikleri kontrol edin"
                />
                <AppButton onClick={() => { setEditingFlag(undefined); setShowModal(true); }}>
                    + Yeni Bayrak
                </AppButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <AppCard className="p-4 text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-textMuted">Toplam</div>
                </AppCard>
                <AppCard className="p-4 text-center border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{stats.enabled}</div>
                    <div className="text-xs text-textMuted">Aktif</div>
                </AppCard>
                <AppCard className="p-4 text-center border-gray-500/30">
                    <div className="text-2xl font-bold text-gray-400">{stats.disabled}</div>
                    <div className="text-xs text-textMuted">Pasif</div>
                </AppCard>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <AppInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ara..."
                    className="flex-1 min-w-[200px]"
                />
                <AppSelect
                    value={envFilter}
                    onChange={(e) => setEnvFilter(e.target.value)}
                    className="w-40"
                >
                    <option value="all">Tüm Ortamlar</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                </AppSelect>
                <AppSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-40"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="enabled">Aktif</option>
                    <option value="disabled">Pasif</option>
                </AppSelect>
            </div>

            {/* Flags List */}
            <div className="grid gap-4">
                {filteredFlags.length === 0 ? (
                    <AppCard className="p-8 text-center">
                        <div className="text-4xl mb-4">🏳️</div>
                        <p className="text-textMuted">Gösterilecek bayrak bulunamadı</p>
                    </AppCard>
                ) : (
                    filteredFlags.map((flag) => (
                        <FlagCard
                            key={flag.id}
                            flag={flag}
                            onToggle={handleToggle}
                            onEdit={(f) => { setEditingFlag(f); setShowModal(true); }}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Modal */}
            <FlagModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingFlag(undefined); }}
                onSave={handleSave}
                editingFlag={editingFlag}
            />
        </div>
    );
}
