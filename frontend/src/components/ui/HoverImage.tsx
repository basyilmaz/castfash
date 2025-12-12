import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface HoverImageProps {
    src: string;
    alt: string;
    className?: string;
}

export function HoverImage({ src, alt, className }: HoverImageProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Early return if src is empty, null or undefined
    if (!src) {
        return null;
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            <div
                className="relative group cursor-zoom-in"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                <img src={src} alt={alt} className={cn("transition-transform hover:scale-105", className)} />
            </div>

            {isHovered && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                    }}
                >
                    <div className="bg-black/90 p-2 rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm">
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-[600px] max-h-[600px] w-auto h-auto object-contain rounded-lg"
                        />
                        <div className="mt-2 text-center text-white text-xs font-medium bg-black/50 py-1 rounded">
                            {alt}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
