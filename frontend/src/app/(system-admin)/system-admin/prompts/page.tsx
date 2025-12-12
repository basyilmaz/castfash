"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/AppButton";
import { getPromptTemplates, getPromptPresets, updatePromptTemplate } from "@/lib/api/admin";

interface PromptTemplate {
    id: number;
    name: string;
    type: string;
    category: string | null;
    content: string;
    variables: any;
    isActive: boolean;
    priority: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface PromptPreset {
    id: number;
    name: string;
    description: string | null;
    scenePrompt: string | null;
    posePrompt: string | null;
    lightingPrompt: string | null;
    stylePrompt: string | null;
    negativePrompt: string | null;
    isActive: boolean;
    tags: string[];
    usageCount: number;
}

const PROMPT_TYPES = [
    { value: 'MASTER', label: 'Master Prompt', color: 'bg-purple-500' },
    { value: 'SCENE', label: 'Sahne', color: 'bg-blue-500' },
    { value: 'POSE', label: 'Poz', color: 'bg-green-500' },
    { value: 'LIGHTING', label: 'Işıklandırma', color: 'bg-yellow-500' },
    { value: 'STYLE', label: 'Stil', color: 'bg-pink-500' },
    { value: 'NEGATIVE', label: 'Negatif', color: 'bg-red-500' },
];

const CATEGORIES = [
    { value: 'PRODUCT', label: 'Ürün' },
    { value: 'MODEL', label: 'Model' },
    { value: 'GENERAL', label: 'Genel' },
    { value: 'BACKGROUND', label: 'Arka Plan' },
    { value: 'QUALITY', label: 'Kalite' },
];

export default function PromptsPage() {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [presets, setPresets] = useState<PromptPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'presets'>('templates');
    const [filterType, setFilterType] = useState<string>('all');
    const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);

            // Load templates using API helper
            const templatesData = await getPromptTemplates() as any;
            setTemplates(templatesData.templates || []);

