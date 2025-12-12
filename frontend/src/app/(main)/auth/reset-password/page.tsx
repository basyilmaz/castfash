"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: "", color: "" };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;

        if (score <= 1) return { score: 1, label: "Zayıf", color: "#ef4444" };
        if (score <= 2) return { score: 2, label: "Orta", color: "#f97316" };
        if (score <= 3) return { score: 3, label: "İyi", color: "#eab308" };
        if (score <= 4) return { score: 4, label: "Güçlü", color: "#22c55e" };
        return { score: 5, label: "Çok Güçlü", color: "#10b981" };
    }, [password]);

    useEffect(() => {
        if (!token) {
            toast.error("Geçersiz şifre sıfırlama bağlantısı");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Tüm alanları doldurun");
            return;
        }

        if (password.length < 8) {
            toast.error("Şifre en az 8 karakter olmalıdır");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Şifreler eşleşmiyor");
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast.success(data.message || "Şifreniz başarıyla güncellendi");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } else {
                toast.error(data.message || "Şifre sıfırlama başarısız");
            }
        } catch (error) {
            toast.error("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <Link href="/" style={styles.logo}>
                        <span style={styles.logoIcon}>✨</span>
                        <span style={styles.logoText}>CastFash</span>
                    </Link>

                    <div style={styles.iconContainer}>
                        <div style={styles.errorIcon}>
                            <span style={styles.errorX}>✕</span>
                        </div>
                    </div>

                    <h1 style={{ ...styles.title, color: "#ef4444" }}>Geçersiz Bağlantı</h1>
                    <p style={styles.description}>
                        Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
                    </p>

                    <div style={styles.tipBox}>
                        <span style={styles.tipIcon}>💡</span>
                        <div>
                            <p style={styles.tipTitle}>Yeni bir bağlantı isteyin</p>
                            <p style={styles.tipText}>
                                Şifremi unuttum sayfasından yeni bir sıfırlama bağlantısı talep edebilirsiniz.
                            </p>
                        </div>
                    </div>

                    <Link href="/auth/forgot-password" style={styles.primaryButton}>
                        Yeni Bağlantı İste
                    </Link>
                </div>

                <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </div>
        );
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <Link href="/" style={styles.logo}>
                        <span style={styles.logoIcon}>✨</span>
                        <span style={styles.logoText}>CastFash</span>
                    </Link>

                    <div style={styles.iconContainer}>
                        <div style={styles.successIcon}>
                            <span style={styles.checkmark}>✓</span>
                        </div>
                        <div style={styles.successRing}></div>
                    </div>

                    <h1 style={{ ...styles.title, color: "#22c55e" }}>Şifre Güncellendi!</h1>
                    <p style={styles.description}>
                        Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
                    </p>

                    <div style={styles.successBox}>
                        <span style={styles.successBoxIcon}>🔐</span>
                        <div>
                            <p style={styles.successBoxTitle}>Güvenlik İpucu</p>
                            <p style={styles.successBoxText}>
                                Şifrenizi kimseyle paylaşmayın ve düzenli olarak güncelleyin.
                            </p>
                        </div>
                    </div>

                    <p style={styles.redirectText}>
                        Giriş sayfasına yönlendiriliyorsunuz...
                    </p>

                    <Link href="/auth/login" style={styles.primaryButton}>
                        Hemen Giriş Yap
                    </Link>
                </div>

                <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.2; }
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
                    <span style={styles.keyIcon}>🔑</span>
                </div>

                <div style={styles.header}>
                    <h1 style={styles.title}>Yeni Şifre Belirle</h1>
                    <p style={styles.subtitle}>
                        Hesabınız için güçlü ve güvenli bir şifre oluşturun.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Yeni Şifre</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="En az 8 karakter"
                                style={styles.input}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div style={styles.strengthContainer}>
                                <div style={styles.strengthBars}>
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            style={{
                                                ...styles.strengthBar,
                                                backgroundColor: level <= passwordStrength.score
                                                    ? passwordStrength.color
                                                    : "rgba(255,255,255,0.1)",
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Şifre Tekrar</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>🔒</span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Şifrenizi tekrar girin"
                                style={styles.input}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.passwordToggle}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p style={styles.matchError}>Şifreler eşleşmiyor</p>
                        )}
                        {confirmPassword && password === confirmPassword && password.length >= 8 && (
                            <p style={styles.matchSuccess}>✓ Şifreler eşleşiyor</p>
                        )}
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
                                Güncelleniyor...
                            </span>
                        ) : (
                            <>
                                <span>Şifreyi Güncelle</span>
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
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
        }
      `}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>Yükleniyor...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
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
        maxWidth: "440px",
        backgroundColor: "rgba(20, 20, 30, 0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "40px",
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
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "24px",
        height: "70px",
    },
    keyIcon: {
        fontSize: "48px",
        animation: "float 3s ease-in-out infinite",
    },
    header: {
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
    description: {
        fontSize: "15px",
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.6,
        marginBottom: "24px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        textAlign: "left" as const,
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
        padding: "16px 48px 16px 48px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "14px",
        color: "#fff",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s ease",
    },
    passwordToggle: {
        position: "absolute",
        right: "14px",
        background: "none",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
        padding: "4px",
    },
    strengthContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginTop: "8px",
    },
    strengthBars: {
        display: "flex",
        gap: "4px",
        flex: 1,
    },
    strengthBar: {
        height: "4px",
        flex: 1,
        borderRadius: "2px",
        transition: "background-color 0.2s ease",
    },
    strengthLabel: {
        fontSize: "12px",
        fontWeight: 500,
        minWidth: "70px",
        textAlign: "right" as const,
    },
    matchError: {
        fontSize: "12px",
        color: "#ef4444",
        marginTop: "4px",
        margin: 0,
    },
    matchSuccess: {
        fontSize: "12px",
        color: "#22c55e",
        marginTop: "4px",
        margin: 0,
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
        marginTop: "8px",
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
    loadingSpinner: {
        width: "50px",
        height: "50px",
        border: "3px solid rgba(167,139,250,0.2)",
        borderTopColor: "#a78bfa",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px",
    },
    footer: {
        marginTop: "32px",
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
    // Error/Success states
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
    tipBox: {
        display: "flex",
        gap: "14px",
        textAlign: "left" as const,
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
        marginBottom: "16px",
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
};
