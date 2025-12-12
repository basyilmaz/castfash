"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface QuickStartStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    buttonText: string;
    completed: boolean;
}

export function QuickStartGuide() {
    const { isNewUser, resetOnboarding } = useOnboarding();
    const [steps, setSteps] = useState<QuickStartStep[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);  

        // Check completion status from localStorage
        const checkCompletion = () => {
            const productsData = localStorage.getItem("castfash_has_products");
            const modelsData = localStorage.getItem("castfash_has_models");
            const scenesData = localStorage.getItem("castfash_has_scenes");
            const generationsData = localStorage.getItem("castfash_has_generations");

            setSteps([
                {
                    id: "product",
                    title: "İlk Ürününüzü Ekleyin",
                    description: "Ürün görsellerini yükleyerek başlayın",
                    icon: "📦",
                    href: "/products/new",
                    buttonText: "Ürün Ekle",
                    completed: productsData === "true",
                },
                {
                    id: "model",
                    title: "Model Seçin",
                    description: "Ürünleriniz için bir model profili seçin",
                    icon: "👤",
                    href: "/model-profiles",
                    buttonText: "Modelleri Gör",
                    completed: modelsData === "true",
                },
                {
                    id: "scene",
                    title: "Sahne Oluşturun",
                    description: "Arka plan ve ortam ayarlarını yapın",
                    icon: "🎨",
                    href: "/scenes/new",
                    buttonText: "Sahne Oluştur",
                    completed: scenesData === "true",
                },
                {
                    id: "generate",
                    title: "İlk Görselinizi Üretin",
                    description: "AI ile profesyonel görselinizi oluşturun",
                    icon: "✨",
                    href: "/generations/new",
                    buttonText: "Üretim Başlat",
                    completed: generationsData === "true",
                },
            ]);
        };

        checkCompletion();
    }, []);

    const completedCount = steps.filter(s => s.completed).length;
    const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
    const allCompleted = completedCount === steps.length && steps.length > 0;

    if (!mounted) return null;

    // Don't show if all steps are completed
    if (allCompleted) return null;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h3 style={styles.title}>
                        🚀 Hızlı Başlangıç Rehberi
                    </h3>
                    <p style={styles.subtitle}>
                        {allCompleted
                            ? "Tebrikler! Tüm adımları tamamladınız."
                            : `${completedCount}/${steps.length} adım tamamlandı`
                        }
                    </p>
                </div>
                <div style={styles.headerRight}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={styles.expandButton}
                    >
                        {isExpanded ? "Gizle" : "Göster"}
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <div
                        style={{
                            ...styles.progressFill,
                            width: `${progress}%`,
                        }}
                    />
                </div>
                <span style={styles.progressText}>{Math.round(progress)}%</span>
            </div>

            {/* Steps */}
            {isExpanded && (
                <div style={styles.steps}>
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            style={{
                                ...styles.step,
                                opacity: step.completed ? 0.6 : 1,
                            }}
                        >
                            <div style={styles.stepNumber}>
                                {step.completed ? (
                                    <span style={styles.checkmark}>✓</span>
                                ) : (
                                    <span style={styles.number}>{index + 1}</span>
                                )}
                            </div>

                            <div style={styles.stepContent}>
                                <div style={styles.stepIcon}>{step.icon}</div>
                                <div style={styles.stepInfo}>
                                    <h4 style={{
                                        ...styles.stepTitle,
                                        textDecoration: step.completed ? "line-through" : "none",
                                    }}>
                                        {step.title}
                                    </h4>
                                    <p style={styles.stepDesc}>{step.description}</p>
                                </div>
                            </div>

                            <Link
                                href={step.href}
                                style={{
                                    ...styles.stepButton,
                                    opacity: step.completed ? 0.5 : 1,
                                    pointerEvents: step.completed ? "none" : "auto",
                                }}
                            >
                                {step.completed ? "Tamamlandı" : step.buttonText}
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            {isExpanded && (
                <div style={styles.footer}>
                    <button onClick={resetOnboarding} style={styles.tourButton}>
                        🎯 Tura tekrar başla
                    </button>
                    <Link href="/help" style={styles.helpLink}>
                        Yardım merkezine git →
                    </Link>
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: "rgba(20, 20, 30, 0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
    },
    headerLeft: {},
    headerRight: {},
    title: {
        fontSize: "18px",
        fontWeight: 600,
        color: "#fff",
        marginBottom: "4px",
        margin: 0,
    },
    subtitle: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        margin: 0,
    },
    expandButton: {
        padding: "6px 12px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "rgba(255,255,255,0.6)",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    progressContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
    },
    progressBar: {
        flex: 1,
        height: "6px",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: "3px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #a78bfa, #8b5cf6)",
        borderRadius: "3px",
        transition: "width 0.5s ease",
    },
    progressText: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#a78bfa",
        minWidth: "36px",
    },
    steps: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    step: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.2s ease",
    },
    stepNumber: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "rgba(167,139,250,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    checkmark: {
        color: "#22c55e",
        fontSize: "16px",
        fontWeight: 700,
    },
    number: {
        color: "#a78bfa",
        fontSize: "14px",
        fontWeight: 600,
    },
    stepContent: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flex: 1,
    },
    stepIcon: {
        fontSize: "24px",
    },
    stepInfo: {
        flex: 1,
    },
    stepTitle: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#fff",
        marginBottom: "2px",
        margin: 0,
    },
    stepDesc: {
        fontSize: "12px",
        color: "rgba(255,255,255,0.5)",
        margin: 0,
    },
    stepButton: {
        padding: "8px 16px",
        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap" as const,
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
    },
    tourButton: {
        padding: "8px 16px",
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "rgba(255,255,255,0.6)",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    helpLink: {
        fontSize: "12px",
        color: "#a78bfa",
        textDecoration: "none",
    },
};
