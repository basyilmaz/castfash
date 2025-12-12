"use client";

import React, { useState, useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError" | "placeholder"> {
    /** Fallback image URL when main image fails to load */
    fallbackSrc?: string;
    /** Show blur placeholder while loading */
    showBlur?: boolean;
    /** Custom placeholder component */
    customPlaceholder?: React.ReactNode;
    /** Aspect ratio for the container (e.g., "16/9", "1/1", "4/3") */
    aspectRatio?: string;
    /** Custom loading skeleton color */
    skeletonColor?: string;
    /** Callback when image loads successfully */
    onLoadComplete?: () => void;
    /** Callback when image fails to load */
    onLoadError?: (error: Error) => void;
    /** Container className */
    containerClassName?: string;
    /** Show loading indicator */
    showLoadingIndicator?: boolean;
    /** Enable fade-in animation */
    fadeIn?: boolean;
    /** Fade-in animation duration in ms */
    fadeInDuration?: number;
}

// =============================================================================
// Skeleton Placeholder
// =============================================================================

function ImageSkeleton({
    className,
    color = "bg-surface",
}: {
    className?: string;
    color?: string;
}) {
    return (
        <div
            className={cn(
                "absolute inset-0 animate-pulse",
                color,
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
    );
}

// =============================================================================
// Loading Spinner
// =============================================================================

function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
    );
}

// =============================================================================
// LazyImage Component
// =============================================================================

export function LazyImage({
    src,
    alt,
    fallbackSrc = "/images/placeholder.png",
    showBlur = true,
    customPlaceholder,
    aspectRatio,
    skeletonColor,
    onLoadComplete,
    onLoadError,
    containerClassName,
    showLoadingIndicator = false,
    fadeIn = true,
    fadeInDuration = 300,
    className,
    style,
    ...props
}: LazyImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset state when src changes
    useEffect(() => {
        setCurrentSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoadComplete?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);

        if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setIsLoading(true);
            setHasError(false);
        } else {
            onLoadError?.(new Error(`Failed to load image: ${src}`));
        }
    };

    const containerStyles: React.CSSProperties = {
        ...(aspectRatio && { aspectRatio }),
    };

    const imageStyles: React.CSSProperties = {
        ...style,
        opacity: fadeIn && isLoading ? 0 : 1,
        transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                containerClassName
            )}
            style={containerStyles}
        >
            {/* Loading State */}
            {isLoading && (
                <>
                    {customPlaceholder || (
                        <ImageSkeleton color={skeletonColor} />
                    )}
                    {showLoadingIndicator && <LoadingSpinner />}
                </>
            )}

            {/* Error State */}
            {hasError && !currentSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface text-textMuted">
                    <span className="text-3xl mb-2">🖼️</span>
                    <span className="text-sm">Görsel yüklenemedi</span>
                </div>
            )}

            {/* Image */}
            <Image
                ref={imageRef}
                src={currentSrc}
                alt={alt}
                className={cn(
                    "object-cover",
                    className
                )}
                style={imageStyles}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}

// =============================================================================
// LazyImageGallery Component
// =============================================================================

export interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export interface LazyImageGalleryProps {
    images: GalleryImage[];
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: "sm" | "md" | "lg";
    aspectRatio?: string;
    onImageClick?: (image: GalleryImage, index: number) => void;
    className?: string;
}

export function LazyImageGallery({
    images,
    columns = 3,
    gap = "md",
    aspectRatio = "1/1",
    onImageClick,
    className,
}: LazyImageGalleryProps) {
    const gapClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };

    const columnClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    };

    return (
        <div
            className={cn(
                "grid",
                gapClasses[gap],
                columnClasses[columns],
                className
            )}
        >
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className={cn(
                        "relative rounded-lg overflow-hidden",
                        onImageClick && "cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    )}
                    onClick={() => onImageClick?.(image, index)}
                >
                    <LazyImage
                        src={image.src}
                        alt={image.alt}
                        width={image.width || 400}
                        height={image.height || 400}
                        aspectRatio={aspectRatio}
                        className="w-full h-full"
                        containerClassName="w-full h-full"
                    />
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// ProgressiveImage Component (Low quality to high quality)
// =============================================================================

export interface ProgressiveImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
    /** Low quality placeholder image URL */
    lowQualitySrc: string;
    /** Container className */
    containerClassName?: string;
    /** Transition duration between low and high quality */
    transitionDuration?: number;
}

export function ProgressiveImage({
    src,
    lowQualitySrc,
    alt,
    containerClassName,
    transitionDuration = 500,
    className,
    ...props
}: ProgressiveImageProps) {
    const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
    const [showHighQuality, setShowHighQuality] = useState(false);

    useEffect(() => {
        // Reset when src changes
        setIsHighQualityLoaded(false);
        setShowHighQuality(false);
    }, [src]);

    const handleHighQualityLoad = () => {
        setIsHighQualityLoaded(true);
        // Small delay before switching for smoother transition
        setTimeout(() => setShowHighQuality(true), 50);
    };

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {/* Low Quality Image (always visible during loading) */}
            <Image
                src={lowQualitySrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover",
                    showHighQuality && "blur-0",
                    !showHighQuality && "blur-sm",
                    className
                )}
                style={{
                    transition: `filter ${transitionDuration}ms ease-in-out`,
                }}
                {...props}
            />

            {/* High Quality Image (overlaid when loaded) */}
            <Image
                src={src}
                alt={alt}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    className
                )}
                style={{
                    opacity: showHighQuality ? 1 : 0,
                    transition: `opacity ${transitionDuration}ms ease-in-out`,
                }}
                onLoad={handleHighQualityLoad}
                {...props}
            />
        </div>
    );
}

// =============================================================================
// BlurHash Placeholder (Simulated)
// =============================================================================

export interface BlurPlaceholderProps {
    /** Blur hash string or base64 placeholder */
    blurHash?: string;
    /** Placeholder color */
    color?: string;
    className?: string;
}

export function BlurPlaceholder({
    blurHash,
    color = "#1e1b4b",
    className,
}: BlurPlaceholderProps) {
    if (blurHash) {
        return (
            <div
                className={cn("absolute inset-0", className)}
                style={{
                    backgroundImage: `url(${blurHash})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(20px)",
                    transform: "scale(1.1)",
                }}
            />
        );
    }

    return (
        <div
            className={cn("absolute inset-0 animate-pulse", className)}
            style={{ backgroundColor: color }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
    );
}

// =============================================================================
// Intersection Observer Hook for Lazy Loading
// =============================================================================

export function useImageLazyLoad(
    options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "100px",
                threshold: 0,
                ...options,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [options]);

    return [ref, isIntersecting];
}

// =============================================================================
// CSS for shimmer animation (add to global CSS)
// =============================================================================
/*
Add this to your global CSS file:

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
*/

export default LazyImage;
