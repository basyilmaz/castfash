"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";

// =============================================================================
// Types
// =============================================================================

export interface GenerationSettings {
    modelId: string;
    sceneId: string;
    poseId: string;
    resolution: string;
    style: string;
    lighting: string;
    background: string;
    customPrompt?: string;
}

export interface GenerationTemplate {
    id: string;
    name: string;
    description?: string;
    settings: GenerationSettings;
    thumbnail?: string;
    isDefault?: boolean;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
}

export interface TemplateManagerProps {
    currentSettings: GenerationSettings;
    onApplyTemplate: (settings: GenerationSettings) => void;
    className?: string;
}

// =============================================================================
// Default Templates
// =============================================================================

const defaultTemplates: GenerationTemplate[] = [
    {
        id: "studio-classic",
        name: "Stüdyo Klasik",
        description: "Profesyonel stüdyo çekimi, beyaz arka plan",
        settings: {
            modelId: "model-1",
            sceneId: "studio",
            poseId: "standing",
            resolution: "1024x1024",
            style: "realistic",
            lighting: "soft",
            background: "white",
        },
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 156,
    },
    {
        id: "outdoor-natural",
        name: "Doğal Dış Mekan",
        description: "Açık hava, doğal ışık",
        settings: {
            modelId: "model-2",
            sceneId: "outdoor",
            poseId: "walking",
            resolution: "1024x1024",
            style: "natural",
            lighting: "natural",
            background: "outdoor",
        },
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 89,
    },
    {
        id: "editorial-fashion",
        name: "Editöryal Moda",
        description: "Dergi tarzı, dramatik ışık",
        settings: {
            modelId: "model-3",
            sceneId: "editorial",
            poseId: "dramatic",
            resolution: "1536x1536",
            style: "editorial",
            lighting: "dramatic",
            background: "gradient",
        },
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 67,
    },
];

// =============================================================================
// Storage Utils
// =============================================================================

const STORAGE_KEY = "generation_templates";

function loadTemplates(): GenerationTemplate[] {
    if (typeof window === "undefined") return defaultTemplates;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return [...defaultTemplates, ...parsed.map((t: GenerationTemplate) => ({
                ...t,
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
            }))];
        }
    } catch {
        // Ignore parse errors
    }
    return defaultTemplates;
}

function saveTemplates(templates: GenerationTemplate[]) {
    const userTemplates = templates.filter(t => !t.isDefault);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
}

// =============================================================================
// Template Card Component
// =============================================================================

interface TemplateCardProps {
    template: GenerationTemplate;
    onApply: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
}

