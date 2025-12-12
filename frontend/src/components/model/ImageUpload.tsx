'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    label: string;
    file: File | null;
    url: string;
    onFileChange: (file: File | null) => void;
    onUrlChange: (url: string) => void;
    required?: boolean;
    badge?: string;
    badgeColor?: string;
}

export function ImageUpload({
    label,
    file,
    url,
    onFileChange,
    onUrlChange,
    required = false,
    badge,
    badgeColor = 'bg-primary',
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        onFileChange(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const clearFile = () => {
        onFileChange(null);
        setPreview(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{label}</h3>
                {required && <span className="text-red-400 text-sm">*</span>}
                {badge && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold shadow-lg', badgeColor, 'text-white')}>
                        {badge}
                    </span>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 items-start">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-bold text-white mb-3 bg-surface/50 px-3 py-2 rounded-lg">
                        📁 Dosya Yükle
                    </label>
                    <div className="relative group cursor-pointer">
                        <div
                            className={cn(
                                'w-full h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all',
                                file || preview
                                    ? 'border-primary bg-primary/20'
                                    : 'border-primary/30 bg-card group-hover:border-primary group-hover:bg-primary/10'
                            )}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {preview || url ? (
                                <div className="relative w-full h-full p-2">
                                    <img
                                        src={preview || url}
                                        alt={label}
                                        className="w-full h-full object-cover rounded"
                                    />
                                    {file && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearFile();
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                                        >
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <svg
                                        className="mx-auto h-16 w-16 text-primary group-hover:scale-110 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="mt-3 text-base font-bold text-white">Dosya seçmek için tıklayın</p>
                                    <p className="text-sm text-white/80 mt-2">veya sürükleyip bırakın</p>
                                    <p className="text-sm text-primary mt-3 font-bold bg-primary/20 px-3 py-1 rounded-full inline-block">
                                        PNG, JPG, WEBP (max. 10MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="mt-3 p-3 bg-primary/20 rounded-lg border-2 border-primary">
                            <p className="text-sm text-white font-bold">
                                📎 {file.name}
                            </p>
                            <p className="text-xs text-white/80 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    )}
                </div>

                {/* URL Input */}
                <div className="flex flex-col justify-center h-full">
                    <label className="block text-sm font-bold text-white mb-3 bg-surface/50 px-3 py-2 rounded-lg">
                        🔗 Veya URL Girin
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => onUrlChange(e.target.value)}
                        disabled={!!file}
                        className={cn(
                            'w-full rounded-lg px-4 py-3 text-sm transition-all font-medium',
                            'bg-card border-2 border-primary/30 text-white',
                            'placeholder:text-white/50',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                        placeholder="https://..."
                    />
                    <div className="mt-3 p-3 bg-primary/20 rounded-lg border border-primary/30">
                        <p className="text-sm text-white font-medium">
                            💡 <span className="font-bold">İpucu:</span> Yüksek kaliteli, net fotoğraflar daha iyi sonuç verir
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
