"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { getPromptTemplates } from "@/lib/api/admin";
import { apiFetch } from "@/lib/api/http";

interface PromptTemplate {
    id: number;
    name: string;
    type: string;
    category: string | null;
    content: string;
    isActive: boolean;
    priority: number;
}

interface BuilderSelection {
    masterTemplateIds: number[];
    sceneSelection: string;
    poseSelection: string;
    lightingSelection: string;
    styleSelection: string;
    customPrompt: string;
    negativePrompt: string;
    variables: Record<string, string>;
}

const DEFAULT_VARIABLES = [
    { key: 'productType', label: 'Ürün Türü', placeholder: 'e.g., dress, jacket, shoes' },
    { key: 'color', label: 'Renk', placeholder: 'e.g., red, navy blue' },
    { key: 'material', label: 'Materyal', placeholder: 'e.g., silk, cotton, leather' },
    { key: 'style', label: 'Stil', placeholder: 'e.g., elegant, casual, sporty' },
    { key: 'season', label: 'Sezon', placeholder: 'e.g., summer, winter' },
];

export default function PromptBuilderPage() {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<{ positive: string; negative: string } | null>(null);

    const [selection, setSelection] = useState<BuilderSelection>({
        masterTemplateIds: [],
        sceneSelection: '',
        poseSelection: '',
        lightingSelection: '',
        styleSelection: '',
        customPrompt: '',
        negativePrompt: '',
        variables: {},
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            setLoading(true);
            const data = await getPromptTemplates({ isActive: true }) as any;
            setTemplates(data.templates || []);
        } catch (err) {
            console.error(err);
            toast.error("Şablonlar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    const getTemplatesByType = useCallback((type: string) => {
        return templates.filter(t => t.type === type);
    }, [templates]);

    async function generatePrompt() {
        try {
            setGenerating(true);

            const response = await apiFetch<{ positive: string; negative: string }>(
                '/system-admin/prompts/combine',
                {
                    method: 'POST',
                    body: {
                        masterTemplateIds: selection.masterTemplateIds,
                        sceneSelection: selection.sceneSelection || undefined,
                        poseSelection: selection.poseSelection || undefined,
                        lightingSelection: selection.lightingSelection || undefined,
                        styleSelection: selection.styleSelection || undefined,
                        customPrompt: selection.customPrompt || undefined,
                        negativePrompt: selection.negativePrompt || undefined,
                        variables: Object.keys(selection.variables).length > 0 ? selection.variables : undefined,
                    },
                }
            );

            setGeneratedPrompt(response);
            toast.success('Prompt başarıyla oluşturuldu!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Prompt oluşturulamadı");
        } finally {
            setGenerating(false);
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        toast.success('Panoya kopyalandı!');
    }

    function toggleMasterTemplate(id: number) {
        setSelection(prev => ({
            ...prev,
            masterTemplateIds: prev.masterTemplateIds.includes(id)
                ? prev.masterTemplateIds.filter(tid => tid !== id)
                : [...prev.masterTemplateIds, id]
        }));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const masterTemplates = getTemplatesByType('MASTER');
    const sceneTemplates = getTemplatesByType('SCENE');
    const poseTemplates = getTemplatesByType('POSE');
    const lightingTemplates = getTemplatesByType('LIGHTING');
    const styleTemplates = getTemplatesByType('STYLE');
    const negativeTemplates = getTemplatesByType('NEGATIVE');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">🔧 Master Prompt Builder</h1>
                    <p className="text-textMuted mt-1">
                        Şablonları birleştirerek özelleştirilmiş AI promptları oluşturun
                    </p>
                </div>
                <AppButton
                    onClick={generatePrompt}
                    disabled={generating || selection.masterTemplateIds.length === 0}
                >
                    {generating ? '⏳ Oluşturuluyor...' : '✨ Prompt Oluştur'}
                </AppButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Template Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Master Templates */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            Master Şablonlar (Zorunlu)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {masterTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => toggleMasterTemplate(template.id)}
                                    className={`p-3 rounded-lg border text-left text-sm transition-all ${selection.masterTemplateIds.includes(template.id)
                                            ? 'border-purple-500 bg-purple-500/20 text-white'
                                            : 'border-border bg-surface hover:border-purple-500/50'
                                        }`}
                                >
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-textMuted mt-1">
                                        Öncelik: {template.priority}
                                    </div>
                                </button>
                            ))}
                            {masterTemplates.length === 0 && (
                                <p className="text-textMuted col-span-3">Master şablon bulunamadı</p>
                            )}
                        </div>
                    </AppCard>

                    {/* Scene Selection */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            Sahne Seçimi
                        </h3>
                        <select
                            value={selection.sceneSelection}
                            onChange={(e) => setSelection(prev => ({ ...prev, sceneSelection: e.target.value }))}
                            className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary"
                        >
                            <option value="">Sahne seçin (opsiyonel)</option>
                            {sceneTemplates.map(t => (
                                <option key={t.id} value={t.content}>{t.name}</option>
                            ))}
                        </select>
                        <textarea
                            value={selection.sceneSelection}
                            onChange={(e) => setSelection(prev => ({ ...prev, sceneSelection: e.target.value }))}
                            placeholder="Veya özel sahne açıklaması yazın..."
                            rows={2}
                            className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary"
                        />
                    </AppCard>

                    {/* Pose & Lighting Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AppCard className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                Poz Seçimi
                            </h3>
                            <select
                                value={selection.poseSelection}
                                onChange={(e) => setSelection(prev => ({ ...prev, poseSelection: e.target.value }))}
                                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary"
                            >
                                <option value="">Poz seçin (opsiyonel)</option>
                                {poseTemplates.map(t => (
                                    <option key={t.id} value={t.content}>{t.name}</option>
                                ))}
                            </select>
                        </AppCard>

                        <AppCard className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                Işıklandırma
                            </h3>
                            <select
                                value={selection.lightingSelection}
                                onChange={(e) => setSelection(prev => ({ ...prev, lightingSelection: e.target.value }))}
                                className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary"
                            >
                                <option value="">Işık seçin (opsiyonel)</option>
                                {lightingTemplates.map(t => (
                                    <option key={t.id} value={t.content}>{t.name}</option>
                                ))}
                            </select>
                        </AppCard>
                    </div>

                    {/* Style Selection */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                            Stil Seçimi
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {styleTemplates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelection(prev => ({
                                        ...prev,
                                        styleSelection: prev.styleSelection === t.content ? '' : t.content
                                    }))}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${selection.styleSelection === t.content
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-surface border border-border hover:border-pink-500/50'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </AppCard>

                    {/* Custom Prompt */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3">✍️ Özel Prompt Eklemeleri</h3>
                        <textarea
                            value={selection.customPrompt}
                            onChange={(e) => setSelection(prev => ({ ...prev, customPrompt: e.target.value }))}
                            placeholder="Promptunuza eklemek istediğiniz özel detayları buraya yazın..."
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary"
                        />
                    </AppCard>

                    {/* Negative Prompt */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            Negatif Prompt
                        </h3>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    setSelection(prev => ({
                                        ...prev,
                                        negativePrompt: prev.negativePrompt
                                            ? `${prev.negativePrompt}, ${e.target.value}`
                                            : e.target.value
                                    }));
                                }
                            }}
                            className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary"
                        >
                            <option value="">Hazır negatif prompt ekle...</option>
                            {negativeTemplates.map(t => (
                                <option key={t.id} value={t.content}>{t.name}</option>
                            ))}
                        </select>
                        <textarea
                            value={selection.negativePrompt}
                            onChange={(e) => setSelection(prev => ({ ...prev, negativePrompt: e.target.value }))}
                            placeholder="Üretimde istemediğiniz öğeler..."
                            rows={2}
                            className="w-full mt-2 bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary"
                        />
                    </AppCard>
                </div>

                {/* Right Column - Variables & Preview */}
                <div className="space-y-6">
                    {/* Variables */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3">🔤 Değişkenler</h3>
                        <div className="space-y-3">
                            {DEFAULT_VARIABLES.map(variable => (
                                <div key={variable.key}>
                                    <label className="block text-xs text-textMuted mb-1">{variable.label}</label>
                                    <input
                                        type="text"
                                        value={selection.variables[variable.key] || ''}
                                        onChange={(e) => setSelection(prev => ({
                                            ...prev,
                                            variables: {
                                                ...prev.variables,
                                                [variable.key]: e.target.value
                                            }
                                        }))}
                                        placeholder={variable.placeholder}
                                        className="w-full bg-background border border-border rounded-lg p-2 text-sm outline-none focus:border-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </AppCard>

                    {/* Selection Summary */}
                    <AppCard className="p-4">
                        <h3 className="font-semibold mb-3">📋 Seçim Özeti</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-textMuted">Master şablonlar:</span>
                                <span className="font-medium">{selection.masterTemplateIds.length} seçili</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textMuted">Sahne:</span>
                                <span className="font-medium">{selection.sceneSelection ? '✓' : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textMuted">Poz:</span>
                                <span className="font-medium">{selection.poseSelection ? '✓' : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textMuted">Işık:</span>
                                <span className="font-medium">{selection.lightingSelection ? '✓' : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textMuted">Stil:</span>
                                <span className="font-medium">{selection.styleSelection ? '✓' : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textMuted">Negatif:</span>
                                <span className="font-medium">{selection.negativePrompt ? '✓' : '-'}</span>
                            </div>
                        </div>
                    </AppCard>

                    {/* Generated Prompt Preview */}
                    {generatedPrompt && (
                        <AppCard className="p-4 border-2 border-primary/30">
                            <h3 className="font-semibold mb-3">✨ Oluşturulan Prompt</h3>

                            <div className="space-y-4">
                                {/* Positive */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-green-400">POZİTİF PROMPT</span>
                                        <button
                                            onClick={() => copyToClipboard(generatedPrompt.positive)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            📋 Kopyala
                                        </button>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-3 text-sm font-mono text-textSecondary max-h-48 overflow-y-auto">
                                        {generatedPrompt.positive}
                                    </div>
                                </div>

                                {/* Negative */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-red-400">NEGATİF PROMPT</span>
                                        <button
                                            onClick={() => copyToClipboard(generatedPrompt.negative)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            📋 Kopyala
                                        </button>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-3 text-sm font-mono text-textSecondary max-h-32 overflow-y-auto">
                                        {generatedPrompt.negative || 'Negatif prompt oluşturulmadı'}
                                    </div>
                                </div>

                                {/* Copy All */}
                                <AppButton
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => copyToClipboard(`Positive: ${generatedPrompt.positive}\n\nNegative: ${generatedPrompt.negative}`)}
                                >
                                    📋 Tümünü Kopyala
                                </AppButton>
                            </div>
                        </AppCard>
                    )}
                </div>
            </div>
        </div>
    );
}
