# Prompt Ayarları Sistemi - Implementation Guide

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Kullanım Örnekleri](#kullanım-örnekleri)
5. [Test Senaryoları](#test-senaryoları)

---

## 🎯 Genel Bakış

### Tamamlanan İşler
✅ Database Schema (Prisma Migration)
✅ Prompt Service (Business Logic)

### Yapılması Gerekenler
- [ ] Backend: Controller + Module
- [ ] Backend: Audit Log Integration
- [ ] Frontend: Prompt Management Pages
- [ ] Frontend: Test Playground
- [ ] Integration: Generation Service'e entegrasyon

---

## 🔧 Backend Implementation

### 1. Prompt Controller Oluşturma

**Dosya:** `backend/src/modules/prompt/prompt.controller.ts`

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.type';

@Controller('system-admin/prompts')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PromptController {
    constructor(private promptService: PromptService) {}

    // Templates
    @Get('templates')
    async getTemplates(
        @Query('type') type?: string,
        @Query('category') category?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.promptService.getTemplates({
            type: type as any,
            category: category as any,
            isActive: isActive === 'true',
        });
    }

    @Get('templates/:id')
    async getTemplate(@Param('id') id: string) {
        return this.promptService.getTemplate(parseInt(id));
    }

    @Post('templates')
    async createTemplate(
        @Body() data: any,
        @CurrentUser() user: RequestUser,
    ) {
        return this.promptService.createTemplate({
            ...data,
            createdBy: user.userId,
        });
    }

    @Put('templates/:id')
    async updateTemplate(
        @Param('id') id: string,
        @Body() data: any,
        @CurrentUser() user: RequestUser,
    ) {
        return this.promptService.updateTemplate(parseInt(id), {
            ...data,
            createdBy: user.userId,
        });
    }

    @Delete('templates/:id')
    async deleteTemplate(@Param('id') id: string) {
        return this.promptService.deleteTemplate(parseInt(id));
    }

    // Presets
    @Get('presets')
    async getPresets(@Query('isActive') isActive?: string) {
        return this.promptService.getPresets({
            isActive: isActive === 'true',
        });
    }

    @Post('presets')
    async createPreset(
        @Body() data: any,
        @CurrentUser() user: RequestUser,
    ) {
        return this.promptService.createPreset({
            ...data,
            createdBy: user.userId,
        });
    }

    @Put('presets/:id')
    async updatePreset(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.promptService.updatePreset(parseInt(id), data);
    }

    @Delete('presets/:id')
    async deletePreset(@Param('id') id: string) {
        return this.promptService.deletePreset(parseInt(id));
    }

    // Analytics
    @Get('templates/:id/analytics')
    async getTemplateAnalytics(
        @Param('id') id: string,
        @Query('days') days?: string,
    ) {
        return this.promptService.getTemplateAnalytics(
            parseInt(id),
            days ? parseInt(days) : 30,
        );
    }

    // Combination & Preview
    @Post('preview')
    async previewPrompt(@Body() data: any) {
        return this.promptService.combinePrompts(data);
    }

    // Bulk Operations
    @Post('templates/bulk-update')
    async bulkUpdateTemplates(@Body() data: { ids: number[]; updates: any }) {
        return this.promptService.bulkUpdateTemplates(data.ids, data.updates);
    }

    @Post('templates/export')
    async exportTemplates(@Body() data: { ids?: number[] }) {
        return this.promptService.exportTemplates(data.ids);
    }

    @Post('templates/import')
    async importTemplates(
        @Body() data: { templates: any[] },
        @CurrentUser() user: RequestUser,
    ) {
        return this.promptService.importTemplates(data.templates, user.userId);
    }
}
```

### 2. Prompt Module Oluşturma

**Dosya:** `backend/src/modules/prompt/prompt.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PromptController],
    providers: [PromptService],
    exports: [PromptService],
})
export class PromptModule {}
```

### 3. App Module'e Ekleme

**Dosya:** `backend/src/app.module.ts`

```typescript
import { PromptModule } from './modules/prompt/prompt.module';

