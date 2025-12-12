"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";

// =============================================================================
// Types
// =============================================================================

export interface ABTestVariation {
    id: string;
    imageUrl: string;
    prompt?: string;
    settings?: Record<string, unknown>;
    votes: number;
    rating: number;
    ratingCount: number;
    createdAt: Date;
}

export interface ABTestSession {
    id: string;
    name: string;
    productId: string;
    productName: string;
    variations: ABTestVariation[];
    status: "active" | "completed" | "cancelled";
    winner?: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface ABTestProps {
    variations: ABTestVariation[];
    onVote: (variationId: string) => void;
    onRate: (variationId: string, rating: number) => void;
    onSelectWinner: (variationId: string) => void;
    showRatings?: boolean;
    className?: string;
}

// =============================================================================
// Star Rating Component
// =============================================================================

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}

function StarRating({ rating, maxRating = 5, onChange, readonly = false, size = "md" }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClass = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = (hoverRating || rating) >= starValue;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => !readonly && onChange?.(starValue)}
                        onMouseEnter={() => !readonly && setHoverRating(starValue)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        className={cn(
                            sizeClass[size],
                            "transition-all",
                            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
                            isFilled ? "text-yellow-400" : "text-gray-600"
                        )}
                        disabled={readonly}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}

// =============================================================================
// Variation Card Component
// =============================================================================

interface VariationCardProps {
    variation: ABTestVariation;
    index: number;
    onVote: () => void;
    onRate: (rating: number) => void;
    onSelectWinner: () => void;
    isWinner?: boolean;
    showRatings?: boolean;
    totalVotes: number;
}

