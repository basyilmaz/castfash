'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon?: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: ReactNode;
    className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, children, className }: TabsProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Tab Headers */}
            <div className="border-b border-border">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'px-6 py-3 text-sm font-medium transition-all relative',
                                'hover:text-white',
                                activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-textMuted'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {tab.icon && <span>{tab.icon}</span>}
                                {tab.label}
                            </span>

                            {/* Active Indicator */}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in slide-in-from-left duration-200" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
            </div>
        </div>
    );
}

interface TabPanelProps {
    value: string;
    activeTab: string;
    children: ReactNode;
}

export function TabPanel({ value, activeTab, children }: TabPanelProps) {
    if (value !== activeTab) return null;

    return <div>{children}</div>;
}
