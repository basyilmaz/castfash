import { toast as sonnerToast } from 'sonner';

/**
 * Standardized toast notification system
 * Uses sonner under the hood with consistent styling
 */

export const toast = {
    /**
     * Show success message
     */
    success: (message: string, description?: string) => {
        sonnerToast.success(message, {
            description,
            duration: 4000,
            className: 'bg-green-500/20 border-green-500/30 text-green-400',
        });
    },

    /**
     * Show error message
     */
    error: (message: string, description?: string) => {
        sonnerToast.error(message, {
            description,
            duration: 5000,
            className: 'bg-red-500/20 border-red-500/30 text-red-400',
        });
    },

    /**
     * Show warning message
     */
    warning: (message: string, description?: string) => {
        sonnerToast.warning(message, {
            description,
            duration: 4500,
            className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        });
    },

    /**
     * Show info message
     */
    info: (message: string, description?: string) => {
        sonnerToast.info(message, {
            description,
            duration: 4000,
            className: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        });
    },

    /**
     * Show loading message with promise
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
            duration: 4000,
        });
    },

    /**
     * Show custom toast
     */
    custom: (message: string, options?: {
        duration?: number;
        icon?: React.ReactNode;
        action?: {
            label: string;
            onClick: () => void;
        };
    }) => {
        sonnerToast(message, {
            duration: options?.duration || 4000,
            icon: options?.icon,
            action: options?.action,
        });
    },

    /**
     * Dismiss a specific toast or all toasts
     */
    dismiss: (toastId?: string | number) => {
        sonnerToast.dismiss(toastId);
    },
};

/**
 * Common toast messages
 */
export const toastMessages = {
    // Success messages
    saved: () => toast.success('Kaydedildi', 'Değişiklikler başarıyla kaydedildi'),
    created: (item: string) => toast.success('Oluşturuldu', `${item} başarıyla oluşturuldu`),
    updated: (item: string) => toast.success('Güncellendi', `${item} başarıyla güncellendi`),
    deleted: (item: string) => toast.success('Silindi', `${item} başarıyla silindi`),
    uploaded: () => toast.success('Yüklendi', 'Dosya başarıyla yüklendi'),

    // Error messages
    saveFailed: () => toast.error('Kaydetme Başarısız', 'Değişiklikler kaydedilemedi'),
    loadFailed: () => toast.error('Yükleme Başarısız', 'Veriler yüklenemedi'),
    deleteFailed: () => toast.error('Silme Başarısız', 'İşlem gerçekleştirilemedi'),
    uploadFailed: () => toast.error('Yükleme Başarısız', 'Dosya yüklenemedi'),
    networkError: () => toast.error('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin'),
    unauthorized: () => toast.error('Yetki Hatası', 'Bu işlem için yetkiniz yok'),

    // Warning messages
    unsavedChanges: () => toast.warning('Kaydedilmemiş Değişiklikler', 'Değişiklikleriniz kaybolabilir'),
    lowCredits: () => toast.warning('Düşük Kredi', 'Krediniz azalıyor'),

    // Info messages
    processing: () => toast.info('İşleniyor', 'İşleminiz devam ediyor'),
    queued: () => toast.info('Sıraya Alındı', 'İşleminiz sırada'),
};
