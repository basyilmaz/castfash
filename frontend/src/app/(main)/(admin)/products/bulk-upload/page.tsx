"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppButton } from "@/components/ui/AppButton";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface ProductRow {
    id: string;
    name: string;
    description: string;
    category: string;
    sku: string;
    status: "valid" | "error" | "warning" | "pending";
    errors: string[];
    warnings: string[];
}

interface UploadStats {
    total: number;
    valid: number;
    errors: number;
    warnings: number;
}

// =============================================================================
// CSV Template
// =============================================================================

const CSV_TEMPLATE = `name,description,category,sku
"Örnek Bikini 1","Zarif tasarım, yaz koleksiyonu","Bikini","SKU-001"
"Örnek Bikini 2","Modern kesim","Bikini","SKU-002"
"Örnek Elbise 1","Plaj elbisesi","Elbise","SKU-003"`;

const SAMPLE_COLUMNS = ["name", "description", "category", "sku"];

// =============================================================================
// CSV Parser
// =============================================================================

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    const parseRow = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map(parseRow);

    return { headers, rows };
}

function validateRow(row: string[], headers: string[]): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const nameIdx = headers.indexOf("name");
    const skuIdx = headers.indexOf("sku");

    if (nameIdx >= 0 && (!row[nameIdx] || row[nameIdx].length < 2)) {
        errors.push("Ürün adı en az 2 karakter olmalıdır");
    }

    if (nameIdx >= 0 && row[nameIdx] && row[nameIdx].length > 100) {
        warnings.push("Ürün adı 100 karakterden uzun");
    }

    if (skuIdx >= 0 && !row[skuIdx]) {
        warnings.push("SKU kodu belirtilmemiş");
    }

    return { errors, warnings };
}

// =============================================================================
// File Dropzone Component
// =============================================================================

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    accepting?: string;
    className?: string;
}

function Dropzone({ onFileSelect, accepting = ".csv", className }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".csv")) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
                isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-border/80",
                className
            )}
        >
            <input
                type="file"
                accept={accepting}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
                <div className="text-5xl">📁</div>
                <div>
                    <p className="text-lg font-medium">
                        {isDragging ? "Dosyayı bırakın" : "CSV dosyasını sürükleyin veya tıklayın"}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        Desteklenen format: .csv
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Data Preview Table
// =============================================================================

interface PreviewTableProps {
    headers: string[];
    rows: ProductRow[];
    onRemoveRow: (id: string) => void;
}