@Module({
    imports: [
        // ... diğer modüller
        PromptModule,
    ],
})
export class AppModule {}
```

---

## 🎨 Frontend Implementation

### 1. Ana Sayfa Yapısı

**Dosya:** `frontend/src/app/(system-admin)/system-admin/prompts/page.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import TemplatesTab from "./components/TemplatesTab";
import PresetsTab from "./components/PresetsTab";
import PlaygroundTab from "./components/PlaygroundTab";

type TabType = "templates" | "presets" | "playground";

export default function PromptsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("templates");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Prompt Ayarları</h1>
                <p className="text-textMuted">
                    Master promptları, preset'leri yönetin ve test edin
                </p>
            </div>

            {/* Tabs */}
            <AppCard className="p-2">
                <div className="flex gap-2">
                    <AppButton
                        variant={activeTab === "templates" ? "primary" : "ghost"}
                        onClick={() => setActiveTab("templates")}
                    >
                        📝 Master Promptlar
                    </AppButton>
                    <AppButton
                        variant={activeTab === "presets" ? "primary" : "ghost"}
                        onClick={() => setActiveTab("presets")}
                    >
                        🎨 Preset'ler
                    </AppButton>
                    <AppButton
                        variant={activeTab === "playground" ? "primary" : "ghost"}
                        onClick={() => setActiveTab("playground")}
                    >
                        🔍 Test Alanı
                    </AppButton>
                </div>
            </AppCard>

            {/* Tab Content */}
            {activeTab === "templates" && <TemplatesTab />}
            {activeTab === "presets" && <PresetsTab />}
            {activeTab === "playground" && <PlaygroundTab />}
        </div>
    );
}
```

### 2. Templates Tab Component

**Dosya:** `frontend/src/app/(system-admin)/system-admin/prompts/components/TemplatesTab.tsx`

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { toast } from "sonner";
import TemplateModal from "./TemplateModal";

interface Template {
    id: number;
    name: string;
    type: string;
    category: string | null;
    content: string;
    isActive: boolean;
    priority: number;
    tags: string[];
    _count: {
        versions: number;
        analytics: number;
    };
}

export default function TemplatesTab() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            setLoading(true);
            const data = await apiFetch<{ templates: Template[] }>(
                "/system-admin/prompts/templates"
            );
            setTemplates(data.templates || []);
        } catch (err) {
            console.error("Failed to load templates", err);
            toast.error("Promptlar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Bu prompt'u silmek istediğinizden emin misiniz?")) return;

        try {
            await apiFetch(`/system-admin/prompts/templates/${id}`, {
                method: "DELETE",
            });
            toast.success("Prompt silindi!");
            loadTemplates();
        } catch (err) {
            toast.error("Prompt silinemedi!");
        }
    }

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            MASTER: "primary",
            SCENE: "success",
            POSE: "warning",
            LIGHTING: "info",
            STYLE: "secondary",
            NEGATIVE: "danger",
        };
        return <AppBadge variant={colors[type] as any}>{type}</AppBadge>;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">
                    Toplam {templates.length} prompt
                </div>
                <AppButton onClick={() => {
                    setEditingTemplate(null);
                    setShowModal(true);
                }}>
                    ➕ Yeni Prompt Ekle
                </AppButton>
            </div>

            {/* Templates List */}
            {loading ? (
                <div className="text-center py-8 text-textMuted">Yükleniyor...</div>
            ) : (
                <div className="space-y-4">
                    {templates.map((template) => (
                        <AppCard key={template.id} className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold">{template.name}</h3>
                                        {getTypeBadge(template.type)}
                                        {template.category && (
                                            <AppBadge variant="info">{template.category}</AppBadge>
                                        )}
                                        {!template.isActive && (
                                            <AppBadge variant="default">Pasif</AppBadge>
                                        )}
                                    </div>
                                    <div className="text-sm text-textMuted mb-3">
                                        Priority: {template.priority} • 
                                        Versions: {template._count.versions} • 
                                        Usage: {template._count.analytics}
                                    </div>
                                    <div className="bg-surface p-3 rounded-lg border border-border">
                                        <pre className="text-sm whitespace-pre-wrap">
                                            {template.content}
                                        </pre>
                                    </div>
                                    {template.tags.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {template.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-surface px-2 py-1 rounded border border-border"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <AppButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingTemplate(template);
                                        setShowModal(true);
                                    }}
                                >
                                    ✏️ Düzenle
                                </AppButton>
                                <AppButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(
                                        `/system-admin/prompts/templates/${template.id}/analytics`,
                                        '_blank'
                                    )}
                                >
                                    📊 Analytics
                                </AppButton>
                                <AppButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    🗑️ Sil
                                </AppButton>
                            </div>
                        </AppCard>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <TemplateModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowModal(false);
                        setEditingTemplate(null);
                    }}
                    onSave={() => {
                        setShowModal(false);
                        setEditingTemplate(null);
                        loadTemplates();
                    }}
                />
            )}
        </div>
    );
}
```

