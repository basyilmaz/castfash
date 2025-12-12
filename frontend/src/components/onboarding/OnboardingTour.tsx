"use client";

import React, { useEffect, useState, useRef } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "next/navigation";

export function OnboardingTour() {
    const router = useRouter();
    const {
        isOnboardingActive,
        currentStep,
        steps,
        nextStep,
        prevStep,
        skipOnboarding
    } = useOnboarding();

    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const [mounted, setMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);  
    }, []);

     
    useEffect(() => {
        if (!isOnboardingActive || !mounted) return;

        const step = steps[currentStep];
        if (!step?.target) {
            // Center the tooltip for steps without target
            setHighlightRect(null);
            setTooltipPosition({
                top: window.innerHeight / 2 - 150,
                left: window.innerWidth / 2 - 200,
            });
            return;
        }

        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            setHighlightRect(rect);

            // Calculate tooltip position
            const tooltipWidth = 380;
            const tooltipHeight = 200;
            const padding = 20;

            let top = rect.bottom + padding;
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

            // Adjust if tooltip goes off screen
            if (left < padding) left = padding;
            if (left + tooltipWidth > window.innerWidth - padding) {
                left = window.innerWidth - tooltipWidth - padding;
            }
            if (top + tooltipHeight > window.innerHeight - padding) {
                top = rect.top - tooltipHeight - padding;
            }

            setTooltipPosition({ top, left });

            // Scroll element into view if needed
            targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [isOnboardingActive, currentStep, steps, mounted]);

    const handleStepAction = () => {
        const step = steps[currentStep];

        // Navigate to relevant page based on step
        switch (step.id) {
            case "products":
                router.push("/products");
                break;
            case "models":
                router.push("/model-profiles");
                break;
            case "scenes":
                router.push("/scenes");
                break;
            case "generate":
                router.push("/generations/new");
                break;
        }

        nextStep();
    };

    if (!mounted || !isOnboardingActive) return null;

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <>
            {/* Overlay */}
            <div style={styles.overlay}>
                {/* Highlight cutout */}
                {highlightRect && (
                    <div
                        style={{
                            ...styles.highlight,
                            top: highlightRect.top - 8,
                            left: highlightRect.left - 8,
                            width: highlightRect.width + 16,
                            height: highlightRect.height + 16,
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                style={{
                    ...styles.tooltip,
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                }}
            >
                {/* Progress */}
                <div style={styles.progress}>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${((currentStep + 1) / steps.length) * 100}%`,
                            }}
                        />
                    </div>
                    <span style={styles.progressText}>
                        {currentStep + 1} / {steps.length}
                    </span>
                </div>

                {/* Content */}
                <h3 style={styles.title}>{step.title}</h3>
                <p style={styles.description}>{step.description}</p>

                {/* Actions */}
                <div style={styles.actions}>
                    <div style={styles.leftActions}>
                        {!isFirstStep && (
                            <button onClick={prevStep} style={styles.backButton}>
                                ← Geri
                            </button>
                        )}
                        <button onClick={skipOnboarding} style={styles.skipButton}>
                            Turu Atla
                        </button>
                    </div>

                    <button
                        onClick={isLastStep ? skipOnboarding : handleStepAction}
                        style={styles.nextButton}
                    >
                        {isLastStep ? "Başla! 🚀" : "Sonraki →"}
                    </button>
                </div>

                {/* Step indicators */}
                <div style={styles.dots}>
                    {steps.map((_, index) => (
                        <span
                            key={index}
                            style={{
                                ...styles.dot,
                                backgroundColor: index === currentStep
                                    ? "#a78bfa"
                                    : index < currentStep
                                        ? "rgba(167,139,250,0.5)"
                                        : "rgba(255,255,255,0.2)",
                            }}
                        />
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @keyframes pulseHighlight {
          0%, 100% { box-shadow: 0 0 0 4px rgba(167,139,250,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(167,139,250,0.1); }
        }
      `}</style>
        </>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        zIndex: 9998,
        pointerEvents: "none",
    },
    highlight: {
        position: "absolute",
        border: "2px solid #a78bfa",
        borderRadius: "12px",
        backgroundColor: "transparent",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.75), 0 0 20px rgba(167,139,250,0.5)",
        animation: "pulseHighlight 2s ease-in-out infinite",
        pointerEvents: "auto",
    },
    tooltip: {
        position: "fixed",
        width: "380px",
        backgroundColor: "rgba(30, 30, 45, 0.98)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "24px",
        zIndex: 9999,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    },
    progress: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
    },
    progressBar: {
        flex: 1,
        height: "4px",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: "2px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #a78bfa, #8b5cf6)",
        borderRadius: "2px",
        transition: "width 0.3s ease",
    },
    progressText: {
        fontSize: "12px",
        color: "rgba(255,255,255,0.5)",
        fontWeight: 500,
    },
    title: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#fff",
        marginBottom: "10px",
        margin: 0,
    },
    description: {
        fontSize: "14px",
        color: "rgba(255,255,255,0.7)",
        lineHeight: 1.6,
        marginBottom: "24px",
    },
    actions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    leftActions: {
        display: "flex",
        gap: "8px",
    },
    backButton: {
        padding: "10px 16px",
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        color: "rgba(255,255,255,0.7)",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    skipButton: {
        padding: "10px 16px",
        backgroundColor: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.5)",
        fontSize: "13px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    nextButton: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    dots: {
        display: "flex",
        justifyContent: "center",
        gap: "6px",
    },
    dot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        transition: "all 0.2s ease",
    },
};