function PreviewTable({ headers, rows, onRemoveRow }: PreviewTableProps) {
    if (rows.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="py-3 px-4 text-left text-sm font-medium text-textMuted">
                            Durum
                        </th>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="py-3 px-4 text-left text-sm font-medium text-textMuted"
                            >
                                {header}
                            </th>
                        ))}
                        <th className="py-3 px-4 text-left text-sm font-medium text-textMuted">
                            İşlem
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={row.id}
                            className={cn(
                                "border-b border-border/50 hover:bg-surface/50 transition-colors",
                                row.status === "error" && "bg-red-500/10",
                                row.status === "warning" && "bg-yellow-500/10"
                            )}
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    {row.status === "valid" && (
                                        <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm">
                                            ✓
                                        </span>
                                    )}
                                    {row.status === "error" && (
                                        <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-sm">
                                            ✕
                                        </span>
                                    )}
                                    {row.status === "warning" && (
                                        <span className="w-6 h-6 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-sm">
                                            !
                                        </span>
                                    )}
                                    {row.status === "pending" && (
                                        <span className="w-6 h-6 bg-gray-500/20 text-gray-400 rounded-full flex items-center justify-center text-sm">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4">{row.name}</td>
                            <td className="py-3 px-4 max-w-[200px] truncate">
                                {row.description}
                            </td>
                            <td className="py-3 px-4">{row.category}</td>
                            <td className="py-3 px-4 font-mono text-sm">{row.sku}</td>
                            <td className="py-3 px-4">
                                <button
                                    onClick={() => onRemoveRow(row.id)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Kaldır
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// =============================================================================
// Stats Cards
// =============================================================================

function StatsCards({ stats }: { stats: UploadStats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AppCard className="p-4 text-center">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-textMuted">Toplam</div>
            </AppCard>
            <AppCard className="p-4 text-center border-green-500/30">
                <div className="text-3xl font-bold text-green-400">{stats.valid}</div>
                <div className="text-sm text-textMuted">Geçerli</div>
            </AppCard>
            <AppCard className="p-4 text-center border-yellow-500/30">
                <div className="text-3xl font-bold text-yellow-400">{stats.warnings}</div>
                <div className="text-sm text-textMuted">Uyarı</div>
            </AppCard>
            <AppCard className="p-4 text-center border-red-500/30">
                <div className="text-3xl font-bold text-red-400">{stats.errors}</div>
                <div className="text-sm text-textMuted">Hata</div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export default function BulkUploadPage() {
    const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload");
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<ProductRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);

    // Calculate stats
    const stats = useMemo<UploadStats>(() => {
        return {
            total: rows.length,
            valid: rows.filter(r => r.status === "valid").length,
            warnings: rows.filter(r => r.status === "warning").length,
            errors: rows.filter(r => r.status === "error").length,
        };
    }, [rows]);

    // Handle file selection
    const handleFileSelect = useCallback(async (file: File) => {
        const content = await file.text();
        const { headers: csvHeaders, rows: csvRows } = parseCSV(content);

        const productRows: ProductRow[] = csvRows.map((row, index) => {
            const { errors, warnings } = validateRow(row, csvHeaders);

            const nameIdx = csvHeaders.indexOf("name");
            const descIdx = csvHeaders.indexOf("description");
            const catIdx = csvHeaders.indexOf("category");
            const skuIdx = csvHeaders.indexOf("sku");

            let status: ProductRow["status"] = "valid";
            if (errors.length > 0) status = "error";
            else if (warnings.length > 0) status = "warning";

            return {
                id: `row_${index}`,
                name: nameIdx >= 0 ? row[nameIdx] : "",
                description: descIdx >= 0 ? row[descIdx] : "",
                category: catIdx >= 0 ? row[catIdx] : "",
                sku: skuIdx >= 0 ? row[skuIdx] : "",
                status,
                errors,
                warnings,
            };
        });

        setHeaders(SAMPLE_COLUMNS);
        setRows(productRows);
        setStep("preview");
    }, []);

    // Remove row
    const handleRemoveRow = useCallback((id: string) => {
        setRows(prev => prev.filter(r => r.id !== id));
    }, []);

    // Download template
    const handleDownloadTemplate = useCallback(() => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "urun_sablonu.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    // Start import
    const handleStartImport = useCallback(async () => {
        const validRows = rows.filter(r => r.status !== "error");
        if (validRows.length === 0) return;

        setStep("importing");
        setImporting(true);

        // Simulate import process
        for (let i = 0; i < validRows.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
        }

        setImporting(false);
        setStep("complete");
    }, [rows]);

    // Reset
    const handleReset = useCallback(() => {
        setStep("upload");
        setHeaders([]);
        setRows([]);
        setImportProgress(0);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <SectionHeader
                title="📦 Toplu Ürün Yükleme"
                subtitle="CSV dosyası ile birden fazla ürün ekleyin"
            />

            {/* Upload Step */}
            {step === "upload" && (
                <div className="space-y-6">
                    <Dropzone onFileSelect={handleFileSelect} />

                    <AppCard className="p-6">
                        <h3 className="text-lg font-semibold mb-4">📋 CSV Formatı</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-textMuted">
                                CSV dosyanız aşağıdaki sütunları içermelidir:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SAMPLE_COLUMNS.map(col => (
                                    <span
                                        key={col}
                                        className="px-3 py-1 bg-surface rounded-lg text-sm font-mono"
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>
                            <AppButton
                                variant="secondary"
                                onClick={handleDownloadTemplate}
                                className="mt-4"
                            >
                                📥 Örnek Şablon İndir
                            </AppButton>
                        </div>
                    </AppCard>
                </div>
            )}

            {/* Preview Step */}
            {step === "preview" && (
                <div className="space-y-6">
                    <StatsCards stats={stats} />

                    <AppCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Önizleme</h3>
                            <div className="flex gap-3">
                                <AppButton variant="secondary" onClick={handleReset}>
                                    İptal
                                </AppButton>
                                <AppButton
                                    onClick={handleStartImport}
                                    disabled={stats.valid === 0}
                                >
                                    {stats.valid} Ürünü İçe Aktar
                                </AppButton>
                            </div>
                        </div>

                        <PreviewTable
                            headers={headers}
                            rows={rows}
                            onRemoveRow={handleRemoveRow}
                        />
                    </AppCard>
                </div>
            )}

            {/* Importing Step */}
            {step === "importing" && (
                <AppCard className="p-8 text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold mb-4">İçe Aktarılıyor...</h3>
                    <div className="w-full max-w-md mx-auto">
                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${importProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-textMuted mt-2">{importProgress}%</p>
                    </div>
                </AppCard>
            )}

            {/* Complete Step */}
            {step === "complete" && (
                <AppCard className="p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-semibold mb-2">Yükleme Tamamlandı!</h3>
                    <p className="text-textMuted mb-6">
                        {stats.valid} ürün başarıyla içe aktarıldı.
                    </p>
                    <div className="flex justify-center gap-4">
                        <AppButton variant="secondary" onClick={handleReset}>
                            Yeni Yükleme
                        </AppButton>
                        <AppButton onClick={() => window.location.href = "/products"}>
                            Ürünlere Git
                        </AppButton>
                    </div>
                </AppCard>
            )}
        </div>
    );
}
