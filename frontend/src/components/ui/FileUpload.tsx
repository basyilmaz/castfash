import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface FileValidationRules {
    maxSize?: number; // in bytes
    allowedFormats?: string[]; // e.g., ['image/jpeg', 'image/png']
    minFiles?: number;
    maxFiles?: number;
}

export interface FileUploadError {
    file: File;
    error: string;
}

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    validation?: FileValidationRules;
    multiple?: boolean;
    className?: string;
    accept?: string;
}

// Helper: dosya boyutunu okunabilir formata çevir
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const DEFAULT_VALIDATION: FileValidationRules = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles: 10,
};

export function FileUpload({
    onFilesSelected,
    validation = DEFAULT_VALIDATION,
    multiple = false,
    className,
    accept = 'image/*',
}: FileUploadProps) {
    const [errors, setErrors] = useState<FileUploadError[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const validateFiles = useCallback(
        (files: FileList | null): { valid: File[]; invalid: FileUploadError[] } => {
            if (!files || files.length === 0) {
                return { valid: [], invalid: [] };
            }

            const valid: File[] = [];
            const invalid: FileUploadError[] = [];

            const rules = { ...DEFAULT_VALIDATION, ...validation };

            Array.from(files).forEach((file) => {
                // Check file size
                if (rules.maxSize && file.size > rules.maxSize) {
                    invalid.push({
                        file,
                        error: `Dosya boyutu ${formatFileSize(rules.maxSize)} limitini aşıyor (${formatFileSize(file.size)})`,
                    });
                    return;
                }

                // Check file format
                if (rules.allowedFormats && !rules.allowedFormats.includes(file.type)) {
                    invalid.push({
                        file,
                        error: `Desteklenmeyen dosya formatı: ${file.type}. İzin verilen: ${rules.allowedFormats.join(', ')}`,
                    });
                    return;
                }

                valid.push(file);
            });

            // Check max files
            if (rules.maxFiles && valid.length > rules.maxFiles) {
                const excess = valid.splice(rules.maxFiles);
                excess.forEach((file) => {
                    invalid.push({
                        file,
                        error: `Maksimum ${rules.maxFiles} dosya yükleyebilirsiniz`,
                    });
                });
            }

            return { valid, invalid };
        },
        [validation]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { valid, invalid } = validateFiles(e.target.files);

        setErrors(invalid);
        setSelectedFiles(valid);

        if (valid.length > 0) {
            onFilesSelected(valid);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* File Input */}
            <div className="relative">
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple={multiple}
                    accept={accept}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-surface/50 transition-all"
                >
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-textMuted"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-textMuted">
                            <span className="font-semibold text-primary">Dosya seçmek için tıklayın</span>
                            {multiple && ' veya birden fazla dosya seçin'}
                        </p>
                        <p className="text-xs text-textMuted mt-1">
                            {validation?.allowedFormats?.map(f => f.split('/')[1].toUpperCase()).join(', ') || 'Tüm formatlar'}
                            {validation?.maxSize && ` - Maks ${formatFileSize(validation.maxSize)}`}
                        </p>
                    </div>
                </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Seçilen Dosyalar ({selectedFiles.length})</h4>
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-textMuted">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="flex-shrink-0 ml-3 text-red-400 hover:text-red-300 transition-colors"
                                aria-label="Dosyayı kaldır"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-red-400">Hatalar ({errors.length})</h4>
                        <button
                            onClick={clearErrors}
                            className="text-xs text-textMuted hover:text-white transition-colors"
                        >
                            Temizle
                        </button>
                    </div>
                    {errors.map((error, index) => (
                        <div
                            key={index}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                            <div className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-400">{error.file.name}</p>
                                    <p className="text-xs text-red-300 mt-1">{error.error}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
