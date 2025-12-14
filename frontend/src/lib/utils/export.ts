/**
 * Export Utility Functions
 * Support for CSV and JSON export formats
 */

export interface ExportColumn {
    key: string;
    header: string;
    formatter?: (value: any, row: any) => string;
}

/**
 * Export data to CSV format and download
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    filename: string
): void {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Header row
    const header = columns.map(col => `"${col.header}"`).join(',');

    // Data rows
    const rows = data.map(row => {
        return columns.map(col => {
            let value = row[col.key];

            if (col.formatter) {
                value = col.formatter(value, row);
            } else if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            } else if (typeof value === 'boolean') {
                value = value ? 'Evet' : 'Hayır';
            }

            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    downloadBlob(blob, `${filename}-${getDateStamp()}.csv`);
}

/**
 * Export data to JSON format and download
 */
export function exportToJSON<T>(
    data: T[],
    filename: string
): void {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

    downloadBlob(blob, `${filename}-${getDateStamp()}.json`);
}

/**
 * Export data to Excel-compatible HTML format
 */
export function exportToExcel<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    filename: string,
    title?: string
): void {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    const header = columns.map(col => `<th style="background-color:#4a5568;color:white;padding:8px;border:1px solid #2d3748;">${col.header}</th>`).join('');

    const rows = data.map(row => {
        const cells = columns.map(col => {
            let value = row[col.key];

            if (col.formatter) {
                value = col.formatter(value, row);
            } else if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            } else if (typeof value === 'boolean') {
                value = value ? 'Evet' : 'Hayır';
            }

            return `<td style="padding:8px;border:1px solid #2d3748;">${escapeHtml(String(value))}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title || filename}</title>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ''}
      <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
        <thead>
          <tr>${header}</tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
      <p style="color:#718096;font-size:12px;margin-top:20px;">Exported on ${new Date().toLocaleString('tr-TR')}</p>
    </body>
    </html>
  `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    downloadBlob(blob, `${filename}-${getDateStamp()}.xls`);
}

// Helper functions

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getDateStamp(): string {
    return new Date().toISOString().split('T')[0];
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m] || m);
}

// Pre-configured export columns for common entities

export const UserExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'email', header: 'Email' },
    { key: 'isSuperAdmin', header: 'Super Admin' },
    { key: 'organizations', header: 'Organizasyon Sayısı', formatter: (v) => String(v?.length || 0) },
    { key: 'createdAt', header: 'Kayıt Tarihi', formatter: (v) => new Date(v).toLocaleDateString('tr-TR') },
];

export const OrganizationExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Organizasyon Adı' },
    { key: 'remainingCredits', header: 'Kredi' },
    { key: 'users', header: 'Kullanıcı Sayısı', formatter: (v) => String(v?.length || 0) },
    { key: 'products', header: 'Ürün Sayısı', formatter: (v) => String(v?.length || 0) },
    { key: 'createdAt', header: 'Oluşturma Tarihi', formatter: (v) => new Date(v).toLocaleDateString('tr-TR') },
];

export const ProductExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Ürün Adı' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Kategori', formatter: (v) => v?.name || '' },
    { key: 'organization', header: 'Organizasyon', formatter: (v) => v?.name || '' },
    { key: 'generatedImages', header: 'Görsel Sayısı', formatter: (v) => String(v?.length || 0) },
    { key: 'createdAt', header: 'Oluşturma Tarihi', formatter: (v) => new Date(v).toLocaleDateString('tr-TR') },
];

export const GenerationExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'product', header: 'Ürün', formatter: (v) => v?.name || '' },
    { key: 'status', header: 'Durum' },
    { key: 'tokensUsed', header: 'Kullanılan Kredi' },
    { key: 'provider', header: 'AI Sağlayıcı' },
    { key: 'createdAt', header: 'Tarih', formatter: (v) => new Date(v).toLocaleString('tr-TR') },
];

export const ModelExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Model Adı' },
    { key: 'gender', header: 'Cinsiyet' },
    { key: 'ethnicity', header: 'Etnik Köken' },
    { key: 'age', header: 'Yaş' },
    { key: 'organization', header: 'Organizasyon', formatter: (v) => v?.name || '' },
    { key: 'createdAt', header: 'Oluşturma Tarihi', formatter: (v) => new Date(v).toLocaleDateString('tr-TR') },
];

export const CreditTransactionExportColumns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'type', header: 'İşlem Türü' },
    { key: 'amount', header: 'Miktar' },
    { key: 'organization', header: 'Organizasyon', formatter: (v) => v?.name || '' },
    { key: 'note', header: 'Not' },
    { key: 'createdAt', header: 'Tarih', formatter: (v) => new Date(v).toLocaleString('tr-TR') },
];