function VariationCard({
    variation,
    index,
    onVote,
    onRate,
    onSelectWinner,
    isWinner,
    showRatings = true,
    totalVotes,
}: VariationCardProps) {
    const votePercentage = totalVotes > 0 ? Math.round((variation.votes / totalVotes) * 100) : 0;
    const labels = ["A", "B", "C", "D", "E", "F"];

    return (
        <AppCard
            className={cn(
                "overflow-hidden transition-all",
                isWinner && "ring-2 ring-yellow-500 border-yellow-500/50"
            )}
        >
            {/* Image */}
            <div className="relative aspect-[3/4] bg-surface">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                    <span className="text-6xl opacity-50">🖼️</span>
                </div>
                {/* Variation Label */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-lg font-bold">
                    {labels[index]}
                </div>
                {/* Winner Badge */}
                {isWinner && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                        🏆 KAZANAN
                    </div>
                )}
            </div>

            {/* Stats & Actions */}
            <div className="p-4 space-y-4">
                {/* Vote Stats */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-textMuted">Oy</span>
                        <span className="font-medium">{variation.votes} ({votePercentage}%)</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${votePercentage}%` }}
                        />
                    </div>
                </div>

                {/* Rating */}
                {showRatings && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-textMuted">Puan</span>
                            <span className="text-sm text-textMuted">
                                ({variation.ratingCount} değerlendirme)
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <StarRating
                                rating={variation.rating}
                                readonly
                                size="sm"
                            />
                            <span className="font-medium">{variation.rating.toFixed(1)}</span>
                        </div>
                        <StarRating
                            rating={0}
                            onChange={onRate}
                            size="sm"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <AppButton
                        variant="secondary"
                        onClick={onVote}
                        className="flex-1 text-sm"
                    >
                        👍 Oy Ver
                    </AppButton>
                    <AppButton
                        onClick={onSelectWinner}
                        className="flex-1 text-sm"
                    >
                        🏆 Seç
                    </AppButton>
                </div>
            </div>
        </AppCard>
    );
}

// =============================================================================
// Comparison View (Side by Side)
// =============================================================================

interface ComparisonViewProps {
    variationA: ABTestVariation;
    variationB: ABTestVariation;
    onSelectWinner: (variationId: string) => void;
}

function ComparisonView({ variationA, variationB, onSelectWinner }: ComparisonViewProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Variation A */}
            <AppCard
                className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => onSelectWinner(variationA.id)}
            >
                <div className="aspect-[3/4] bg-gradient-to-br from-surface to-background rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-6xl">🖼️</span>
                </div>
                <div className="text-center">
                    <span className="text-2xl font-bold">A</span>
                    <p className="text-sm text-primary mt-1">Tıkla ve seç</p>
                </div>
            </AppCard>

            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-12 bg-surface border-2 border-primary rounded-full flex items-center justify-center text-lg font-bold">
                    VS
                </div>
            </div>

            {/* Variation B */}
            <AppCard
                className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => onSelectWinner(variationB.id)}
            >
                <div className="aspect-[3/4] bg-gradient-to-br from-surface to-background rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-6xl">🖼️</span>
                </div>
                <div className="text-center">
                    <span className="text-2xl font-bold">B</span>
                    <p className="text-sm text-primary mt-1">Tıkla ve seç</p>
                </div>
            </AppCard>
        </div>
    );
}

// =============================================================================
// Main AB Test Component
// =============================================================================

export function ABTest({
    variations,
    onVote,
    onRate,
    onSelectWinner,
    showRatings = true,
    className,
}: ABTestProps) {
    const [winner, setWinner] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");

    const totalVotes = variations.reduce((sum, v) => sum + v.votes, 0);

    const handleSelectWinner = useCallback((variationId: string) => {
        setWinner(variationId);
        onSelectWinner(variationId);
    }, [onSelectWinner]);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">🔬 A/B Test</h3>
                    <p className="text-sm text-textMuted">
                        {variations.length} varyasyon • {totalVotes} toplam oy
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm",
                            viewMode === "grid"
                                ? "bg-primary text-black"
                                : "bg-surface text-textMuted hover:text-white"
                        )}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode("compare")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm",
                            viewMode === "compare"
                                ? "bg-primary text-black"
                                : "bg-surface text-textMuted hover:text-white"
                        )}
                    >
                        Karşılaştır
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className={cn(
                    "grid gap-4",
                    variations.length === 2 && "grid-cols-2",
                    variations.length === 3 && "grid-cols-3",
                    variations.length >= 4 && "grid-cols-2 md:grid-cols-4"
                )}>
                    {variations.map((variation, index) => (
                        <VariationCard
                            key={variation.id}
                            variation={variation}
                            index={index}
                            onVote={() => onVote(variation.id)}
                            onRate={(rating) => onRate(variation.id, rating)}
                            onSelectWinner={() => handleSelectWinner(variation.id)}
                            isWinner={winner === variation.id}
                            showRatings={showRatings}
                            totalVotes={totalVotes}
                        />
                    ))}
                </div>
            )}

            {/* Compare View */}
            {viewMode === "compare" && variations.length >= 2 && (
                <div className="relative">
                    <ComparisonView
                        variationA={variations[0]}
                        variationB={variations[1]}
                        onSelectWinner={handleSelectWinner}
                    />
                </div>
            )}

            {/* Winner Selection */}
            {winner && (
                <AppCard className="p-4 bg-yellow-500/10 border-yellow-500/30">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <p className="font-medium">
                                Varyasyon {variations.findIndex((v) => v.id === winner) + 1} kazanan olarak seçildi
                            </p>
                            <p className="text-sm text-textMuted">
                                Bu seçimi onaylamak için üretim sayfasına gidin
                            </p>
                        </div>
                    </div>
                </AppCard>
            )}
        </div>
    );
}

// =============================================================================
// Hook for AB Test Management
// =============================================================================

export function useABTest(initialVariations: ABTestVariation[] = []) {
    const [variations, setVariations] = useState<ABTestVariation[]>(initialVariations);
    const [winner, setWinner] = useState<string | null>(null);

    const vote = useCallback((variationId: string) => {
        setVariations((prev) =>
            prev.map((v) =>
                v.id === variationId ? { ...v, votes: v.votes + 1 } : v
            )
        );
    }, []);

    const rate = useCallback((variationId: string, rating: number) => {
        setVariations((prev) =>
            prev.map((v) => {
                if (v.id !== variationId) return v;
                const newRatingCount = v.ratingCount + 1;
                const newRating = ((v.rating * v.ratingCount) + rating) / newRatingCount;
                return { ...v, rating: newRating, ratingCount: newRatingCount };
            })
        );
    }, []);

    const selectWinner = useCallback((variationId: string) => {
        setWinner(variationId);
    }, []);

    const reset = useCallback(() => {
        setVariations((prev) =>
            prev.map((v) => ({ ...v, votes: 0, rating: 0, ratingCount: 0 }))
        );
        setWinner(null);
    }, []);

    return {
        variations,
        winner,
        vote,
        rate,
        selectWinner,
        reset,
        totalVotes: variations.reduce((sum, v) => sum + v.votes, 0),
    };
}

export default ABTest;
