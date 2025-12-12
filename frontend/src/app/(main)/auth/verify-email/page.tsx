"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const verifyEmail = useCallback(async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "E-posta adresiniz doğrulandı");
                toast.success("E-posta adresiniz başarıyla doğrulandı!");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.message || "Doğrulama başarısız");
            }
        } catch {
            setStatus("error");
            setMessage("Bağlantı hatası");
        }
    }, [token, router]);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Geçersiz doğrulama bağlantısı");
            return;
        }

        verifyEmail();
    }, [token, verifyEmail]);

    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <div style={styles.iconContainer}>
                            <div style={styles.loadingSpinner}></div>
                        </div>
                        <h1 style={styles.title}>E-posta Doğrulanıyor</h1>
                        <p style={styles.description}>
                            E-posta adresiniz doğrulanıyor, lütfen bekleyin...
                        </p>
                        <div style={styles.loadingDots}>
                            <span style={styles.dot}></span>
                            <span style={{ ...styles.dot, animationDelay: "0.2s" }}></span>
                            <span style={{ ...styles.dot, animationDelay: "0.4s" }}></span>
                        </div>
                    </>
                );

            case "success":
                return (
                    <>
                        <div style={styles.iconContainer}>
                            <div style={styles.successIcon}>
                                <span style={styles.checkmark}>✓</span>
                            </div>
                            <div style={styles.successRing}></div>
                        </div>
                        <h1 style={{ ...styles.title, color: "#22c55e" }}>E-posta Doğrulandı!</h1>
                        <p style={styles.description}>{message}</p>
                        <div style={styles.successBox}>
                            <span style={styles.successBoxIcon}>🎉</span>
                            <div>
                                <p style={styles.successBoxTitle}>Harika!</p>
                                <p style={styles.successBoxText}>
                                    Artık CastFash'ın tüm özelliklerini kullanabilirsiniz.
                                </p>
                            </div>
                        </div>
                        <p style={styles.redirectText}>
                            Giriş sayfasına yönlendiriliyorsunuz...
                        </p>
                        <Link href="/auth/login" style={styles.primaryButton}>
                            Hemen Giriş Yap
                        </Link>
                    </>
                );

            case "error":
                return (
                    <>
                        <div style={styles.iconContainer}>
                            <div style={styles.errorIcon}>
                                <span style={styles.errorX}>✕</span>
                            </div>
                        </div>
                        <h1 style={{ ...styles.title, color: "#ef4444" }}>Doğrulama Başarısız</h1>
                        <p style={styles.description}>{message}</p>
                        <div style={styles.errorBox}>
                            <span style={styles.errorBoxIcon}>💡</span>
                            <div>
                                <p style={styles.errorBoxTitle}>Ne yapabilirsiniz?</p>
                                <p style={styles.errorBoxText}>
                                    Bağlantı süresi dolmuş olabilir. Yeni bir doğrulama e-postası isteyebilirsiniz.
                                </p>
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <Link href="/auth/resend-verification" style={styles.primaryButton}>
                                Yeni Doğrulama E-postası İste
                            </Link>
                            <Link href="/auth/login" style={styles.secondaryButton}>
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    </>
                );
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <Link href="/" style={styles.logo}>
                    <span style={styles.logoIcon}>✨</span>
                    <span style={styles.logoText}>CastFash</span>
                </Link>

                {renderContent()}
            </div>

            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.description}>Yükleniyor...</p>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
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
        maxWidth: "480px",
        backgroundColor: "rgba(20, 20, 30, 0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "48px 40px",
        backdropFilter: "blur(20px)",
        animation: "fadeIn 0.5s ease-out",
        textAlign: "center" as const,
    },
    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        textDecoration: "none",
        marginBottom: "40px",
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
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "28px",
        height: "90px",
    },
    loadingSpinner: {
        width: "60px",
        height: "60px",
        border: "3px solid rgba(167,139,250,0.2)",
        borderTopColor: "#a78bfa",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    title: {
        fontSize: "28px",
        fontWeight: 700,
        color: "#fff",
        marginBottom: "12px",
    },
    description: {
        fontSize: "15px",
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.6,
        marginBottom: "24px",
    },
    loadingDots: {
        display: "flex",
        justifyContent: "center",
        gap: "8px",
    },
    dot: {
        width: "8px",
        height: "8px",
        backgroundColor: "#a78bfa",
        borderRadius: "50%",
        animation: "bounce 0.6s ease-in-out infinite",
    },
    successIcon: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    checkmark: {
        fontSize: "32px",
        color: "#fff",
        fontWeight: 700,
    },
    successRing: {
        position: "absolute",
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        border: "2px solid rgba(34,197,94,0.3)",
        animation: "pulse 2s ease-in-out infinite",
    },
    successBox: {
        display: "flex",
        gap: "14px",
        textAlign: "left" as const,
        padding: "16px",
        backgroundColor: "rgba(34,197,94,0.1)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "12px",
        marginBottom: "24px",
    },
    successBoxIcon: {
        fontSize: "24px",
    },
    successBoxTitle: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#22c55e",
        marginBottom: "4px",
        margin: 0,
    },
    successBoxText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
        lineHeight: 1.5,
    },
    redirectText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        marginBottom: "20px",
    },
    errorIcon: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    errorX: {
        fontSize: "32px",
        color: "#fff",
        fontWeight: 700,
    },
    errorBox: {
        display: "flex",
        gap: "14px",
        textAlign: "left" as const,
        padding: "16px",
        backgroundColor: "rgba(251,191,36,0.1)",
        border: "1px solid rgba(251,191,36,0.2)",
        borderRadius: "12px",
        marginBottom: "24px",
    },
    errorBoxIcon: {
        fontSize: "24px",
    },
    errorBoxTitle: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#fbbf24",
        marginBottom: "4px",
        margin: 0,
    },
    errorBoxText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
        lineHeight: 1.5,
    },
    buttonGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 24px",
        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    secondaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 24px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 500,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
};
