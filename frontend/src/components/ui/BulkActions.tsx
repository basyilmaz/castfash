'use client';

import { useState, useCallback, useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// =====================================
// TYPES
// =====================================

export interface BulkAction<T> {
    id: string;
    label: string;
    icon?: ReactNode;
    variant?: 'default' | 'danger' | 'primary';
    action: (selectedItems: T[]) => Promise<void> | void;
    confirmMessage?: string;
    requiresConfirmation?: boolean;
    disabled?: (selectedItems: T[]) => boolean;
}

export interface UseBulkSelectOptions<T> {
    items: T[];
    getItemId: (item: T) => string | number;
}

export interface UseBulkSelectReturn<T> {
    selectedIds: Set<string | number>;
    selectedItems: T[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    selectItem: (id: string | number) => void;
    deselectItem: (id: string | number) => void;
    toggleItem: (id: string | number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    toggleAll: () => void;
    isSelected: (id: string | number) => boolean;
    selectedCount: number;
}

// =====================================
// USE BULK SELECT HOOK
// =====================================

export function useBulkSelect<T>({
    items,
    getItemId,
}: UseBulkSelectOptions<T>): UseBulkSelectReturn<T> {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    const allIds = useMemo(
        () => new Set(items.map(getItemId)),
        [items, getItemId]
    );

    const selectedItems = useMemo(
        () => items.filter(item => selectedIds.has(getItemId(item))),
        [items, selectedIds, getItemId]
    );

    const isAllSelected = selectedIds.size > 0 && selectedIds.size === allIds.size;
    const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < allIds.size;

    const selectItem = useCallback((id: string | number) => {
        setSelectedIds(prev => new Set(prev).add(id));
    }, []);

    const deselectItem = useCallback((id: string | number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const toggleItem = useCallback((id: string | number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(allIds));
    }, [allIds]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const toggleAll = useCallback(() => {
        if (isAllSelected) {
            deselectAll();
        } else {
            selectAll();
        }
    }, [isAllSelected, selectAll, deselectAll]);

    const isSelected = useCallback(
        (id: string | number) => selectedIds.has(id),
        [selectedIds]
    );

    return {
        selectedIds,
        selectedItems,
        isAllSelected,
        isPartiallySelected,
        selectItem,
        deselectItem,
        toggleItem,
        selectAll,
        deselectAll,
        toggleAll,
        isSelected,
        selectedCount: selectedIds.size,
    };
}

// =====================================
// BULK CHECKBOX COMPONENT
// =====================================

interface BulkCheckboxProps {
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

export function BulkCheckbox({
    checked,
    indeterminate = false,
    onChange,
    disabled = false,
    className,
    size = 'md',
    label,
}: BulkCheckboxProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <label
            className={cn(
                'inline-flex items-center gap-2 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={cn(
                        'rounded border-2 transition-all duration-150 flex items-center justify-center',
                        sizeClasses[size],
                        checked || indeterminate
                            ? 'bg-primary border-primary'
                            : 'bg-surface border-border hover:border-primary/50',
                        disabled && 'cursor-not-allowed'
                    )}
                >
                    {checked && !indeterminate && (
                        <svg
                            className={cn(
                                'text-white',
                                size === 'sm' && 'h-3 w-3',
                                size === 'md' && 'h-3.5 w-3.5',
                                size === 'lg' && 'h-4 w-4'
                            )}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {indeterminate && (
                        <div
                            className={cn(
                                'bg-white rounded-sm',
                                size === 'sm' && 'h-0.5 w-2',
                                size === 'md' && 'h-0.5 w-2.5',
                                size === 'lg' && 'h-0.5 w-3'
                            )}
                        />
                    )}
                </div>
            </div>
            {label && <span className="text-sm text-textSecondary">{label}</span>}
        </label>
    );
}

// =====================================
// BULK ACTIONS BAR COMPONENT
// =====================================

interface BulkActionsBarProps<T> {
    selectedCount: number;
    selectedItems: T[];
    actions: BulkAction<T>[];
    onClearSelection: () => void;
    className?: string;
    position?: 'top' | 'bottom' | 'sticky';
}

export function BulkActionsBar<T>({
    selectedCount,
    selectedItems,
    actions,
    onClearSelection,
    className,
    position = 'sticky',
}: BulkActionsBarProps<T>) {
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<BulkAction<T> | null>(null);

    const handleAction = async (action: BulkAction<T>) => {
        if (action.requiresConfirmation) {
            setConfirmAction(action);
            return;
        }

        setLoading(action.id);
        try {
            await action.action(selectedItems);
        } finally {
            setLoading(null);
        }
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        setLoading(confirmAction.id);
        try {
            await confirmAction.action(selectedItems);
        } finally {
            setLoading(null);
            setConfirmAction(null);
        }
    };

    if (selectedCount === 0) return null;

    const positionClasses = {
        top: 'top-0',
        bottom: 'bottom-0',
        sticky: 'sticky top-0',
    };

    return (
        <>
            <div
                className={cn(
                    'z-20 bg-primary/10 border border-primary/30 rounded-xl p-3 mb-4',
                    position === 'sticky' && 'sticky top-4',
                    className
                )}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Selection info */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClearSelection}
                            className="p-1.5 text-textMuted hover:text-white hover:bg-surface rounded-lg transition-colors"
                            aria-label="Seçimi temizle"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-white">
                            <span className="text-primary">{selectedCount}</span> öğe seçildi
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {actions.map((action) => {
                            const isDisabled = action.disabled?.(selectedItems) || loading !== null;
                            const isLoading = loading === action.id;

                            return (
                                <button
                                    key={action.id}
                                    onClick={() => handleAction(action)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                        action.variant === 'danger' && 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
                                        action.variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
                                        (!action.variant || action.variant === 'default') && 'bg-surface text-white hover:bg-surface/80',
                                        isDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        action.icon
                                    )}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setConfirmAction(null)}
                    />
                    <div className="relative bg-background border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            İşlemi Onayla
                        </h3>
                        <p className="text-textMuted mb-6">
                            {confirmAction.confirmMessage ||
                                `${selectedCount} öğe üzerinde "${confirmAction.label}" işlemini gerçekleştirmek istediğinize emin misiniz?`}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 text-textMuted hover:text-white transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading !== null}
                                className={cn(
                                    'px-4 py-2 rounded-lg font-medium transition-all',
                                    confirmAction.variant === 'danger'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-primary text-white hover:bg-primary/90',
                                    loading !== null && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {loading !== null ? 'İşleniyor...' : 'Onayla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// =====================================
// BULK SELECT ALL HEADER COMPONENT
// =====================================

interface BulkSelectHeaderProps {
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    onToggleAll: () => void;
    selectedCount: number;
    totalCount: number;
    className?: string;
}

export function BulkSelectHeader({
    isAllSelected,
    isPartiallySelected,
    onToggleAll,
    selectedCount,
    totalCount,
    className,
}: BulkSelectHeaderProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <BulkCheckbox
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onChange={onToggleAll}
            />
            <span className="text-sm text-textMuted">
                {selectedCount > 0 ? (
                    <>
                        <span className="text-white font-medium">{selectedCount}</span> / {totalCount} seçili
                    </>
                ) : (
                    'Tümünü seç'
                )}
            </span>
        </div>
    );
}

// =====================================
// EXPORT CSV UTILITY
// =====================================

export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; label: string }[]
) {
    if (data.length === 0) return;

    const headers = columns
        ? columns.map(c => c.label)
        : Object.keys(data[0]);

    const keys = columns
        ? columns.map(c => c.key)
        : (Object.keys(data[0]) as (keyof T)[]);

    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            keys
                .map(key => {
                    const value = row[key];
                    const stringValue = String(value ?? '');
                    // Escape quotes and wrap in quotes if contains comma
                    if (stringValue.includes(',') || stringValue.includes('"')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                })
                .join(',')
        ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
