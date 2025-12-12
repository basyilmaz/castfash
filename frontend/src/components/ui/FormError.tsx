import { cn } from '@/lib/utils';

interface FormErrorProps {
    error?: string;
    touched?: boolean;
    className?: string;
}

export function FormError({ error, touched = true, className }: FormErrorProps) {
    if (!error || !touched) return null;

    return (
        <div className={cn('flex items-start gap-2 mt-1', className)}>
            <svg
                className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
        </div>
    );
}

interface FormFieldProps {
    label: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
    hint?: string;
}

export function FormField({
    label,
    error,
    touched,
    required,
    children,
    className,
    hint,
}: FormFieldProps) {
    const hasError = error && touched;

    return (
        <div className={cn('space-y-2', className)}>
            <label className="block text-sm font-medium text-textMuted">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            <div className={cn(hasError && 'animate-shake')}>
                {children}
            </div>

            {hint && !hasError && (
                <p className="text-xs text-textMuted">{hint}</p>
            )}

            <FormError error={error} touched={touched} />
        </div>
    );
}

// Validation helpers
export const validators = {
    required: (value: unknown) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'Bu alan zorunludur';
        }
        return undefined;
    },

    email: (value: string) => {
        if (!value) return undefined;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Geçerli bir email adresi girin';
        }
        return undefined;
    },

    minLength: (min: number) => (value: string) => {
        if (!value) return undefined;
        if (value.length < min) {
            return `En az ${min} karakter olmalıdır`;
        }
        return undefined;
    },

    maxLength: (max: number) => (value: string) => {
        if (!value) return undefined;
        if (value.length > max) {
            return `En fazla ${max} karakter olabilir`;
        }
        return undefined;
    },

    min: (min: number) => (value: number) => {
        if (value === undefined || value === null) return undefined;
        if (value < min) {
            return `En az ${min} olmalıdır`;
        }
        return undefined;
    },

    max: (max: number) => (value: number) => {
        if (value === undefined || value === null) return undefined;
        if (value > max) {
            return `En fazla ${max} olabilir`;
        }
        return undefined;
    },

    pattern: (regex: RegExp, message: string) => (value: string) => {
        if (!value) return undefined;
        if (!regex.test(value)) {
            return message;
        }
        return undefined;
    },

    url: (value: string) => {
        if (!value) return undefined;
        try {
            new URL(value);
            return undefined;
        } catch {
            return 'Geçerli bir URL girin';
        }
    },

    phone: (value: string) => {
        if (!value) return undefined;
        const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return 'Geçerli bir telefon numarası girin';
        }
        return undefined;
    },

    password: (value: string) => {
        if (!value) return undefined;
        if (value.length < 8) {
            return 'Şifre en az 8 karakter olmalıdır';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Şifre en az bir büyük harf içermelidir';
        }
        if (!/[a-z]/.test(value)) {
            return 'Şifre en az bir küçük harf içermelidir';
        }
        if (!/[0-9]/.test(value)) {
            return 'Şifre en az bir rakam içermelidir';
        }
        return undefined;
    },

    confirmPassword: (password: string) => (value: string) => {
        if (!value) return undefined;
        if (value !== password) {
            return 'Şifreler eşleşmiyor';
        }
        return undefined;
    },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: unknown) => string | undefined>) {
    return (value: unknown) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return undefined;
    };
}

// Add shake animation to global CSS
const shakeAnimation = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s;
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = shakeAnimation;
    document.head.appendChild(style);
}