function TemplateCard({ template, onApply, onEdit, onDelete, isActive }: TemplateCardProps) {
    return (
        <AppCard
            className={cn(
                "p-4 cursor-pointer transition-all hover:border-primary/50",
                isActive && "ring-2 ring-primary border-primary/50"
            )}
            onClick={onApply}
        >
            {/* Thumbnail */}
            <div className="aspect-square bg-gradient-to-br from-surface to-background rounded-lg mb-3 flex items-center justify-center text-4xl">
                🎨
            </div>

            {/* Info */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{template.name}</h4>
                    {template.isDefault && (
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                            Varsayılan
                        </span>
                    )}
                </div>
                {template.description && (
                    <p className="text-xs text-textMuted line-clamp-2">
                        {template.description}
                    </p>
                )}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-textMuted">
                        {template.usageCount} kullanım
                    </span>
                    {!template.isDefault && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-1 text-textMuted hover:text-white text-xs"
                                >
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-1 text-red-400 hover:text-red-300 text-xs"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppCard>
    );
}

// =============================================================================
// Save Template Modal
// =============================================================================

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => void;
    initialName?: string;
    initialDescription?: string;
}

function SaveTemplateModal({
    isOpen,
    onClose,
    onSave,
    initialName = "",
    initialDescription = "",
}: SaveTemplateModalProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);

    useEffect(() => {
        setName(initialName);
        setDescription(initialDescription);
    }, [initialName, initialDescription]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), description.trim());
            setName("");
            setDescription("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <AppCard className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Şablon Olarak Kaydet</h3>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Şablon Adı *
                        </label>
                        <AppInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: Yaz Koleksiyonu Stili"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Açıklama
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Şablon hakkında kısa bir açıklama..."
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <AppButton variant="secondary" onClick={onClose}>
                        İptal
                    </AppButton>
                    <AppButton onClick={handleSave} disabled={!name.trim()}>
                        Kaydet
                    </AppButton>
                </div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Main Template Manager Component
// =============================================================================

export function TemplateManager({
    currentSettings,
    onApplyTemplate,
    className,
}: TemplateManagerProps) {
    const [templates, setTemplates] = useState<GenerationTemplate[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<GenerationTemplate | null>(null);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

    // Load templates on mount
    useEffect(() => {
        setTemplates(loadTemplates());
    }, []);

    // Save template
    const handleSaveTemplate = useCallback((name: string, description: string) => {
        const newTemplate: GenerationTemplate = {
            id: `template_${Date.now()}`,
            name,
            description,
            settings: currentSettings,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
        };

        const updated = [...templates, newTemplate];
        setTemplates(updated);
        saveTemplates(updated);
    }, [currentSettings, templates]);

    // Update template
    const handleUpdateTemplate = useCallback((name: string, description: string) => {
        if (!editingTemplate) return;

        const updated = templates.map(t =>
            t.id === editingTemplate.id
                ? { ...t, name, description, updatedAt: new Date() }
                : t
        );
        setTemplates(updated);
        saveTemplates(updated);
        setEditingTemplate(null);
    }, [editingTemplate, templates]);

    // Delete template
    const handleDeleteTemplate = useCallback((templateId: string) => {
        const updated = templates.filter(t => t.id !== templateId);
        setTemplates(updated);
        saveTemplates(updated);
    }, [templates]);

    // Apply template
    const handleApplyTemplate = useCallback((template: GenerationTemplate) => {
        onApplyTemplate(template.settings);
        setActiveTemplateId(template.id);

        // Update usage count
        const updated = templates.map(t =>
            t.id === template.id
                ? { ...t, usageCount: t.usageCount + 1 }
                : t
        );
        setTemplates(updated);
        saveTemplates(updated);
    }, [onApplyTemplate, templates]);

    const defaultTemplatesList = templates.filter(t => t.isDefault);
    const userTemplatesList = templates.filter(t => !t.isDefault);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📋 Şablonlar</h3>
                <AppButton
                    variant="secondary"
                    onClick={() => setShowSaveModal(true)}
                    className="text-sm"
                >
                    + Mevcut Ayarları Kaydet
                </AppButton>
            </div>

            {/* User Templates */}
            {userTemplatesList.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-textMuted mb-3">
                        Kaydedilmiş Şablonlarım
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {userTemplatesList.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onApply={() => handleApplyTemplate(template)}
                                onEdit={() => setEditingTemplate(template)}
                                onDelete={() => handleDeleteTemplate(template.id)}
                                isActive={activeTemplateId === template.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Default Templates */}
            <div>
                <h4 className="text-sm font-medium text-textMuted mb-3">
                    Hazır Şablonlar
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {defaultTemplatesList.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onApply={() => handleApplyTemplate(template)}
                            isActive={activeTemplateId === template.id}
                        />
                    ))}
                </div>
            </div>

            {/* Save Modal */}
            <SaveTemplateModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSaveTemplate}
            />

            {/* Edit Modal */}
            <SaveTemplateModal
                isOpen={!!editingTemplate}
                onClose={() => setEditingTemplate(null)}
                onSave={handleUpdateTemplate}
                initialName={editingTemplate?.name}
                initialDescription={editingTemplate?.description}
            />
        </div>
    );
}

// =============================================================================
// Hook for Template Management
// =============================================================================

export function useTemplates() {
    const [templates, setTemplates] = useState<GenerationTemplate[]>([]);

    useEffect(() => {
        setTemplates(loadTemplates());
    }, []);

    const saveTemplate = useCallback((name: string, description: string, settings: GenerationSettings) => {
        const newTemplate: GenerationTemplate = {
            id: `template_${Date.now()}`,
            name,
            description,
            settings,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
        };

        const updated = [...templates, newTemplate];
        setTemplates(updated);
        saveTemplates(updated);
        return newTemplate;
    }, [templates]);

    const deleteTemplate = useCallback((templateId: string) => {
        const updated = templates.filter(t => t.id !== templateId);
        setTemplates(updated);
        saveTemplates(updated);
    }, [templates]);

    const getTemplateById = useCallback((templateId: string) => {
        return templates.find(t => t.id === templateId);
    }, [templates]);

    return {
        templates,
        defaultTemplates: templates.filter(t => t.isDefault),
        userTemplates: templates.filter(t => !t.isDefault),
        saveTemplate,
        deleteTemplate,
        getTemplateById,
    };
}

export default TemplateManager;
