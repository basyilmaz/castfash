'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormStepProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function FormStep({ title, description, children, className }: FormStepProps) {
    return (
        <div className={cn('space-y-6 animate-in fade-in slide-in-from-right-4 duration-500', className)}>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                {description && <p className="text-sm text-textMuted">{description}</p>}
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}
