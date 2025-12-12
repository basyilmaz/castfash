'use client';

import { cn } from '@/lib/utils';

// Base Skeleton component
interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave' | 'none';
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export function Skeleton({
    className,
    variant = 'default',
    animation = 'pulse',
    width,
    height,
    style,
    children,
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'bg-surface/80 relative',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded-none',
                variant === 'default' && 'rounded-md',
                animation === 'pulse' && 'animate-pulse',
                animation === 'wave' && 'skeleton-wave',
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// Text skeleton
interface SkeletonTextProps {
    lines?: number;
    className?: string;
    lineClassName?: string;
    lastLineWidth?: string;
}

export function SkeletonText({
    lines = 3,
    className,
    lineClassName,
    lastLineWidth = '60%',
}: SkeletonTextProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn('h-4', lineClassName)}
                    style={{
                        width: index === lines - 1 ? lastLineWidth : '100%',
                    }}
                />
            ))}
        </div>
    );
}

// Avatar skeleton
interface SkeletonAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    return <Skeleton variant="circular" className={cn(sizeClasses[size], className)} />;
}

// Button skeleton
interface SkeletonButtonProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function SkeletonButton({ size = 'md', className }: SkeletonButtonProps) {
    const sizeClasses = {
        sm: 'h-8 w-20',
        md: 'h-10 w-28',
        lg: 'h-12 w-32',
    };

    return <Skeleton className={cn(sizeClasses[size], 'rounded-lg', className)} />;
}

// Image skeleton
interface SkeletonImageProps {
    aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
    className?: string;
}

export function SkeletonImage({ aspectRatio = 'square', className }: SkeletonImageProps) {
    const aspectClasses = {
        square: 'aspect-square',
        '16/9': 'aspect-video',
        '4/3': 'aspect-[4/3]',
        '3/2': 'aspect-[3/2]',
        auto: '',
    };

    return (
        <Skeleton
            className={cn('w-full', aspectClasses[aspectRatio], className)}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <svg
                    className="h-10 w-10 text-textMuted/20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </Skeleton>
    );
}

// Card skeleton
interface SkeletonCardProps {
    showImage?: boolean;
    showAvatar?: boolean;
    lines?: number;
    className?: string;
}

export function SkeletonCard({
    showImage = true,
    showAvatar = false,
    lines = 2,
    className,
}: SkeletonCardProps) {
    return (
        <div className={cn('p-4 bg-surface rounded-xl border border-border', className)}>
            {showImage && (
                <Skeleton className="w-full aspect-video rounded-lg mb-4" />
            )}
            <div className="space-y-3">
                {showAvatar && (
                    <div className="flex items-center gap-3">
                        <SkeletonAvatar size="md" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                )}
                <Skeleton className="h-5 w-3/4" />
                <SkeletonText lines={lines} />
            </div>
        </div>
    );
}

// =====================================
// SPECIFIC SKELETONS FOR THE APPLICATION
// =====================================

// Product list skeleton
export function ProductListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="p-4 bg-surface rounded-xl border border-border animate-pulse"
                >
                    {/* Image */}
                    <Skeleton className="w-full aspect-square rounded-lg mb-4" />

                    {/* Title */}
                    <Skeleton className="h-5 w-3/4 mb-2" />

                    {/* Description */}
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Model list skeleton
export function ModelListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="p-4 bg-surface rounded-xl border border-border animate-pulse"
                >
                    <div className="flex items-start gap-4">
                        {/* Avatar/Icon */}
                        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />

                            {/* Stats */}
                            <div className="flex items-center gap-4 pt-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Generation list skeleton
export function GenerationListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-surface rounded-lg border border-border overflow-hidden animate-pulse"
                >
                    {/* Image */}
                    <Skeleton className="w-full aspect-square" />

                    {/* Footer */}
                    <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="p-4 bg-surface rounded-xl border border-border"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="p-4 bg-surface rounded-xl border border-border">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>

                {/* Chart 2 */}
                <div className="p-4 bg-surface rounded-xl border border-border">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>

            {/* Recent Items */}
            <div className="p-4 bg-surface rounded-xl border border-border">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border bg-surface/50">
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={index} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 p-4 border-b border-border last:border-b-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            className={cn(
                                'h-4 flex-1',
                                colIndex === 0 && 'max-w-[200px]',
                                colIndex === columns - 1 && 'max-w-[100px]'
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
    return (
        <div className="space-y-6 animate-pulse">
            {Array.from({ length: fields }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
            ))}

            <div className="flex items-center gap-3 pt-4">
                <SkeletonButton size="lg" />
                <SkeletonButton size="md" />
            </div>
        </div>
    );
}

// Scene pack skeleton
export function ScenePackSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse"
                >
                    {/* Cover Image */}
                    <Skeleton className="w-full aspect-video" />

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />

                        {/* Tags */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-14 rounded-full" />
                            <Skeleton className="h-6 w-18 rounded-full" />
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// CSS for wave animation (add to global CSS if needed)
// .skeleton-wave {
//   position: relative;
//   overflow: hidden;
// }
// .skeleton-wave::after {
//   content: '';
//   position: absolute;
//   inset: 0;
//   transform: translateX(-100%);
//   background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
//   animation: wave 1.5s infinite;
// }
// @keyframes wave {
//   100% { transform: translateX(100%); }
// }
