'use client';

/* eslint-disable react-hooks/purity */

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// =====================================
// MOBILE INPUT COMPONENT
// =====================================

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, fullWidth = true, className, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-textSecondary"
                    >
                        {label}
                        {props.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            // Base styles
                            'w-full rounded-xl border bg-surface text-white transition-all duration-200',
                            // Size - optimized for touch
                            'h-12 md:h-11 px-4 text-base md:text-sm',
                            // Focus styles
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            // Placeholder
                            'placeholder:text-textMuted',
                            // Default border
                            'border-border hover:border-primary/50',
                            // Error state
                            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                            // Icon padding
                            !!leftIcon && 'pl-11',
                            !!rightIcon && 'pr-11',
                            // Disabled
                            props.disabled && 'opacity-50 cursor-not-allowed bg-surface/50',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="text-sm text-red-400 flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p id={`${inputId}-helper`} className="text-sm text-textMuted">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

MobileInput.displayName = 'MobileInput';

// =====================================
// MOBILE TEXTAREA COMPONENT
// =====================================

interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
    ({ label, error, helperText, fullWidth = true, className, id, ...props }, ref) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-textSecondary"
                    >
                        {label}
                        {props.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        // Base styles
                        'w-full rounded-xl border bg-surface text-white transition-all duration-200',
                        // Size - optimized for touch
                        'min-h-[120px] p-4 text-base md:text-sm resize-y',
                        // Focus styles
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        // Placeholder
                        'placeholder:text-textMuted',
                        // Default border
                        'border-border hover:border-primary/50',
                        // Error state
                        error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                        // Disabled
                        props.disabled && 'opacity-50 cursor-not-allowed bg-surface/50',
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="text-sm text-red-400 flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p id={`${textareaId}-helper`} className="text-sm text-textMuted">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

MobileTextarea.displayName = 'MobileTextarea';

// =====================================
// MOBILE SELECT COMPONENT
// =====================================

interface MobileSelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface MobileSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: MobileSelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
    ({ label, error, helperText, options, placeholder, fullWidth = true, className, id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-textSecondary"
                    >
                        {label}
                        {props.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            // Base styles
                            'w-full rounded-xl border bg-surface text-white transition-all duration-200 appearance-none',
                            // Size - optimized for touch
                            'h-12 md:h-11 px-4 pr-10 text-base md:text-sm',
                            // Focus styles
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            // Default border
                            'border-border hover:border-primary/50',
                            // Error state
                            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                            // Disabled
                            props.disabled && 'opacity-50 cursor-not-allowed bg-surface/50',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p id={`${selectId}-error`} className="text-sm text-red-400 flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p id={`${selectId}-helper`} className="text-sm text-textMuted">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

MobileSelect.displayName = 'MobileSelect';

// =====================================
// MOBILE BUTTON COMPONENT
// =====================================

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        fullWidth = false,
        loading = false,
        leftIcon,
        rightIcon,
        className,
        children,
        disabled,
        ...props
    }, ref) => {
        const variantClasses = {
            primary: 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50',
            secondary: 'bg-surface text-white border border-border hover:bg-surface/80',
            outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10',
            ghost: 'bg-transparent text-textSecondary hover:bg-surface hover:text-white',
            danger: 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600',
        };

        const sizeClasses = {
            sm: 'h-10 px-4 text-sm gap-1.5',
            md: 'h-12 md:h-11 px-5 text-base md:text-sm gap-2',
            lg: 'h-14 md:h-12 px-6 text-lg md:text-base gap-2.5',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200',
                    // Active state for touch feedback
                    'active:scale-[0.98]',
                    // Disabled
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                    // Variant
                    variantClasses[variant],
                    // Size
                    sizeClasses[size],
                    // Full width
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <>
                        {leftIcon}
                        {children}
                        {rightIcon}
                    </>
                )}
            </button>
        );
    }
);

MobileButton.displayName = 'MobileButton';

// =====================================
// MOBILE FORM CONTAINER
// =====================================

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
}

export function MobileForm({ children, spacing = 'md', className, ...props }: MobileFormProps) {
    const spacingClasses = {
        sm: 'space-y-3',
        md: 'space-y-4',
        lg: 'space-y-6',
    };

    return (
        <form
            className={cn(
                spacingClasses[spacing],
                // Prevent zoom on input focus for iOS
                '[&_input]:text-[16px] [&_input]:md:text-sm',
                '[&_textarea]:text-[16px] [&_textarea]:md:text-sm',
                '[&_select]:text-[16px] [&_select]:md:text-sm',
                className
            )}
            {...props}
        >
            {children}
        </form>
    );
}

// =====================================
// MOBILE FORM ROW (Responsive Grid)
// =====================================

interface MobileFormRowProps {
    children: ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export function MobileFormRow({ children, columns = 2, className }: MobileFormRowProps) {
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-4', columnClasses[columns], className)}>
            {children}
        </div>
    );
}

// =====================================
// MOBILE FORM SECTION
// =====================================

interface MobileFormSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function MobileFormSection({ title, description, children, className }: MobileFormSectionProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    {description && <p className="text-sm text-textMuted">{description}</p>}
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

// =====================================
// MOBILE CHECKBOX
// =====================================

interface MobileCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    description?: string;
}

export const MobileCheckbox = forwardRef<HTMLInputElement, MobileCheckboxProps>(
    ({ label, description, className, id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <label
                htmlFor={checkboxId}
                className={cn(
                    'flex items-start gap-3 cursor-pointer group p-3 -m-3 rounded-xl hover:bg-surface/50 transition-colors',
                    props.disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
            >
                <div className="relative flex-shrink-0 pt-0.5">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        className="peer sr-only"
                        {...props}
                    />
                    <div className="h-6 w-6 rounded-lg border-2 border-border bg-surface transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/50 group-hover:border-primary/50">
                        <svg
                            className="h-full w-full text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-white">{label}</span>
                    {description && (
                        <p className="text-sm text-textMuted mt-0.5">{description}</p>
                    )}
                </div>
            </label>
        );
    }
);

MobileCheckbox.displayName = 'MobileCheckbox';

// =====================================
// MOBILE SWITCH (Toggle)
// =====================================

interface MobileSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    description?: string;
}

export const MobileSwitch = forwardRef<HTMLInputElement, MobileSwitchProps>(
    ({ label, description, className, id, ...props }, ref) => {
        const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <label
                htmlFor={switchId}
                className={cn(
                    'flex items-center justify-between gap-4 cursor-pointer group p-3 -m-3 rounded-xl hover:bg-surface/50 transition-colors',
                    props.disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
            >
                <div className="flex-1">
                    <span className="text-sm font-medium text-white">{label}</span>
                    {description && (
                        <p className="text-sm text-textMuted mt-0.5">{description}</p>
                    )}
                </div>
                <div className="relative flex-shrink-0">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={switchId}
                        className="peer sr-only"
                        {...props}
                    />
                    <div className="h-7 w-12 rounded-full bg-surface border border-border transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/50">
                        <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-textMuted transition-all peer-checked:translate-x-5 peer-checked:bg-white shadow-sm" />
                    </div>
                </div>
            </label>
        );
    }
);

MobileSwitch.displayName = 'MobileSwitch';
