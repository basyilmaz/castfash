import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface UploadProgressProps {
    fileName: string;
    fileSize: number;
    uploadedBytes: number;
    onCancel?: () => void;
    status?: 'uploading' | 'completed' | 'error' | 'cancelled';
    error?: string;
    className?: string;
}

export function UploadProgress({
    fileName,
    fileSize,
    uploadedBytes,
    onCancel,
    status = 'uploading',
    error,
    className,
}: UploadProgressProps) {
    const [uploadSpeed, setUploadSpeed] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const lastUpdateRef = useRef<{ bytes: number; time: number }>({
        bytes: 0,
        time: 0,
    });

    // Initialize time on mount
    useEffect(() => {
        lastUpdateRef.current.time = Date.now();
    }, []);

    const percentage = Math.min(Math.round((uploadedBytes / fileSize) * 100), 100);

    useEffect(() => {
        if (status !== 'uploading') return;

        const now = Date.now();
        const timeDiff = (now - lastUpdateRef.current.time) / 1000; // seconds
        const bytesDiff = uploadedBytes - lastUpdateRef.current.bytes;

        if (timeDiff > 0.5) {
            // Update every 500ms
            const speed = bytesDiff / timeDiff; // bytes per second
            setUploadSpeed(speed);

            const remaining = fileSize - uploadedBytes;
            const timeLeft = speed > 0 ? remaining / speed : 0;
            setTimeRemaining(timeLeft);

            lastUpdateRef.current = { bytes: uploadedBytes, time: now };
        }
    }, [uploadedBytes, fileSize, status]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatSpeed = (bytesPerSecond: number): string => {
        return `${formatFileSize(bytesPerSecond)}/s`;
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    };

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'cancelled':
                return 'bg-gray-500';
            default:
                return 'bg-primary';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case 'uploading':
                return (
                    <svg className="h-5 w-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cn('p-4 bg-surface rounded-lg border border-border space-y-3', className)}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName}</p>
                        <p className="text-xs text-textMuted mt-0.5">
                            {formatFileSize(uploadedBytes)} / {formatFileSize(fileSize)}
                        </p>
                    </div>
                </div>

                {/* Cancel Button */}
                {status === 'uploading' && onCancel && (
                    <button
                        onClick={onCancel}
                        className="flex-shrink-0 text-textMuted hover:text-red-400 transition-colors"
                        aria-label="Yüklemeyi iptal et"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="relative h-2 bg-card rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                            getStatusColor()
                        )}
                        style={{ width: `${percentage}%` }}
                    >
                        {status === 'uploading' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-textMuted">
                    <span className="font-medium">{percentage}%</span>
                    {status === 'uploading' && uploadSpeed > 0 && (
                        <div className="flex items-center gap-3">
                            <span>{formatSpeed(uploadSpeed)}</span>
                            {timeRemaining > 0 && <span>Kalan: {formatTime(timeRemaining)}</span>}
                        </div>
                    )}
                    {status === 'completed' && <span className="text-green-400">Tamamlandı</span>}
                    {status === 'error' && <span className="text-red-400">Hata</span>}
                    {status === 'cancelled' && <span className="text-gray-400">İptal Edildi</span>}
                </div>
            </div>

            {/* Error Message */}
            {status === 'error' && error && (
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                    {error}
                </div>
            )}
        </div>
    );
}

// Shimmer animation for progress bar
const shimmerStyles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Add to global CSS or use styled-components
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
}
