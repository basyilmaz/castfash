'use client';

import { cn } from '@/lib/utils';

export type ModelType = 'IMAGE_REFERENCE' | 'TEXT_ONLY' | 'HYBRID';

interface ModelTypeOption {
    type: ModelType;
    icon: string;
    title: string;
    description: string;
    recommended?: boolean;
    advanced?: boolean;
}

interface ModelTypeSelectorProps {
    selected: ModelType | null;
    onSelect: (type: ModelType) => void;
}

const modelTypes: ModelTypeOption[] = [
    {
        type: 'IMAGE_REFERENCE',
        icon: '📸',
        title: 'Görsel Referans',
        description: 'Fotoğraf yükleyerek model oluştur',
        recommended: true,
    },
    {
        type: 'TEXT_ONLY',
        icon: '✍️',
        title: 'Metin Prompt',
        description: 'Açıklama yazarak model oluştur',
    },
    {
        type: 'HYBRID',
        icon: '🎨',
        title: 'Hibrit',
        description: 'Görsel + Metin birlikte',
        advanced: true,
    },
];

export function ModelTypeSelector({ selected, onSelect }: ModelTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Hangi tür model profili oluşturmak istiyorsunuz?</h2>
                <p className="text-textMuted">Size en uygun yöntemi seçin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modelTypes.map((option) => (
                    <button
                        key={option.type}
                        onClick={() => onSelect(option.type)}
                        className={cn(
                            'relative p-6 rounded-xl border-2 transition-all duration-300 text-left',
                            'hover:scale-105 hover:shadow-xl',
                            selected === option.type
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-border bg-surface hover:border-primary/50'
                        )}
                    >
                        {/* Recommended Badge */}
                        {option.recommended && (
                            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                ⭐ Önerilen
                            </div>
                        )}

                        {/* Advanced Badge */}
                        {option.advanced && (
                            <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                🔥 Gelişmiş
                            </div>
                        )}

                        {/* Icon */}
                        <div className="text-5xl mb-4">{option.icon}</div>

                        {/* Title */}
                        <h3 className={cn(
                            'text-lg font-bold mb-2',
                            selected === option.type ? 'text-primary' : 'text-white'
                        )}>
                            {option.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-textMuted">{option.description}</p>

                        {/* Selected Indicator */}
                        {selected === option.type && (
                            <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Seçildi
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
