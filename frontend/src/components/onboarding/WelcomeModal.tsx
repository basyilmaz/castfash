"use client";

import React, { useEffect, useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export function WelcomeModal() {
    const { showWelcome, startOnboarding, skipOnboarding } = useOnboarding();
    const [mounted, setMounted] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setMounted(true);  
        if (showWelcome) {
            setTimeout(() => setAnimateIn(true), 100);
        }
    }, [showWelcome]);

    if (!mounted || !showWelcome) return null;

    return (
        <div style={styles.overlay}>
            <div
                style={{
                    ...styles.modal,
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                }}
            >
                {/* Decorative Elements */}
                <div style={styles.decorTop}></div>
                <div style={styles.confetti}>
                    {["🎉", "✨", "🚀", "💫", "🎊"].map((emoji, i) => (
                        <span
                            key={i}
                            style={{
                                ...styles.confettiItem,
                                left: `${10 + i * 20}%`,
                                animationDelay: `${i * 0.2}s`,
                            }}
                        >
                            {emoji}
                        </span>
                    ))}
                </div>

                {/* Logo */}
                <div style={styles.logoContainer}>
                    <span style={styles.logoIcon}>✨</span>
                    <span style={styles.logoText}>CastFash</span>
                </div>

                {/* Welcome Content */}
                <h1 style={styles.title}>Hoş Geldiniz! 👋</h1>
                <p style={styles.subtitle}>
                    AI destekli moda görsel üretim platformuna katıldığınız için teşekkürler.
                </p>

                {/* Features */}
                <div style={styles.features}>
                    <div style={styles.featureItem}>
                        <span style={styles.featureIcon}>📦</span>
                        <div>
                            <h4 style={styles.featureTitle}>Ürün Yükleyin</h4>
                            <p style={styles.featureDesc}>Ürün görsellerinizi platforma ekleyin</p>
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <span style={styles.featureIcon}>👤</span>
                        <div>
                            <h4 style={styles.featureTitle}>Model Seçin</h4>
                            <p style={styles.featureDesc}>AI modelleri ile eşleştirin</p>
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <span style={styles.featureIcon}>✨</span>
                        <div>
                            <h4 style={styles.featureTitle}>Görsel Üretin</h4>
                            <p style={styles.featureDesc}>Profesyonel görseller oluşturun</p>
                        </div>
                    </div>
                </div>

                {/* Free Credits */}
                <div style={styles.creditsBox}>
                    <span style={styles.creditsIcon}>🎁</span>
                    <div>
                        <p style={styles.creditsTitle}>10 Ücretsiz Görsel Kredisi</p>
                        <p style={styles.creditsDesc}>Başlangıç için size ücretsiz krediler hediye ettik!</p>
                    </div>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button onClick={startOnboarding} style={styles.primaryButton}>
                        <span>Tura Başla</span>
                        <span style={styles.buttonIcon}>→</span>
                    </button>
                    <button onClick={skipOnboarding} style={styles.secondaryButton}>
                        Turu Atla, Hemen Başla
                    </button>
                </div>

                {/* Footer */}
                <p style={styles.footerText}>
                    İstediğiniz zaman Ayarlar &gt; Yardım menüsünden turu tekrar başlatabilirsiniz.
                </p>
            </div>

            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
    },
    modal: {
        width: "100%",
        maxWidth: "520px",
        backgroundColor: "rgba(20, 20, 30, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "48px 40px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    decorTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)",
    },
    confetti: {
        position: "absolute",
        top: "20px",
        left: 0,
        right: 0,
        height: "60px",
        pointerEvents: "none",
    },
    confettiItem: {
        position: "absolute",
        fontSize: "24px",
        animation: "float 2s ease-in-out infinite",
    },
    logoContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "24px",
        marginTop: "12px",
    },
    logoIcon: {
        fontSize: "36px",
    },
    logoText: {
        fontSize: "28px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.5px",
    },
    title: {
        fontSize: "32px",
        fontWeight: 700,
        color: "#fff",
        textAlign: "center" as const,
        marginBottom: "12px",
    },
    subtitle: {
        fontSize: "16px",
        color: "rgba(255,255,255,0.6)",
        textAlign: "center" as const,
        lineHeight: 1.6,
        marginBottom: "32px",
    },
    features: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "24px",
    },
    featureItem: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 16px",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)",
    },
    featureIcon: {
        fontSize: "24px",
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(167,139,250,0.15)",
        borderRadius: "10px",
        flexShrink: 0,
    },
    featureTitle: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#fff",
        marginBottom: "2px",
        margin: 0,
    },
    featureDesc: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        margin: 0,
    },
    creditsBox: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.1) 100%)",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: "12px",
        marginBottom: "28px",
    },
    creditsIcon: {
        fontSize: "32px",
    },
    creditsTitle: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#22c55e",
        marginBottom: "4px",
        margin: 0,
    },
    creditsDesc: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
    },
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px",
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "16px 24px",
        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "14px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    buttonIcon: {
        fontSize: "18px",
        transition: "transform 0.2s ease",
    },
    secondaryButton: {
        padding: "14px 24px",
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "14px",
        color: "rgba(255,255,255,0.7)",
        fontSize: "15px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    footerText: {
        fontSize: "12px",
        color: "rgba(255,255,255,0.4)",
        textAlign: "center" as const,
        margin: 0,
    },
};
