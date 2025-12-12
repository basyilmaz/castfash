"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("E-posta adresi gereklidir");
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSent(true);
                toast.success(data.message || "Şifre sıfırlama bağlantısı gönderildi");
            } else {
                toast.error(data.message || "Bir hata oluştu");
            }
        } catch (error) {
            toast.error("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>
                        <span style={styles.successEmoji}>✉️</span>
                        <div style={styles.successRing}></div>
                    </div>

                    <h1 style={styles.successTitle}>E-postanızı Kontrol Edin</h1>

                    <p style={styles.successDescription}>
                        Şifre sıfırlama bağlantısı{" "}
                        <strong style={styles.emailHighlight}>{email}</strong>{" "}
                        adresine gönderildi.
                    </p>

                    <div style={styles.tipBox}>
                        <span style={styles.tipIcon}>💡</span>
                        <div>
                            <p style={styles.tipTitle}>E-posta gelmedi mi?</p>
                            <p style={styles.tipText}>
                                Spam/gereksiz klasörünüzü kontrol edin veya birkaç dakika bekleyin.
                            </p>
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button
                            onClick={() => setSent(false)}
                            style={styles.resendButton}
                        >
                            Tekrar Gönder
                        </button>
                        <Link href="/auth/login" style={styles.loginButtonLink}>
                            <button style={styles.loginButton}>
                                Giriş Sayfasına Dön
                            </button>
                        </Link>
                    </div>
                </div>

                <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <Link href="/" style={styles.logo}>
                    <span style={styles.logoIcon}>✨</span>
                    <span style={styles.logoText}>CastFash</span>
                </Link>

                <div style={styles.iconContainer}>
                    <span style={styles.lockIcon}>🔐</span>
                </div>

                <div style={styles.header}>
                    <h1 style={styles.title}>Şifrenizi Sıfırlayın</h1>
                    <p style={styles.subtitle}>
                        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-posta Adresi</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>📧</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@sirket.com"
                                style={styles.input}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <span style={styles.loadingWrapper}>
                                <span style={styles.spinner}></span>
                                Gönderiliyor...
                            </span>
                        ) : (
                            <>
                                <span>Sıfırlama Bağlantısı Gönder</span>
                                <span style={styles.buttonIcon}>→</span>
                            </>
                        )}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link href="/auth/login" style={styles.backLink}>
                        <span style={styles.backArrow}>←</span>
                        Giriş sayfasına dön
                    </Link>
                </div>

                <div style={styles.helpSection}>
                    <p style={styles.helpText}>
                        Yardıma mı ihtiyacınız var?{" "}
                        <Link href="/contact" style={styles.helpLink}>
                            Bize ulaşın
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0f",
        padding: "20px",
        background: "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 50%)",
    },
    card: {
        width: "100%",
        maxWidth: "440px",
        backgroundColor: "rgba(20, 20, 30, 0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "40px",
        backdropFilter: "blur(20px)",
        animation: "fadeIn 0.5s ease-out",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        textDecoration: "none",
        marginBottom: "32px",
    },
    logoIcon: {
        fontSize: "28px",
    },
    logoText: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.5px",
    },
    iconContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "24px",
    },
    lockIcon: {
        fontSize: "48px",
        animation: "float 3s ease-in-out infinite",
    },
    header: {
        textAlign: "center" as const,
        marginBottom: "32px",
    },
    title: {
        fontSize: "28px",
        fontWeight: 700,
        color: "#fff",
        marginBottom: "12px",
    },
    subtitle: {
        fontSize: "15px",
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.6,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: 500,
        color: "rgba(255,255,255,0.8)",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    inputIcon: {
        position: "absolute",
        left: "16px",
        fontSize: "16px",
        pointerEvents: "none",
    },
    input: {
        width: "100%",
        padding: "16px 16px 16px 48px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "14px",
        color: "#fff",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s ease",
    },
    submitButton: {
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
    },
    loadingWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    spinner: {
        width: "20px",
        height: "20px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    footer: {
        marginTop: "32px",
        textAlign: "center" as const,
    },
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "#a78bfa",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
        transition: "color 0.2s ease",
    },
    backArrow: {
        fontSize: "16px",
    },
    helpSection: {
        marginTop: "24px",
        paddingTop: "24px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center" as const,
    },
    helpText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        margin: 0,
    },
    helpLink: {
        color: "#a78bfa",
        textDecoration: "none",
        fontWeight: 500,
    },
    // Success state styles
    successIcon: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "24px",
        height: "80px",
    },
    successEmoji: {
        fontSize: "48px",
        zIndex: 1,
    },
    successRing: {
        position: "absolute",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(139,92,246,0.1))",
        animation: "pulse 2s ease-in-out infinite",
    },
    successTitle: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#fff",
        textAlign: "center" as const,
        marginBottom: "16px",
    },
    successDescription: {
        fontSize: "15px",
        color: "rgba(255,255,255,0.7)",
        textAlign: "center" as const,
        lineHeight: 1.6,
        marginBottom: "24px",
    },
    emailHighlight: {
        color: "#a78bfa",
    },
    tipBox: {
        display: "flex",
        gap: "14px",
        padding: "16px",
        backgroundColor: "rgba(251,191,36,0.1)",
        border: "1px solid rgba(251,191,36,0.2)",
        borderRadius: "12px",
        marginBottom: "24px",
    },
    tipIcon: {
        fontSize: "20px",
    },
    tipTitle: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#fbbf24",
        marginBottom: "4px",
        margin: 0,
    },
    tipText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
        lineHeight: 1.5,
    },
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    resendButton: {
        padding: "14px 24px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    loginButtonLink: {
        textDecoration: "none",
    },
    loginButton: {
        width: "100%",
        padding: "14px 24px",
        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
};