            // Load presets using API helper
            const presetsData = await getPromptPresets() as any;
            setPresets(presetsData.presets || []);
        } catch (err) {
            console.error(err);
            toast.error("Veriler yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function toggleTemplateStatus(template: PromptTemplate) {
        try {
            await updatePromptTemplate(template.id, { isActive: !template.isActive });
            toast.success(template.isActive ? 'Devre dışı bırakıldı' : 'Aktifleştirildi');
            loadData();
        } catch (err) {
            toast.error("İşlem başarısız");
        }
    }

    async function saveTemplate(template: PromptTemplate) {
        try {
            await updatePromptTemplate(template.id, {
                name: template.name,
                content: template.content,
                priority: template.priority,
                isActive: template.isActive
            });
            toast.success('Kaydedildi!');
            setEditingTemplate(null);
            loadData();
        } catch (err) {
            toast.error("Kaydetme başarısız");
        }
    }

    const filteredTemplates = filterType === 'all'
        ? templates
        : templates.filter(t => t.type === filterType);

    const getTypeColor = (type: string) => {
        return PROMPT_TYPES.find(t => t.value === type)?.color || 'bg-gray-500';
    };

    const getTypeLabel = (type: string) => {
        return PROMPT_TYPES.find(t => t.value === type)?.label || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">🎨 Master Prompt Ayarları</h1>
                    <p className="text-textMuted mt-1">AI görüntü üretimi için kullanılan prompt şablonlarını yönetin</p>
                </div>
                <AppButton onClick={() => toast.info("Yeni prompt ekleme yakında...")}>
                    + Yeni Prompt Ekle
                </AppButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="text-3xl font-bold text-primary">{templates.length}</div>
                    <div className="text-sm text-textMuted">Toplam Prompt</div>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-400">{templates.filter(t => t.isActive).length}</div>
                    <div className="text-sm text-textMuted">Aktif Prompt</div>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-400">{presets.length}</div>
                    <div className="text-sm text-textMuted">Preset</div>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400">{templates.filter(t => t.type === 'MASTER').length}</div>
                    <div className="text-sm text-textMuted">Master Prompt</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'templates'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-textMuted hover:bg-surface/80'
                        }`}
                >
                    📝 Prompt Şablonları ({templates.length})
                </button>
                <button
                    onClick={() => setActiveTab('presets')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'presets'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-textMuted hover:bg-surface/80'
                        }`}
                >
                    🎯 Hazır Presetler ({presets.length})
                </button>
            </div>

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="space-y-4">
                    {/* Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filterType === 'all' ? 'bg-primary text-white' : 'bg-surface text-textMuted hover:bg-surface/80'
                                }`}
                        >
                            Tümü
                        </button>
                        {PROMPT_TYPES.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filterType === type.value
                                    ? `${type.color} text-white`
                                    : 'bg-surface text-textMuted hover:bg-surface/80'
                                    }`}
                            >
                                {type.label} ({templates.filter(t => t.type === type.value).length})
                            </button>
                        ))}
                    </div>

                    {/* Templates List */}
                    <div className="space-y-3">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className={`bg-surface border rounded-xl p-4 transition-all ${template.isActive ? 'border-border' : 'border-border/50 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${getTypeColor(template.type)}`}>
                                                {getTypeLabel(template.type)}
                                            </span>
                                            {template.category && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-gray-600 text-gray-200">
                                                    {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                                                </span>
                                            )}
                                            <span className="text-xs text-textMuted">
                                                Öncelik: {template.priority}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg">{template.name}</h3>

                                        {editingTemplate?.id === template.id ? (
                                            <div className="mt-3 space-y-3">
                                                <textarea
                                                    value={editingTemplate.content}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                                                    className="w-full h-32 bg-black/30 border border-border rounded-lg p-3 font-mono text-sm text-textSecondary outline-none focus:border-primary"
                                                />
                                                <div className="flex gap-2">
                                                    <AppButton size="sm" onClick={() => saveTemplate(editingTemplate)}>
                                                        💾 Kaydet
                                                    </AppButton>
                                                    <AppButton size="sm" variant="secondary" onClick={() => setEditingTemplate(null)}>
                                                        İptal
                                                    </AppButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-textMuted mt-2 font-mono bg-black/20 p-2 rounded">
                                                {template.content.length > 200
                                                    ? template.content.substring(0, 200) + '...'
                                                    : template.content}
                                            </p>
                                        )}

                                        {template.tags.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {template.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <AppButton
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setEditingTemplate(template)}
                                        >
                                            ✏️ Düzenle
                                        </AppButton>
                                        <button
                                            onClick={() => toggleTemplateStatus(template)}
                                            className={`px-3 py-1.5 rounded text-xs transition-colors ${template.isActive
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                }`}
                                        >
                                            {template.isActive ? '🔴 Devre Dışı' : '🟢 Aktifleştir'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-16 bg-surface rounded-xl border border-border">
                            <div className="text-6xl mb-4">📝</div>
                            <div className="text-xl font-semibold mb-2">Prompt bulunamadı</div>
                            <div className="text-textMuted">Bu kategoride henüz prompt yok.</div>
                        </div>
                    )}
                </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presets.map(preset => (
                        <div key={preset.id} className="bg-surface border border-border rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">{preset.name}</h3>
                                    {preset.description && (
                                        <p className="text-sm text-textMuted mt-1">{preset.description}</p>
                                    )}
                                </div>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                    {preset.usageCount} kullanım
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                {preset.scenePrompt && (
                                    <div>
                                        <span className="text-blue-400">🎬 Sahne:</span>
                                        <span className="text-textMuted ml-2">{preset.scenePrompt.substring(0, 50)}...</span>
                                    </div>
                                )}
                                {preset.posePrompt && (
                                    <div>
                                        <span className="text-green-400">🧍 Poz:</span>
                                        <span className="text-textMuted ml-2">{preset.posePrompt.substring(0, 50)}...</span>
                                    </div>
                                )}
                                {preset.lightingPrompt && (
                                    <div>
                                        <span className="text-yellow-400">💡 Işık:</span>
                                        <span className="text-textMuted ml-2">{preset.lightingPrompt.substring(0, 50)}...</span>
                                    </div>
                                )}
                                {preset.stylePrompt && (
                                    <div>
                                        <span className="text-pink-400">✨ Stil:</span>
                                        <span className="text-textMuted ml-2">{preset.stylePrompt.substring(0, 50)}...</span>
                                    </div>
                                )}
                            </div>

                            {preset.tags.length > 0 && (
                                <div className="flex gap-1 mt-3 flex-wrap">
                                    {preset.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {presets.length === 0 && (
                        <div className="col-span-2 text-center py-16 bg-surface rounded-xl border border-border">
                            <div className="text-6xl mb-4">🎯</div>
                            <div className="text-xl font-semibold mb-2">Preset bulunamadı</div>
                            <div className="text-textMuted">Henüz hazır preset eklenmemiş.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
