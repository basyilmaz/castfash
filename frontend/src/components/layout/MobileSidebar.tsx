'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// Navigation items
const navItems = [
    {
        href: '/dashboard',
        key: 'sidebar.dashboard',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/products',
        key: 'sidebar.products',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
    },
    {
        href: '/scenes',
        key: 'sidebar.scenes',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        href: '/model-profiles',
        key: 'sidebar.models',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        href: '/generations',
        key: 'sidebar.generations',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
];

interface MobileSidebarProps {
    className?: string;
}

export function MobileSidebar({ className }: MobileSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useI18n();

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const toggleSidebar = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <Fragment>
            {/* Hamburger Button - Only visible on mobile */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    'md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-surface/90 backdrop-blur-lg border border-border shadow-lg transition-all duration-200',
                    isOpen && 'bg-primary/20 border-primary',
                    className
                )}
                aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                aria-expanded={isOpen}
            >
                <div className="relative w-5 h-5">
                    <span
                        className={cn(
                            'absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300',
                            isOpen ? 'top-2.5 rotate-45' : 'top-1'
                        )}
                    />
                    <span
                        className={cn(
                            'absolute left-0 top-2.5 block w-5 h-0.5 bg-current transition-all duration-300',
                            isOpen && 'opacity-0 translate-x-2'
                        )}
                    />
                    <span
                        className={cn(
                            'absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300',
                            isOpen ? 'top-2.5 -rotate-45' : 'top-4'
                        )}
                    />
                </div>
            </button>

            {/* Overlay */}
            <div
                className={cn(
                    'md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Panel */}
            <aside
                className={cn(
                    'md:hidden fixed top-0 left-0 z-40 h-full w-72 bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl transition-transform duration-300 ease-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/30">
                            CF
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-tight">castfash</p>
                            <p className="text-[11px] text-textMuted">AI fashion visuals</p>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-surface transition-colors"
                        aria-label="Menüyü kapat"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
                    {navItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-textSecondary hover:bg-surface hover:text-white'
                                )}
                            >
                                <span className={cn(active ? 'text-white' : 'text-textMuted')}>
                                    {item.icon}
                                </span>
                                {t(item.key)}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background/50">
                    <div className="rounded-xl border border-border bg-surface/50 px-3 py-2.5">
                        <p className="text-xs font-medium">castfash admin</p>
                        <p className="text-[11px] text-textMuted mt-0.5">Manage AI visuals and presets.</p>
                    </div>
                </div>
            </aside>
        </Fragment>
    );
}

// Hook for mobile sidebar state management (can be used externally)
export function useMobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, open, close, toggle };
}

// Mobile bottom navigation (optional alternative/addition)
interface BottomNavProps {
    className?: string;
}

export function MobileBottomNav({ className }: BottomNavProps) {
    const pathname = usePathname();
    const { t } = useI18n();

    // Only show first 5 items for bottom nav
    const bottomNavItems = navItems.slice(0, 5);

    return (
        <nav
            className={cn(
                'md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-xl border-t border-border safe-area-pb',
                className
            )}
        >
            <div className="flex items-center justify-around h-16 px-2">
                {bottomNavItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[60px] transition-all duration-200',
                                active
                                    ? 'text-primary'
                                    : 'text-textMuted hover:text-white'
                            )}
                        >
                            <span
                                className={cn(
                                    'transition-transform',
                                    active && 'scale-110'
                                )}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-medium truncate max-w-[60px]">
                                {t(item.key)}
                            </span>
                            {active && (
                                <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
