'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface GenerationResult {
    id: number;
    imageUrl: string;
    thumbnailUrl?: string;
    productName: string;
    modelName: string;
    sceneName: string;
    quality: 'fast' | 'standard' | 'high';
    createdAt: string;
    metadata?: {
        width: number;
        height: number;
        fileSize: number;
        format: string;
    };
}

interface ResultPreviewProps {
    result: GenerationResult;
    onClose: () => void;
    onDownload?: (format: 'original' | 'optimized') => void;
    onRegenerate?: () => void;
    onShare?: () => void;
    className?: string;
}

export function ResultPreview({
    result,
    onClose,
    onDownload,
    onRegenerate,
    onShare,
    className,
}: ResultPreviewProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [showMetadata, setShowMetadata] = useState(false);

    const handleDownload = async (format: 'original' | 'optimized') => {
        if (!onDownload) return;

        setIsDownloading(true);
        try {
            await onDownload(format);
        } finally {
            setIsDownloading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getQualityBadge = (quality: string) => {
        switch (quality) {
            case 'fast':
                return { label: 'Hızlı', color: 'bg-green-500/20 text-green-400', icon: '⚡' };
            case 'standard':
                return { label: 'Standart', color: 'bg-blue-500/20 text-blue-400', icon: '⭐' };
            case 'high':
                return { label: 'Yüksek', color: 'bg-purple-500/20 text-purple-400', icon: '💎' };
            default:
                return { label: 'Standart', color: 'bg-blue-500/20 text-blue-400', icon: '⭐' };
        }
    };

    const qualityBadge = getQualityBadge(result.quality);

    return (
        <div
            className={cn(
                'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4',
                className
            )}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
                    {/* Image Preview */}
                    <div className="relative bg-black flex items-center justify-center p-8">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={result.imageUrl}
                                alt={result.productName}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                            aria-label="Kapat"
                        >
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Quality Badge */}
                        <div className="absolute top-4 left-4">
                            <span className={cn('px-3 py-1.5 rounded-lg text-sm font-medium', qualityBadge.color)}>
                                {qualityBadge.icon} {qualityBadge.label}
                            </span>
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="flex flex-col max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-border">
                            <h2 className="text-2xl font-bold mb-2">Üretim Detayları</h2>
                            <p className="text-sm text-textMuted">{formatDate(result.createdAt)}</p>
                        </div>

                        {/* Info */}
                        <div className="p-6 space-y-4 flex-1">
                            <div>
                                <h3 className="text-sm font-medium text-textMuted mb-2">Ürün</h3>
                                <p className="text-lg font-semibold">{result.productName}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-textMuted mb-2">Model</h3>
                                <p className="text-lg font-semibold">{result.modelName}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-textMuted mb-2">Sahne</h3>
                                <p className="text-lg font-semibold">{result.sceneName}</p>
                            </div>

                            {/* Metadata Toggle */}
                            {result.metadata && (
                                <div>
                                    <button
                                        onClick={() => setShowMetadata(!showMetadata)}
                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <span>{showMetadata ? '▼' : '▶'} Teknik Detaylar</span>
                                    </button>

                                    {showMetadata && (
                                        <div className="mt-3 p-4 bg-surface rounded-lg space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-textMuted">Boyut:</span>
                                                <span className="font-medium">
                                                    {result.metadata.width} × {result.metadata.height}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-textMuted">Dosya Boyutu:</span>
                                                <span className="font-medium">{formatFileSize(result.metadata.fileSize)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-textMuted">Format:</span>
                                                <span className="font-medium uppercase">{result.metadata.format}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-border space-y-3">
                            {/* Download Options */}
                            {onDownload && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-textMuted">İndir</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleDownload('original')}
                                            disabled={isDownloading}
                                            className="px-4 py-2.5 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDownloading ? '⏳ İndiriliyor...' : '📥 Orijinal'}
                                        </button>
                                        <button
                                            onClick={() => handleDownload('optimized')}
                                            disabled={isDownloading}
                                            className="px-4 py-2.5 bg-surface border border-border rounded-lg font-medium hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDownloading ? '⏳ İndiriliyor...' : '⚡ Optimize'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Other Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                {onRegenerate && (
                                    <button
                                        onClick={onRegenerate}
                                        className="px-4 py-2.5 bg-surface border border-border rounded-lg font-medium hover:border-primary transition-colors"
                                    >
                                        🔄 Yeniden Üret
                                    </button>
                                )}
                                {onShare && (
                                    <button
                                        onClick={onShare}
                                        className="px-4 py-2.5 bg-surface border border-border rounded-lg font-medium hover:border-primary transition-colors"
                                    >
                                        🔗 Paylaş
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
