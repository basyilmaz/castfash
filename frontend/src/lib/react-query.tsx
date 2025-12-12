"use client";

import React, { ReactNode } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
    useQueryClient,
    InvalidateQueryFilters,
} from "@tanstack/react-query";
import type { QueryKey, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

// =============================================================================
// Query Client Configuration
// =============================================================================

/**
 * Create a new QueryClient with optimized default settings
 */
function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data remains fresh for 1 minute
                staleTime: 60 * 1000,
                // Cache data for 5 minutes
                gcTime: 5 * 60 * 1000,
                // Retry failed requests 3 times
                retry: 3,
                // Delay between retries (exponential backoff)
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 30000),
                // Refetch on window focus for fresh data
                refetchOnWindowFocus: true,
                // Don't refetch on reconnect by default (user can override)
                refetchOnReconnect: true,
                // Don't refetch on mount by default if data is fresh
                refetchOnMount: true,
            },
            mutations: {
                // Retry mutations once
                retry: 1,
            },
        },
    });
}

// Singleton query client for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get the query client (create if not exists)
 * Ensures we only create one client per browser session
 */
function getQueryClient(): QueryClient {
    if (typeof window === "undefined") {
        // Server-side: always create a new client
        return createQueryClient();
    } else {
        // Client-side: reuse existing client or create new one
        if (!browserQueryClient) {
            browserQueryClient = createQueryClient();
        }
        return browserQueryClient;
    }
}

// =============================================================================
// Query Provider Component
// =============================================================================

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * React Query Provider wrapper for the application
 * Provides query client context to all child components
 */
export function QueryProvider({ children }: QueryProviderProps) {
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

// =============================================================================
// Query Keys Factory
// =============================================================================

/**
 * Centralized query keys for consistent cache management
 * Using a factory pattern for type-safe query keys
 */
export const queryKeys = {
    // Auth
    auth: {
        all: ["auth"] as const,
        user: () => [...queryKeys.auth.all, "user"] as const,
        session: () => [...queryKeys.auth.all, "session"] as const,
    },

    // Products
    products: {
        all: ["products"] as const,
        lists: () => [...queryKeys.products.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, "detail"] as const,
        detail: (id: string | number) =>
            [...queryKeys.products.details(), id] as const,
    },

    // Scenes
    scenes: {
        all: ["scenes"] as const,
        lists: () => [...queryKeys.scenes.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.scenes.lists(), filters] as const,
        details: () => [...queryKeys.scenes.all, "detail"] as const,
        detail: (id: string | number) =>
            [...queryKeys.scenes.details(), id] as const,
    },

    // Model Profiles
    modelProfiles: {
        all: ["modelProfiles"] as const,
        lists: () => [...queryKeys.modelProfiles.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.modelProfiles.lists(), filters] as const,
        details: () => [...queryKeys.modelProfiles.all, "detail"] as const,
        detail: (id: string | number) =>
            [...queryKeys.modelProfiles.details(), id] as const,
    },

    // Generations
    generations: {
        all: ["generations"] as const,
        lists: () => [...queryKeys.generations.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.generations.lists(), filters] as const,
        details: () => [...queryKeys.generations.all, "detail"] as const,
        detail: (id: string | number) =>
            [...queryKeys.generations.details(), id] as const,
    },

    // Stats
    stats: {
        all: ["stats"] as const,
        summary: () => [...queryKeys.stats.all, "summary"] as const,
        analytics: (days?: number) =>
            [...queryKeys.stats.all, "analytics", days] as const,
    },

    // Scene Packs
    scenePacks: {
        all: ["scenePacks"] as const,
        lists: () => [...queryKeys.scenePacks.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.scenePacks.lists(), filters] as const,
        details: () => [...queryKeys.scenePacks.all, "detail"] as const,
        detail: (id: string | number) =>
            [...queryKeys.scenePacks.details(), id] as const,
    },

    // Credits
    credits: {
        all: ["credits"] as const,
        balance: () => [...queryKeys.credits.all, "balance"] as const,
        transactions: () => [...queryKeys.credits.all, "transactions"] as const,
    },
} as const;

// =============================================================================
// Custom Hooks with Built-in Cache Management
// =============================================================================

/**
 * Options for cache-enabled queries
 */
interface CacheQueryOptions<TData, TError = Error>
    extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, "queryKey" | "queryFn"> {
    /** Time in milliseconds that data is considered fresh */
    staleTime?: number;
    /** Enable/disable background refetch on window focus */
    refetchOnFocus?: boolean;
}

/**
 * Hook for creating a cached query
 * Provides consistent caching behavior across the app
 */
export function useCachedQuery<TData, TError = Error>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: CacheQueryOptions<TData, TError>
) {
    const { staleTime, refetchOnFocus, ...restOptions } = options || {};

    return useQuery<TData, TError>({
        queryKey,
        queryFn,
        staleTime: staleTime ?? 60 * 1000, // 1 minute default
        refetchOnWindowFocus: refetchOnFocus ?? false,
        ...restOptions,
    });
}

