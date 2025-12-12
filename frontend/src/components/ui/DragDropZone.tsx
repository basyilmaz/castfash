import { useState, useCallback, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { FileUpload, FileValidationRules } from './FileUpload';

interface DragDropZoneProps {
    onFilesSelected: (files: File[]) => void;
    validation?: FileValidationRules;
    multiple?: boolean;
    className?: string;
    showPreviews?: boolean;
}

export function DragDropZone({
    onFilesSelected,
    validation,
    multiple = true,
    className,
    showPreviews = true,
}: DragDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

    // Helper function - defined before useCallback that uses it
    const handleFiles = useCallback((files: File[]) => {
        setSelectedFiles(files);
        onFilesSelected(files);

        // Generate previews for image files
        if (showPreviews) {
            const newPreviews: { file: File; url: string }[] = [];

            files.forEach((file) => {
                if (file.type.startsWith('image/')) {
                    const url = URL.createObjectURL(file);
                    newPreviews.push({ file, url });
                }
            });

            setPreviews(newPreviews);
        }
    }, [onFilesSelected, showPreviews]);

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set dragging to false if we're leaving the drop zone entirely
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                handleFiles(files);
            }
        },
        [handleFiles]
    );

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        // Revoke URL to free memory
        if (previews[index]) {
            URL.revokeObjectURL(previews[index].url);
        }

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onFilesSelected(newFiles);
    };

    const clearAll = () => {
        // Revoke all URLs
        previews.forEach((preview) => URL.revokeObjectURL(preview.url));

        setSelectedFiles([]);
        setPreviews([]);
        onFilesSelected([]);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-200',
                    isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50'
                )}
            >
                <div className="p-8">
                    <FileUpload
                        onFilesSelected={handleFiles}
                        validation={validation}
                        multiple={multiple}
                        className="border-none"
                    />
                </div>

                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm rounded-xl pointer-events-none">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-16 w-16 text-primary animate-bounce"
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
                            <p className="mt-4 text-lg font-semibold text-primary">
                                Dosyaları buraya bırakın
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Grid */}
            {showPreviews && previews.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                            Önizleme ({previews.length} dosya)
                        </h4>
                        <button
                            onClick={clearAll}
                            className="text-xs text-textMuted hover:text-red-400 transition-colors"
                        >
                            Tümünü Temizle
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {previews.map((preview, index) => (
                            <div
                                key={index}
                                className="group relative aspect-square rounded-lg overflow-hidden bg-surface border border-border hover:border-primary transition-all"
                            >
                                {/* Image */}
                                <img
                                    src={preview.url}
                                    alt={preview.file.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                        aria-label="Dosyayı kaldır"
                                    >
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* File Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-xs text-white truncate">{preview.file.name}</p>
                                    <p className="text-xs text-gray-300">
                                        {formatFileSize(preview.file.size)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
