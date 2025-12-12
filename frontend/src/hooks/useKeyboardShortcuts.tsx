'use client';

import { useEffect, useCallback, useRef, useState, createContext, useContext, ReactNode } from 'react';

// =====================================
// TYPES
// =====================================

export interface KeyboardShortcut {
    key: string;                    // Ana tuş (a-z, 0-9, Enter, Escape, etc.)
    ctrl?: boolean;                 // Ctrl tuşu
    shift?: boolean;                // Shift tuşu
    alt?: boolean;                  // Alt tuşu
    meta?: boolean;                 // Meta (Cmd on Mac, Win on Windows)
    description: string;            // Kısayol açıklaması
    category?: string;              // Kategori (Navigation, Actions, etc.)
    action: () => void;             // Çalıştırılacak fonksiyon
    enabled?: boolean;              // Aktif mi?
    preventDefault?: boolean;       // Varsayılan davranışı engelle
}

export interface ShortcutGroup {
    category: string;
    shortcuts: Array<{
        keys: string;
        description: string;
    }>;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

// Kısayol tuş kombinasyonunu string olarak formatla
export function formatShortcutKeys(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.meta) parts.push('⌘');

    // Özel tuşlar için daha okunabilir isimler
    const keyNames: Record<string, string> = {
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'Enter': '↵',
        'Escape': 'Esc',
        'Backspace': '⌫',
        'Delete': 'Del',
        'Tab': '⇥',
        ' ': 'Space',
    };

    const displayKey = keyNames[shortcut.key] || shortcut.key.toUpperCase();
    parts.push(displayKey);

    return parts.join(' + ');
}

// Keyboard event ile shortcut eşleşiyor mu?
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
    const shiftMatches = !!shortcut.shift === event.shiftKey;
    const altMatches = !!shortcut.alt === event.altKey;

    return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

// Input elementi mi kontrol et
function isInputElement(element: Element | null): boolean {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        (element as HTMLElement).isContentEditable
    );
}

// =====================================
// USE KEYBOARD SHORTCUT HOOK (Single)
// =====================================

export function useKeyboardShortcut(
    shortcut: Omit<KeyboardShortcut, 'description'> & { description?: string },
    deps: React.DependencyList = []
) {
    const actionRef = useRef(shortcut.action);

    useEffect(() => {
        actionRef.current = shortcut.action;
    }, [shortcut.action]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Input elementlerinde çalışma (eğer istenirse)
            if (isInputElement(document.activeElement) && !shortcut.ctrl && !shortcut.alt && !shortcut.meta) {
                return;
            }

            if (shortcut.enabled === false) return;

            if (matchesShortcut(event, shortcut as KeyboardShortcut)) {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                actionRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortcut.key, shortcut.ctrl, shortcut.shift, shortcut.alt, shortcut.meta, shortcut.enabled, ...deps]);
}

// =====================================
// USE KEYBOARD SHORTCUTS HOOK (Multiple)
// =====================================

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const shortcutsRef = useRef(shortcuts);

    useEffect(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Input elementlerinde sadece modifier tuşlu kısayolları çalıştır
            const isInput = isInputElement(document.activeElement);

            for (const shortcut of shortcutsRef.current) {
                if (shortcut.enabled === false) continue;

                // Input'ta iken modifier olmayan kısayolları atla
                if (isInput && !shortcut.ctrl && !shortcut.alt && !shortcut.meta) {
                    continue;
                }

                if (matchesShortcut(event, shortcut)) {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}

// =====================================
// KEYBOARD SHORTCUTS CONTEXT
// =====================================

interface ShortcutsContextValue {
    shortcuts: KeyboardShortcut[];
    registerShortcut: (shortcut: KeyboardShortcut) => void;
    unregisterShortcut: (key: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;
    showHelp: boolean;
    setShowHelp: (show: boolean) => void;
    getShortcutsByCategory: () => ShortcutGroup[];
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
    const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
    const [showHelp, setShowHelp] = useState(false);

    const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
        setShortcuts(prev => {
            // Aynı kısayol varsa güncelle
            const existing = prev.findIndex(s =>
                s.key === shortcut.key &&
                s.ctrl === shortcut.ctrl &&
                s.shift === shortcut.shift &&
                s.alt === shortcut.alt
            );

            if (existing !== -1) {
                const updated = [...prev];
                updated[existing] = shortcut;
                return updated;
            }

            return [...prev, shortcut];
        });
    }, []);

    const unregisterShortcut = useCallback((
        key: string,
        modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
    ) => {
        setShortcuts(prev => prev.filter(s =>
            !(s.key === key &&
                s.ctrl === modifiers?.ctrl &&
                s.shift === modifiers?.shift &&
                s.alt === modifiers?.alt)
        ));
    }, []);

    const getShortcutsByCategory = useCallback((): ShortcutGroup[] => {
        const groups: Record<string, ShortcutGroup> = {};

        for (const shortcut of shortcuts) {
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
    }, [shortcuts]);

    // Global ? kısayolu ile yardım modalını aç/kapa
    useKeyboardShortcut({
        key: '?',
        shift: true,
        action: () => setShowHelp(prev => !prev),
        description: 'Kısayol yardımını göster',
    });

    // ESC ile kapat
    useKeyboardShortcut({
        key: 'Escape',
        action: () => setShowHelp(false),
        enabled: showHelp,
        description: 'Kapat',
    });

    // Global kısayolları dinle
    useKeyboardShortcuts(shortcuts);

    return (
        <ShortcutsContext.Provider value= {{
        shortcuts,
            registerShortcut,
            unregisterShortcut,
            showHelp,
            setShowHelp,
            getShortcutsByCategory,
        }
}>
    { children }
    </ShortcutsContext.Provider>
    );
}

export function useShortcutsContext() {
    const context = useContext(ShortcutsContext);
    if (!context) {
        throw new Error('useShortcutsContext must be used within a ShortcutsProvider');
    }
    return context;
}

// =====================================
// USE REGISTER SHORTCUT HOOK
// =====================================

// Bileşen mount olduğunda kısayolu kaydet, unmount olduğunda kaldır
export function useRegisterShortcut(shortcut: KeyboardShortcut) {
    const { registerShortcut, unregisterShortcut } = useShortcutsContext();

    useEffect(() => {
        registerShortcut(shortcut);

        return () => {
            unregisterShortcut(shortcut.key, {
                ctrl: shortcut.ctrl,
                shift: shortcut.shift,
                alt: shortcut.alt,
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortcut.key, shortcut.ctrl, shortcut.shift, shortcut.alt, shortcut.enabled]);
}

// =====================================
// DEFAULT APP SHORTCUTS
// =====================================

export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
    // Navigation
    { key: 'g', description: 'Anasayfaya git', category: 'Navigasyon' },
    { key: 'p', description: 'Ürünlere git', category: 'Navigasyon' },
    { key: 'm', description: 'Modellere git', category: 'Navigasyon' },
    { key: 's', description: 'Sahnelere git', category: 'Navigasyon' },

    // Actions
    { key: 'n', ctrl: true, description: 'Yeni oluştur', category: 'İşlemler' },
    { key: 's', ctrl: true, description: 'Kaydet', category: 'İşlemler' },
    { key: 'f', ctrl: true, description: 'Arama', category: 'İşlemler' },

    // Help
    { key: '?', shift: true, description: 'Kısayol yardımı', category: 'Yardım' },
    { key: 'Escape', description: 'Kapat / İptal', category: 'Yardım' },
];
