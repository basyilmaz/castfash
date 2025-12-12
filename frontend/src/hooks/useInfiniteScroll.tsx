'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// =====================================
// TYPES
// =====================================

export interface UseInfiniteScrollOptions {
    /** Yükleme fonksiyonu - sonraki sayfayı yükler */
    loadMore: () => Promise<void> | void;
    /** Daha fazla veri var mı? */
    hasMore: boolean;
    /** Şu anda yükleniyor mu? */
    isLoading?: boolean;
    /** Trigger elementi görünür olmadan kaç piksel önce yükle */
    threshold?: number;
    /** Root element (default: viewport) */
    root?: Element | null;
    /** Root margin */
    rootMargin?: string;
    /** Scroll yönü */
    direction?: 'down' | 'up';
    /** Debounce süresi (ms) */
    debounceMs?: number;
}

export interface UseInfiniteScrollReturn {
    /** Trigger element'e atanacak ref */
    triggerRef: React.RefObject<HTMLDivElement>;
    /** Manuel olarak daha fazla yükle */
    loadMoreManually: () => void;
    /** Şu anda yükleniyor mu? */
    isLoading: boolean;
    /** Liste sonu mu? */
    isEndReached: boolean;
}

// =====================================
// DEBOUNCE HELPER
// =====================================

function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// =====================================
// USE INFINITE SCROLL HOOK
// =====================================

export function useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading: externalLoading = false,
    threshold = 100,
    root = null,
    rootMargin = '0px',
    debounceMs = 100,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [internalLoading, setInternalLoading] = useState(false);
    const loadMoreRef = useRef(loadMore);

    // loadMore fonksiyonunu güncel tut
    useEffect(() => {
        loadMoreRef.current = loadMore;
    }, [loadMore]);

    const isLoading = externalLoading || internalLoading;
    const isEndReached = !hasMore && !isLoading;

    // Debounced load more
    const debouncedLoadMore = useCallback(
        debounce(async () => {
            if (hasMore && !isLoading) {
                setInternalLoading(true);
                try {
                    await loadMoreRef.current();
                } finally {
                    setInternalLoading(false);
                }
            }
        }, debounceMs),
        [hasMore, isLoading, debounceMs]
    );

    // Manuel yükleme
    const loadMoreManually = useCallback(async () => {
        if (hasMore && !isLoading) {
            setInternalLoading(true);
            try {
                await loadMoreRef.current();
            } finally {
                setInternalLoading(false);
            }
        }
    }, [hasMore, isLoading]);

    // Intersection Observer
    useEffect(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !isLoading) {
                    debouncedLoadMore();
                }
            },
            {
                root,
                rootMargin: `${threshold}px`,
                threshold: 0,
            }
        );

        observer.observe(trigger);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoading, threshold, root, rootMargin, debouncedLoadMore]);

    return {
        triggerRef: triggerRef as React.RefObject<HTMLDivElement>,
        loadMoreManually,
        isLoading,
        isEndReached,
    };
}

// =====================================
// USE INFINITE SCROLL WITH PAGINATION
// =====================================

export interface UsePaginatedInfiniteScrollOptions<T> {
    /** Veri çekme fonksiyonu */
    fetchData: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
    /** Sayfa başına öğe sayısı */
    pageSize?: number;
    /** Başlangıç verisi */
    initialData?: T[];
    /** Başlangıç sayfası */
    initialPage?: number;
}

export interface UsePaginatedInfiniteScrollReturn<T> {
    /** Yüklenen veriler */
    data: T[];
    /** Trigger element ref */
    triggerRef: React.RefObject<HTMLDivElement>;
    /** Yükleniyor mu? */
    isLoading: boolean;
    /** İlk yükleme mi? */
    isInitialLoading: boolean;
    /** Hata */
    error: Error | null;
    /** Daha fazla veri var mı? */
    hasMore: boolean;
    /** Manuel yeniden yükle */
    refresh: () => Promise<void>;
    /** Mevcut sayfa */
    currentPage: number;
    /** Toplam öğe sayısı */
    totalItems: number;
}

export function usePaginatedInfiniteScroll<T>({
    fetchData,
    pageSize = 20,
    initialData = [],
    initialPage = 1,
}: UsePaginatedInfiniteScrollOptions<T>): UsePaginatedInfiniteScrollReturn<T> {
    const [data, setData] = useState<T[]>(initialData);
    const [page, setPage] = useState(initialPage);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const hasMore = data.length < total;

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchData(page + 1, pageSize);
            setData(prev => [...prev, ...result.data]);
            setTotal(result.total);
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, page, pageSize, isLoading, hasMore]);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setIsInitialLoading(true);
        setError(null);

        try {
            const result = await fetchData(1, pageSize);
            setData(result.data);
            setTotal(result.total);
            setPage(1);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
            setIsInitialLoading(false);
        }
    }, [fetchData, pageSize]);

    // İlk yükleme
    useEffect(() => {
        if (initialData.length === 0) {
            refresh();
        } else {
            setIsInitialLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { triggerRef } = useInfiniteScroll({
        loadMore,
        hasMore,
        isLoading,
    });

    return {
        data,
        triggerRef,
        isLoading,
        isInitialLoading,
        error,
        hasMore,
        refresh,
        currentPage: page,
        totalItems: total,
    };
}

// =====================================
// INFINITE SCROLL COMPONENTS
// =====================================

interface InfiniteScrollTriggerProps {
    triggerRef: React.RefObject<HTMLDivElement>;
    isLoading: boolean;
    hasMore: boolean;
    loadingText?: string;
    endText?: string;
    className?: string;
}

export function InfiniteScrollTrigger({
    triggerRef,
    isLoading,
    hasMore,
    loadingText = 'Yükleniyor...',
    endText = 'Tüm içerik yüklendi',
    className,
}: InfiniteScrollTriggerProps) {
    return (
        <div
            ref={triggerRef}
            className={`flex items-center justify-center py-8 ${className || ''}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-3 text-textMuted">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span className="text-sm">{loadingText}</span>
                </div>
            ) : !hasMore ? (
                <div className="flex items-center gap-2 text-textMuted">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span className="text-sm">{endText}</span>
                </div>
            ) : null}
        </div>
    );
}

// Load More Button (alternative to auto-load)
interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading: boolean;
    hasMore: boolean;
    loadingText?: string;
    buttonText?: string;
    endText?: string;
    className?: string;
}

export function LoadMoreButton({
    onClick,
    isLoading,
    hasMore,
    loadingText = 'Yükleniyor...',
    buttonText = 'Daha Fazla Yükle',
    endText = 'Tüm içerik yüklendi',
    className,
}: LoadMoreButtonProps) {
    if (!hasMore && !isLoading) {
        return (
            <div className={`flex items-center justify-center py-8 ${className || ''}`}>
                <div className="flex items-center gap-2 text-textMuted">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{endText}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center py-8 ${className || ''}`}>
            <button
                onClick={onClick}
                disabled={isLoading}
                className="px-6 py-2.5 bg-surface border border-border text-white rounded-xl hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {loadingText}
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {buttonText}
                    </>
                )}
            </button>
        </div>
    );
}
