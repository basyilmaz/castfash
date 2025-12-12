"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/types";
import { listProducts } from "@/lib/api/products";
import { AppCard } from "../ui/AppCard";
import { AppSelect } from "../ui/AppSelect";
import { AppButton } from "../ui/AppButton";

type Props = {
    sceneUrl: string;
};

export function MagicMirror({ sceneUrl }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listProducts().then(setProducts).catch(console.error);
    }, []);

    const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPosition({ x, y });
    };

    // Global mouse up to catch drops outside the element
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isDragging]);

    return (
        <AppCard className="p-0 overflow-hidden border-2 border-purple-500/30">
            <div className="p-4 border-b border-border bg-surfaceAlt/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <span className="text-2xl">✨</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Magic Mirror</h3>
                        <p className="text-xs text-textMuted">Ürününüzü bu sahnede test edin (AI harcamaz)</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <AppSelect
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="min-w-[200px]"
                    >
                        <option value="">Bir ürün seçin...</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </AppSelect>

                    {selectedProduct && (
                        <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
                            <span className="text-xs text-textMuted px-2">Boyut</span>
                            <input
                                type="range"
                                min="0.2"
                                max="2"
                                step="0.1"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-24 accent-purple-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black overflow-hidden cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
            >
                {/* Scene Background */}
                <img
                    src={sceneUrl}
                    alt="Scene Background"
                    className="w-full h-full object-cover pointer-events-none select-none"
                />

                {/* Product Overlay */}
                {selectedProduct ? (
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            transform: `translate(-50%, -50%) scale(${scale})`,
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                        className="origin-center transition-transform duration-75"
                    >
                        <img
                            src={selectedProduct.productImageUrl}
                            alt="Product"
                            className="max-h-[300px] object-contain drop-shadow-2xl filter hover:brightness-110 transition-all"
                            draggable={false}
                        />
                        {/* Helper border on hover */}
                        <div className="absolute inset-0 border-2 border-purple-500/0 hover:border-purple-500/50 rounded-lg transition-colors pointer-events-none" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <div className="text-center p-6 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10">
                            <p className="text-white font-medium">Önizleme için yukarıdan bir ürün seçin</p>
                            <p className="text-sm text-textMuted mt-1">Ürünü sahnede konumlandırmak için sürükleyin</p>
                        </div>
                    </div>
                )}
            </div>
        </AppCard>
    );
}
