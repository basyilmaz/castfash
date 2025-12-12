'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useShortcutsContext, formatShortcutKeys, DEFAULT_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
    className?: string;
}

export function KeyboardShortcutsHelp({ className }: KeyboardShortcutsHelpProps) {
    const { showHelp, setShowHelp, getShortcutsByCategory } = useShortcutsContext();

    const groups = getShortcutsByCategory();

    // Eğer context'ten grup gelmiyorsa default'ları göster
    const displayGroups = groups.length > 0 ? groups : getDefaultGroups();

    // Body scroll'u kapat
    useEffect(() => {
        if (showHelp) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showHelp]);

    if (!showHelp) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowHelp(false)}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative bg-background border border-border rounded-2xl shadow-2xl',
                    'w-full max-w-2xl max-h-[80vh] overflow-hidden',
                    'animate-in fade-in zoom-in-95 duration-200',
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Klavye Kısayolları</h2>
                            <p className="text-sm text-textMuted">Daha hızlı çalışmak için kısayolları kullanın</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowHelp(false)}
                        className="p-2 text-textMuted hover:text-white hover:bg-surface rounded-lg transition-colors"
                        aria-label="Kapat"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    <div className="grid gap-6 md:grid-cols-2">
                        {displayGroups.map((group) => (
                            <div key={group.category}>
                                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" />
                                    {group.category}
                                </h3>
                                <div className="space-y-2">
                                    {group.shortcuts.map((shortcut, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 px-3 bg-surface/50 rounded-lg"
                                        >
                                            <span className="text-sm text-textSecondary">
                                                {shortcut.description}
                                            </span>
                                            <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-white">
                                                {shortcut.keys}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-surface/30">
                    <div className="flex items-center justify-between text-sm text-textMuted">
                        <span>Yardımı kapatmak için <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-xs">ESC</kbd> tuşuna basın</span>
                        <span className="hidden md:inline">Kısayollar input alanlarında çalışmaz</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Default grupları oluştur
function getDefaultGroups() {
    const groups: Record<string, { category: string; shortcuts: Array<{ keys: string; description: string }> }> = {};

    for (const shortcut of DEFAULT_SHORTCUTS) {
        const category = shortcut.category || 'Genel';

        if (!groups[category]) {
            groups[category] = {
                category,
                shortcuts: [],
            };
        }

        groups[category].shortcuts.push({
            keys: formatShortcutKeys(shortcut),
            description: shortcut.description,
        });
    }

    return Object.values(groups);
}

// Standalone component without context (for simpler usage)
interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shortcuts?: Array<{
        category: string;
        items: Array<{
            keys: string;
            description: string;
        }>;
    }>;
    className?: string;
}

export function KeyboardShortcutsModal({
    isOpen,
    onClose,
    shortcuts,
    className
}: KeyboardShortcutsModalProps) {
    // ESC ile kapat
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Body scroll'u kapat
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const defaultShortcuts = shortcuts || [
        {
            category: 'Navigasyon',
            items: [
                { keys: 'G', description: 'Anasayfaya git' },
                { keys: 'P', description: 'Ürünlere git' },
                { keys: 'M', description: 'Modellere git' },
                { keys: 'S', description: 'Sahnelere git' },
            ],
        },
        {
            category: 'İşlemler',
            items: [
                { keys: 'Ctrl + N', description: 'Yeni oluştur' },
                { keys: 'Ctrl + S', description: 'Kaydet' },
                { keys: 'Ctrl + F', description: 'Arama' },
                { keys: 'Ctrl + Z', description: 'Geri al' },
            ],
        },
        {
            category: 'Yardım',
            items: [
                { keys: 'Shift + ?', description: 'Kısayol yardımı' },
                { keys: 'Esc', description: 'Kapat / İptal' },
            ],
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative bg-background border border-border rounded-2xl shadow-2xl',
                    'w-full max-w-2xl max-h-[80vh] overflow-hidden',
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Klavye Kısayolları</h2>
                            <p className="text-sm text-textMuted">Daha hızlı çalışmak için kısayolları kullanın</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-textMuted hover:text-white hover:bg-surface rounded-lg transition-colors"
                        aria-label="Kapat"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    <div className="grid gap-6 md:grid-cols-2">
                        {defaultShortcuts.map((group) => (
                            <div key={group.category}>
                                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" />
                                    {group.category}
                                </h3>
                                <div className="space-y-2">
                                    {group.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 px-3 bg-surface/50 rounded-lg"
                                        >
                                            <span className="text-sm text-textSecondary">
                                                {item.description}
                                            </span>
                                            <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-white">
                                                {item.keys}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-surface/30">
                    <p className="text-sm text-textMuted text-center">
                        Yardımı kapatmak için <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-xs">ESC</kbd> tuşuna basın
                    </p>
                </div>
            </div>
        </div>
    );
}
