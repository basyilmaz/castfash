import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    label?: string;
    className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, placeholder = 'Seçiniz...', error, label, className, ...props }, ref) => {
        return (
            <div className={cn('space-y-2', className)}>
                {label && (
                    <label className="block text-sm font-medium text-textMuted">
                        {label}
                        {props.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                )}

                <select
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg px-4 py-3 text-sm transition-all appearance-none',
                        'bg-surface border border-border text-white',
                        'placeholder:text-textSecondary',
                        'focus:outline-none focus:ring-2 focus:ring-primaryDark focus:border-primaryDark',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'hover:border-textMuted',
                        // Option styling - siyah text beyaz background
                        '[&>option]:text-black [&>option]:bg-white',
                        error && 'border-red-500 focus:ring-red-500',
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled className="text-black">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="text-black"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