### 3. Template Modal Component

**Dosya:** `frontend/src/app/(system-admin)/system-admin/prompts/components/TemplateModal.tsx`

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { toast } from "sonner";

interface TemplateModalProps {
    template: any | null;
    onClose: () => void;
    onSave: () => void;
}

export default function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState("MASTER");
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState(0);
    const [tags, setTags] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setType(template.type);
            setCategory(template.category || "");
            setContent(template.content);
            setPriority(template.priority);
            setTags(template.tags.join(", "));
            setIsActive(template.isActive);
        }
    }, [template]);

    async function handleSave() {
        if (!name || !content) {
            toast.error("İsim ve içerik gerekli!");
            return;
        }

        try {
            setSaving(true);
            const data = {
                name,
                type,
                category: category || null,
                content,
                priority,
                tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                isActive,
            };

            if (template) {
                await apiFetch(`/system-admin/prompts/templates/${template.id}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                });
                toast.success("Prompt güncellendi!");
            } else {
                await apiFetch("/system-admin/prompts/templates", {
                    method: "POST",
                    body: JSON.stringify(data),
                });
                toast.success("Prompt oluşturuldu!");
            }

            onSave();
        } catch (err: any) {
            toast.error(err.message || "İşlem başarısız!");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <AppCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold mb-4">
                    {template ? "Prompt Düzenle" : "Yeni Prompt Oluştur"}
                </h2>

                <div className="space-y-4">
                    <AppInput
                        label="Prompt Adı"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Master Product Prompt"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">
                                Tip
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                            >
                                <option value="MASTER">Master</option>
                                <option value="SCENE">Scene</option>
                                <option value="POSE">Pose</option>
                                <option value="LIGHTING">Lighting</option>
                                <option value="STYLE">Style</option>
                                <option value="NEGATIVE">Negative</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">
                                Kategori
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                            >
                                <option value="">Seçiniz</option>
                                <option value="PRODUCT">Product</option>
                                <option value="MODEL">Model</option>
                                <option value="GENERAL">General</option>
                                <option value="BACKGROUND">Background</option>
                                <option value="QUALITY">Quality</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            İçerik
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                            placeholder="Professional fashion photography, studio lighting..."
                        />
                        <div className="text-xs text-textMuted mt-1">
                            Variables kullanabilirsiniz: {"{product_name}"}, {"{model_name}"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <AppInput
                            label="Priority (Sıralama)"
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                        />

                        <AppInput
                            label="Tags (virgülle ayırın)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="studio, professional, high-quality"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Aktif
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <AppButton onClick={handleSave} loading={saving} fullWidth>
                            {template ? "Güncelle" : "Oluştur"}
                        </AppButton>
                        <AppButton variant="outline" onClick={onClose} fullWidth>
                            İptal
                        </AppButton>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}
```

### 4. Playground Tab (Test Alanı)

**Dosya:** `frontend/src/app/(system-admin)/system-admin/prompts/components/PlaygroundTab.tsx`

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/http";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { toast } from "sonner";

export default function PlaygroundTab() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
    const [sceneSelection, setSceneSelection] = useState("");
    const [poseSelection, setPoseSelection] = useState("");
    const [lightingSelection, setLightingSelection] = useState("");
    const [styleSelection, setStyleSelection] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [productName, setProductName] = useState("");
    const [modelName, setModelName] = useState("");
    const [result, setResult] = useState<{ positive: string; negative: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            const data = await apiFetch<{ templates: any[] }>(
                "/system-admin/prompts/templates?isActive=true"
            );
            setTemplates(data.templates || []);
        } catch (err) {
            console.error("Failed to load templates", err);
        }
    }

    async function handlePreview() {
        try {
            setLoading(true);
            const data = await apiFetch<{ positive: string; negative: string }>(
                "/system-admin/prompts/preview",
                {
                    method: "POST",
                    body: JSON.stringify({
                        masterTemplateIds: selectedTemplates,
                        sceneSelection,
                        poseSelection,
                        lightingSelection,
                        styleSelection,
                        customPrompt,
                        negativePrompt,
                        variables: {
                            product_name: productName,
                            model_name: modelName,
                        },
                    }),
                }
            );
            setResult(data);
            toast.success("Önizleme oluşturuldu!");
        } catch (err) {
            toast.error("Önizleme oluşturulamadı!");
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        toast.success("Panoya kopyalandı!");
    }

    return (
        <div className="space-y-6">
            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Master Promptlar</h3>
                <div className="space-y-2">
                    {templates
                        .filter(t => t.type === "MASTER")
                        .map((template) => (
                            <label
                                key={template.id}
                                className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTemplates.includes(template.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTemplates([...selectedTemplates, template.id]);
                                        } else {
                                            setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-border bg-surface text-primary"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-textMuted truncate">{template.content}</div>
                                </div>
                            </label>
                        ))}
                </div>
            </AppCard>

            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Kullanıcı Seçimleri</h3>
                <div className="grid grid-cols-2 gap-4">
                    <AppInput
                        label="Scene"
                        value={sceneSelection}
                        onChange={(e) => setSceneSelection(e.target.value)}
                        placeholder="studio white background"
                    />
                    <AppInput
                        label="Pose"
                        value={poseSelection}
                        onChange={(e) => setPoseSelection(e.target.value)}
                        placeholder="standing front view"
                    />
                    <AppInput
                        label="Lighting"
                        value={lightingSelection}
                        onChange={(e) => setLightingSelection(e.target.value)}
                        placeholder="soft studio light"
                    />
                    <AppInput
                        label="Style"
                        value={styleSelection}
                        onChange={(e) => setStyleSelection(e.target.value)}
                        placeholder="minimalist, clean"
                    />
                </div>
            </AppCard>

            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Custom Prompts</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Custom Prompt
                        </label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={3}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                            placeholder="model smiling, casual pose..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Negative Prompt
                        </label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            rows={2}
                            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                            placeholder="blurry, low quality..."
                        />
                    </div>
                </div>
            </AppCard>

            <AppCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Variables</h3>
                <div className="grid grid-cols-2 gap-4">
                    <AppInput
                        label="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Blue Shirt"
                    />
                    <AppInput
                        label="Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="John Doe"
                    />
                </div>
            </AppCard>

            <AppButton onClick={handlePreview} loading={loading} fullWidth>
                🔍 Önizleme Oluştur
            </AppButton>

            {result && (
                <AppCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Final Birleştirilmiş Prompt</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-textMuted">
                                    Positive Prompt
                                </label>
                                <AppButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(result.positive)}
                                >
                                    📋 Kopyala
                                </AppButton>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                                <pre className="text-sm whitespace-pre-wrap">{result.positive}</pre>
                            </div>
                        </div>
                        {result.negative && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-textMuted">
                                        Negative Prompt
                                    </label>
                                    <AppButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(result.negative)}
                                    >
                                        📋 Kopyala
                                    </AppButton>
                                </div>
                                <div className="bg-surface p-4 rounded-lg border border-border">
                                    <pre className="text-sm whitespace-pre-wrap">{result.negative}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </AppCard>
            )}
        </div>
    );
}
```

---

## 🔗 Integration

### Generation Service'e Entegrasyon

**Dosya:** `backend/src/modules/generation/generation.service.ts`

```typescript
// Import PromptService
import { PromptService } from '../prompt/prompt.service';

@Injectable()
export class GenerationService {
    constructor(
        private prisma: PrismaService,
        private promptService: PromptService, // Inject
    ) {}

    async createGeneration(data: any) {
        // Combine prompts
        const combinedPrompts = await this.promptService.combinePrompts({
            masterTemplateIds: [1, 2], // Master prompt IDs
            sceneSelection: data.sceneSelection,
            poseSelection: data.poseSelection,
            lightingSelection: data.lightingSelection,
            customPrompt: data.customPrompt,
            variables: {
                product_name: data.productName,
                model_name: data.modelName,
            },
        });

        // Use combinedPrompts.positive and combinedPrompts.negative
        // in your AI generation call
        
        // ... rest of generation logic
    }
}
```

---

## 📝 Kullanım Örnekleri

### 1. Yeni Master Prompt Ekleme

```bash
POST /system-admin/prompts/templates
{
  "name": "Master Product Prompt",
  "type": "MASTER",
  "category": "PRODUCT",
  "content": "Professional fashion photography, studio lighting, high quality, detailed fabric texture, commercial product shot",
  "priority": 1,
  "tags": ["product", "professional", "studio"]
}
```

### 2. Prompt Önizleme

```bash
POST /system-admin/prompts/preview
{
  "masterTemplateIds": [1, 2],
  "sceneSelection": "studio white background",
  "poseSelection": "standing front view",
  "customPrompt": "model smiling",
  "variables": {
    "product_name": "Blue Shirt",
    "model_name": "John"
  }
}
```

**Response:**
```json
{
  "positive": "Professional fashion photography, studio lighting, high quality, Blue Shirt on John, studio white background, standing front view, model smiling",
  "negative": "blurry, low quality, distorted"
}
```

---

## ✅ Checklist

### Backend
- [x] Database Schema
- [x] Prompt Service
- [ ] Prompt Controller (kod snippet verildi)
- [ ] Prompt Module (kod snippet verildi)
- [ ] App Module'e ekleme
- [ ] Audit Log integration

### Frontend
- [ ] Ana sayfa (kod snippet verildi)
- [ ] Templates Tab (kod snippet verildi)
- [ ] Template Modal (kod snippet verildi)
- [ ] Presets Tab (benzer şekilde yapılacak)
- [ ] Playground Tab (kod snippet verildi)
- [ ] Navigation'a ekleme

### Integration
- [ ] Generation Service'e entegrasyon
- [ ] Test

---

## 🚀 Sonraki Adımlar

1. **Backend'i tamamla:** Controller ve Module dosyalarını oluştur
2. **Frontend'i oluştur:** Tüm component'leri ekle
3. **Navigation'a ekle:** System admin menüsüne "Prompt Ayarları" ekle
4. **Test et:** Tüm CRUD işlemlerini test et
5. **Generation'a entegre et:** Gerçek üretimlerde kullan

---

Bu guide ile tüm sistemi adım adım kurabilirsiniz! 🎉
