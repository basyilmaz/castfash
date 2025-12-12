"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";

// =============================================================================
// Types
// =============================================================================

export type FilterOperator =
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "greater_or_equal"
    | "less_or_equal"
    | "between"
    | "in"
    | "not_in"
    | "is_empty"
    | "is_not_empty";

export type FilterType = "text" | "number" | "date" | "select" | "multiselect" | "boolean";

export interface FilterField {
    id: string;
    label: string;
    type: FilterType;
    operators?: FilterOperator[];
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface FilterCondition {
    id: string;
    fieldId: string;
    operator: FilterOperator;
    value: string | number | boolean | string[];
    secondValue?: string | number; // For "between" operator
}

export interface FilterPreset {
    id: string;
    name: string;
    conditions: FilterCondition[];
    isDefault?: boolean;
}

export interface AdvancedFilterProps {
    fields: FilterField[];
    conditions: FilterCondition[];
    onChange: (conditions: FilterCondition[]) => void;
    presets?: FilterPreset[];
    onSavePreset?: (name: string, conditions: FilterCondition[]) => void;
    onDeletePreset?: (presetId: string) => void;
    className?: string;
    maxConditions?: number;
    showPresets?: boolean;
}

// =============================================================================
// Operator Labels
// =============================================================================

const operatorLabels: Record<FilterOperator, string> = {
    equals: "Eşittir",
    not_equals: "Eşit Değildir",
    contains: "İçerir",
    not_contains: "İçermez",
    starts_with: "İle Başlar",
    ends_with: "İle Biter",
    greater_than: "Büyüktür",
    less_than: "Küçüktür",
    greater_or_equal: "Büyük veya Eşit",
    less_or_equal: "Küçük veya Eşit",
    between: "Arasında",
    in: "İçinde",
    not_in: "İçinde Değil",
    is_empty: "Boş",
    is_not_empty: "Boş Değil",
};

const defaultOperatorsByType: Record<FilterType, FilterOperator[]> = {
    text: ["contains", "equals", "not_equals", "starts_with", "ends_with", "is_empty", "is_not_empty"],
    number: ["equals", "not_equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal", "between"],
    date: ["equals", "not_equals", "greater_than", "less_than", "between"],
    select: ["equals", "not_equals", "is_empty", "is_not_empty"],
    multiselect: ["in", "not_in", "is_empty", "is_not_empty"],
    boolean: ["equals"],
};

// =============================================================================
// Generate Unique ID
// =============================================================================

function generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// Filter Row Component
// =============================================================================

interface FilterRowProps {
    condition: FilterCondition;
    fields: FilterField[];
    onChange: (condition: FilterCondition) => void;
    onRemove: () => void;
    isFirst: boolean;
}

function FilterRow({ condition, fields, onChange, onRemove, isFirst }: FilterRowProps) {
    const selectedField = fields.find((f) => f.id === condition.fieldId);
    const operators = selectedField?.operators || defaultOperatorsByType[selectedField?.type || "text"];

    const handleFieldChange = (fieldId: string) => {
        const newField = fields.find((f) => f.id === fieldId);
        const newOperators = newField?.operators || defaultOperatorsByType[newField?.type || "text"];
        onChange({
            ...condition,
            fieldId,
            operator: newOperators[0],
            value: "",
            secondValue: undefined,
        });
    };

    const handleOperatorChange = (operator: FilterOperator) => {
        onChange({
            ...condition,
            operator,
            secondValue: operator === "between" ? condition.secondValue : undefined,
        });
    };

    const renderValueInput = () => {
        if (condition.operator === "is_empty" || condition.operator === "is_not_empty") {
            return null;
        }

        if (selectedField?.type === "select" || selectedField?.type === "multiselect") {
            return (
                <AppSelect
                    value={String(condition.value)}
                    onChange={(e) => onChange({ ...condition, value: e.target.value })}
                    className="flex-1 min-w-[150px]"
                >
                    <option value="">Seçiniz...</option>
                    {selectedField.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </AppSelect>
            );
        }

        if (selectedField?.type === "boolean") {
            return (
                <AppSelect
                    value={String(condition.value)}
                    onChange={(e) => onChange({ ...condition, value: e.target.value === "true" })}
                    className="flex-1 min-w-[150px]"
                >
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                </AppSelect>
            );
        }

        if (selectedField?.type === "date") {
            return (
                <div className="flex gap-2 flex-1">
                    <AppInput
                        type="date"
                        value={String(condition.value)}
                        onChange={(e) => onChange({ ...condition, value: e.target.value })}
                        className="flex-1"
                    />
                    {condition.operator === "between" && (
                        <>
                            <span className="self-center text-textMuted">ve</span>
                            <AppInput
                                type="date"
                                value={String(condition.secondValue || "")}
                                onChange={(e) => onChange({ ...condition, secondValue: e.target.value })}
                                className="flex-1"
                            />
                        </>
                    )}
                </div>
            );
        }

        if (selectedField?.type === "number") {
            return (
                <div className="flex gap-2 flex-1">
                    <AppInput
                        type="number"
                        value={String(condition.value)}
                        onChange={(e) => onChange({ ...condition, value: Number(e.target.value) })}
                        placeholder={selectedField.placeholder || "Değer girin..."}
                        className="flex-1"
                    />
                    {condition.operator === "between" && (
                        <>
                            <span className="self-center text-textMuted">ve</span>
                            <AppInput
                                type="number"
                                value={String(condition.secondValue || "")}
                                onChange={(e) => onChange({ ...condition, secondValue: Number(e.target.value) })}
                                className="flex-1"
                            />
                        </>
                    )}
                </div>
            );
        }

        // Default: text input
        return (
            <AppInput
                type="text"
                value={String(condition.value)}
                onChange={(e) => onChange({ ...condition, value: e.target.value })}
                placeholder={selectedField?.placeholder || "Değer girin..."}
                className="flex-1 min-w-[150px]"
            />
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-background rounded-lg border border-border/50">
            {/* AND/OR indicator (for non-first rows) */}
            {!isFirst && (
                <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
                    VE
                </span>
            )}

            {/* Field selector */}
            <AppSelect
                value={condition.fieldId}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="min-w-[140px]"
            >
                <option value="">Alan seçin...</option>
                {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                        {field.label}
                    </option>
                ))}
            </AppSelect>

            {/* Operator selector */}
            {condition.fieldId && (
                <AppSelect
                    value={condition.operator}
                    onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
                    className="min-w-[140px]"
                >
                    {operators.map((op) => (
                        <option key={op} value={op}>
                            {operatorLabels[op]}
                        </option>
                    ))}
                </AppSelect>
            )}

            {/* Value input */}
            {condition.fieldId && renderValueInput()}

            {/* Remove button */}
            <button
                onClick={onRemove}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Filtreyi kaldır"
            >
                ✕
            </button>
        </div>
    );
}

// =============================================================================
// Preset Selector Component
// =============================================================================

interface PresetSelectorProps {
    presets: FilterPreset[];
    onSelect: (preset: FilterPreset) => void;
    onDelete?: (presetId: string) => void;
    className?: string;
}

function PresetSelector({ presets, onSelect, onDelete, className }: PresetSelectorProps) {
    if (presets.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <span className="text-sm text-textMuted self-center">Hazır Filtreler:</span>
            {presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                    <button
                        onClick={() => onSelect(preset)}
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            preset.isDefault
                                ? "bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
                                : "bg-surface border-border hover:bg-surface/80 text-white"
                        )}
                    >
                        {preset.name}
                    </button>
                    {onDelete && !preset.isDefault && (
                        <button
                            onClick={() => onDelete(preset.id)}
                            className="p-1 text-red-400 hover:text-red-300 text-xs"
                            title="Filtreyi sil"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// Save Preset Modal
// =============================================================================

interface SavePresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

function SavePresetModal({ isOpen, onClose, onSave }: SavePresetModalProps) {
    const [name, setName] = useState("");

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setName("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Filtreyi Kaydet</h3>
                <AppInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Filtre adı girin..."
                    className="mb-4"
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <AppButton variant="secondary" onClick={onClose}>
                        İptal
                    </AppButton>
                    <AppButton onClick={handleSave} disabled={!name.trim()}>
                        Kaydet
                    </AppButton>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Main Advanced Filter Component
// =============================================================================

export function AdvancedFilter({
    fields,
    conditions,
    onChange,
    presets = [],
    onSavePreset,
    onDeletePreset,
    className,
    maxConditions = 10,
    showPresets = true,
}: AdvancedFilterProps) {
    const [isExpanded, setIsExpanded] = useState(conditions.length > 0);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Add new condition
    const handleAddCondition = useCallback(() => {
        if (conditions.length >= maxConditions) return;

        const newCondition: FilterCondition = {
            id: generateId(),
            fieldId: "",
            operator: "contains",
            value: "",
        };
        onChange([...conditions, newCondition]);
    }, [conditions, maxConditions, onChange]);

    // Update a condition
    const handleUpdateCondition = useCallback(
        (index: number, condition: FilterCondition) => {
            const newConditions = [...conditions];
            newConditions[index] = condition;
            onChange(newConditions);
        },
        [conditions, onChange]
    );

    // Remove a condition
    const handleRemoveCondition = useCallback(
        (index: number) => {
            onChange(conditions.filter((_, i) => i !== index));
        },
        [conditions, onChange]
    );

    // Clear all conditions
    const handleClearAll = useCallback(() => {
        onChange([]);
    }, [onChange]);

    // Apply preset
    const handleApplyPreset = useCallback(
        (preset: FilterPreset) => {
            onChange(preset.conditions.map((c) => ({ ...c, id: generateId() })));
        },
        [onChange]
    );

    // Save preset
    const handleSavePreset = useCallback(
        (name: string) => {
            onSavePreset?.(name, conditions);
        },
        [conditions, onSavePreset]
    );

    // Active filters count
    const activeFiltersCount = useMemo(
        () => conditions.filter((c) => c.fieldId && c.value !== "").length,
        [conditions]
    );

    return (
        <div className={cn("bg-surface border border-border rounded-xl", className)}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">🔍</span>
                    <span className="font-medium">Gelişmiş Filtreler</span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                            {activeFiltersCount} aktif
                        </span>
                    )}
                </div>
                <span
                    className={cn(
                        "text-xl transition-transform",
                        isExpanded ? "rotate-180" : ""
                    )}
                >
                    ▼
                </span>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Presets */}
                    {showPresets && presets.length > 0 && (
                        <PresetSelector
                            presets={presets}
                            onSelect={handleApplyPreset}
                            onDelete={onDeletePreset}
                        />
                    )}

                    {/* Filter Rows */}
                    <div className="space-y-2">
                        {conditions.map((condition, index) => (
                            <FilterRow
                                key={condition.id}
                                condition={condition}
                                fields={fields}
                                onChange={(c) => handleUpdateCondition(index, c)}
                                onRemove={() => handleRemoveCondition(index)}
                                isFirst={index === 0}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <AppButton
                            variant="secondary"
                            onClick={handleAddCondition}
                            disabled={conditions.length >= maxConditions}
                            className="text-sm"
                        >
                            + Filtre Ekle
                        </AppButton>

                        {conditions.length > 0 && (
                            <>
                                <AppButton
                                    variant="secondary"
                                    onClick={handleClearAll}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    Temizle
                                </AppButton>

                                {onSavePreset && (
                                    <AppButton
                                        variant="secondary"
                                        onClick={() => setShowSaveModal(true)}
                                        className="text-sm"
                                    >
                                        💾 Kaydet
                                    </AppButton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Save Preset Modal */}
            <SavePresetModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSavePreset}
            />
        </div>
    );
}

// =============================================================================
// Hook for Filter Logic
// =============================================================================

export function useAdvancedFilter<T>(initialConditions: FilterCondition[] = []) {
    const [conditions, setConditions] = useState<FilterCondition[]>(initialConditions);
    const [presets, setPresets] = useState<FilterPreset[]>([]);

    // Load presets from localStorage
    useEffect(() => {
        const savedPresets = localStorage.getItem("filterPresets");
        if (savedPresets) {
            try {
                setPresets(JSON.parse(savedPresets));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Save preset
    const savePreset = useCallback((name: string, filterConditions: FilterCondition[]) => {
        const newPreset: FilterPreset = {
            id: generateId(),
            name,
            conditions: filterConditions,
        };
        const updatedPresets = [...presets, newPreset];
        setPresets(updatedPresets);
        localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));
    }, [presets]);

    // Delete preset
    const deletePreset = useCallback((presetId: string) => {
        const updatedPresets = presets.filter((p) => p.id !== presetId);
        setPresets(updatedPresets);
        localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));
    }, [presets]);

    // Apply filter to data
    const applyFilter = useCallback(
        (data: T[], getFieldValue: (item: T, fieldId: string) => unknown): T[] => {
            if (conditions.length === 0) return data;

            return data.filter((item) => {
                return conditions.every((condition) => {
                    if (!condition.fieldId) return true;

                    const value = getFieldValue(item, condition.fieldId);
                    const filterValue = condition.value;

                    switch (condition.operator) {
                        case "equals":
                            return value === filterValue;
                        case "not_equals":
                            return value !== filterValue;
                        case "contains":
                            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                        case "not_contains":
                            return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                        case "starts_with":
                            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
                        case "ends_with":
                            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
                        case "greater_than":
                            return Number(value) > Number(filterValue);
                        case "less_than":
                            return Number(value) < Number(filterValue);
                        case "greater_or_equal":
                            return Number(value) >= Number(filterValue);
                        case "less_or_equal":
                            return Number(value) <= Number(filterValue);
                        case "between":
                            return Number(value) >= Number(filterValue) && Number(value) <= Number(condition.secondValue);
                        case "in":
                            return Array.isArray(filterValue) && filterValue.includes(String(value));
                        case "not_in":
                            return Array.isArray(filterValue) && !filterValue.includes(String(value));
                        case "is_empty":
                            return value === "" || value === null || value === undefined;
                        case "is_not_empty":
                            return value !== "" && value !== null && value !== undefined;
                        default:
                            return true;
                    }
                });
            });
        },
        [conditions]
    );

    // Build query string for API
    const buildQueryString = useCallback((): string => {
        if (conditions.length === 0) return "";

        const params = conditions
            .filter((c) => c.fieldId && c.value !== "")
            .map((c) => {
                const base = `filter[${c.fieldId}][${c.operator}]=${encodeURIComponent(String(c.value))}`;
                if (c.operator === "between" && c.secondValue !== undefined) {
                    return `${base}&filter[${c.fieldId}][to]=${encodeURIComponent(String(c.secondValue))}`;
                }
                return base;
            });

        return params.join("&");
    }, [conditions]);

    return {
        conditions,
        setConditions,
        presets,
        savePreset,
        deletePreset,
        applyFilter,
        buildQueryString,
    };
}

export default AdvancedFilter;