/**
 * Options for optimistic mutations
 */
interface OptimisticMutationOptions<TData, TError, TVariables, TContext>
    extends Omit<
        UseMutationOptions<TData, TError, TVariables, TContext>,
        "onMutate" | "onError" | "onSettled"
    > {
    /** Query keys to invalidate on success */
    invalidateKeys?: QueryKey[];
    /** Enable optimistic updates */
    optimistic?: boolean;
    /** Function to update cache optimistically */
    optimisticUpdate?: (variables: TVariables) => void;
    /** Success callback */
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
    /** Error callback */
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
}

/**
 * Hook for creating mutations with cache invalidation
 * Supports optimistic updates and automatic cache invalidation
 */
export function useCachedMutation<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown
>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: OptimisticMutationOptions<TData, TError, TVariables, TContext>
) {
    const queryClient = useQueryClient();
    const { invalidateKeys, optimistic, optimisticUpdate, onSuccess, onError, ...restOptions } =
        options || {};

    return useMutation<TData, TError, TVariables, TContext>({
        mutationFn,
        onMutate: async (variables) => {
            if (optimistic && optimisticUpdate) {
                // Cancel any outgoing refetches
                if (invalidateKeys) {
                    await Promise.all(
                        invalidateKeys.map((key) =>
                            queryClient.cancelQueries({ queryKey: key })
                        )
                    );
                }
                // Apply optimistic update
                optimisticUpdate(variables);
            }
            return undefined as TContext;
        },
        onError: (error, variables, context) => {
            // Revert optimistic update on error by invalidating
            if (optimistic && invalidateKeys) {
                invalidateKeys.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            onError?.(error, variables, context);
        },
        onSuccess: (data, variables, context) => {
            // Invalidate related queries
            if (invalidateKeys) {
                invalidateKeys.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            onSuccess?.(data, variables, context);
        },
        ...restOptions,
    });
}

// =============================================================================
// Cache Utilities
// =============================================================================

/**
 * Hook for manual cache management
 */
export function useCacheUtils() {
    const queryClient = useQueryClient();

    /**
     * Invalidate queries by key
     * Forces a refetch of the data
     */
    const invalidate = (queryKey: QueryKey, filters?: InvalidateQueryFilters) => {
        return queryClient.invalidateQueries({ queryKey, ...filters });
    };

    /**
     * Prefetch data into cache
     * Useful for preloading data before navigation
     */
    function prefetch<TData>(queryKey: QueryKey, queryFn: () => Promise<TData>) {
        return queryClient.prefetchQuery({
            queryKey,
            queryFn,
        });
    }

    /**
     * Get cached data without triggering a fetch
     */
    function getCache<TData>(queryKey: QueryKey): TData | undefined {
        return queryClient.getQueryData<TData>(queryKey);
    }

    /**
     * Set cached data manually
     */
    function setCache<TData>(queryKey: QueryKey, data: TData) {
        return queryClient.setQueryData(queryKey, data);
    }

    /**
     * Update cached data with a function
     */
    function updateCache<TData>(
        queryKey: QueryKey,
        updater: (oldData: TData | undefined) => TData
    ) {
        return queryClient.setQueryData(queryKey, updater);
    }

    /**
     * Remove data from cache
     */
    const removeCache = (queryKey: QueryKey) => {
        return queryClient.removeQueries({ queryKey });
    };

    /**
     * Clear all cached data
     */
    const clearAll = () => {
        return queryClient.clear();
    };

    /**
     * Check if a query is currently fetching
     */
    const isFetching = (queryKey: QueryKey): boolean => {
        return queryClient.isFetching({ queryKey }) > 0;
    };

    return {
        invalidate,
        prefetch,
        getCache,
        setCache,
        updateCache,
        removeCache,
        clearAll,
        isFetching,
    };
}

// =============================================================================
// Stale-While-Revalidate Pattern
// =============================================================================

/**
 * Hook implementing stale-while-revalidate pattern
 * Returns cached data immediately while fetching fresh data in background
 */
export function useStaleWhileRevalidate<TData, TError = Error>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: {
        /** How long data is considered fresh (default: 0, always revalidate) */
        staleTime?: number;
        /** How long to keep data in cache (default: 5 minutes) */
        cacheTime?: number;
    }
) {
    const { staleTime = 0, cacheTime = 5 * 60 * 1000 } = options || {};

    return useQuery<TData, TError>({
        queryKey,
        queryFn,
        staleTime,
        gcTime: cacheTime,
        // Always return cached data first
        placeholderData: (previousData) => previousData,
    });
}

// =============================================================================
// Exports
// =============================================================================

export { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export type { QueryKey, UseQueryOptions, UseMutationOptions };
