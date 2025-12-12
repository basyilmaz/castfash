"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/api/auth";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { password } = formData;
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
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.organizationName) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (formData.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }

    if (!agreeTerms) {
      setError("Kullanım koşullarını kabul etmelisiniz");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    // TODO: Implement social registration with OAuth
    toast.info(`${provider} ile kayıt yakında aktif olacak!`);
  };

  return (
    <div style={styles.container}>
      {/* Left Side - Branding */}
      <div style={styles.leftSide}>
        <div style={styles.brandContent}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoIcon}>✨</span>
            <span style={styles.logoText}>CastFash</span>
          </Link>

          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Moda Görsellerinizi
              <br />
              <span style={styles.heroGradient}>AI ile Dönüştürün</span>
            </h1>
            <p style={styles.heroDescription}>
              Binlerce e-ticaret markasının tercih ettiği AI destekli görsel üretim platformuna katılın.
            </p>
          </div>

          <div style={styles.features}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🚀</div>
              <div>
                <h4 style={styles.featureTitle}>Hızlı Başlangıç</h4>
                <p style={styles.featureDesc}>Dakikalar içinde profesyonel görseller</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>💎</div>
              <div>
                <h4 style={styles.featureTitle}>Ücretsiz Deneme</h4>
                <p style={styles.featureDesc}>10 ücretsiz görsel kredisi ile başlayın</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🎨</div>
              <div>
                <h4 style={styles.featureTitle}>Profesyonel Kalite</h4>
                <p style={styles.featureDesc}>Stüdyo kalitesinde AI görselleri</p>
              </div>
            </div>
          </div>

          <div style={styles.trustBadges}>
            <span style={styles.badge}>🔒 256-bit SSL</span>
            <span style={styles.badge}>⚡ 99.9% Uptime</span>
            <span style={styles.badge}>🌍 GDPR Uyumlu</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Hesap Oluştur</h2>
            <p style={styles.formSubtitle}>
              Ücretsiz hesabınızı oluşturun ve AI ile görsel üretmeye başlayın
            </p>
          </div>

          {/* Social Register Buttons */}
          <div style={styles.socialButtons}>
            <button
              type="button"
              onClick={() => handleSocialRegister("google")}
              style={styles.socialButton}
            >
              <svg style={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile Kayıt
            </button>
            <button
              type="button"
              onClick={() => handleSocialRegister("github")}
              style={styles.socialButton}
            >
              <svg style={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub ile Kayıt
            </button>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>veya e-posta ile</span>
            <span style={styles.dividerLine}></span>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Şirket / Marka Adı</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🏢</span>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Şirketinizin adını girin"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>E-posta Adresi</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ornek@sirket.com"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Şifre</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="En az 8 karakter"
                  style={styles.input}
                  disabled={isSubmitting}
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
              {formData.password && (
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Şifrenizi tekrar girin"
                  style={styles.input}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={styles.matchError}>Şifreler eşleşmiyor</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
                <p style={styles.matchSuccess}>✓ Şifreler eşleşiyor</p>
              )}
            </div>

            {/* Terms Agreement */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>
                <Link href="/terms" style={styles.termsLink}>Kullanım Koşulları</Link>
                {" "}ve{" "}
                <Link href="/privacy" style={styles.termsLink}>Gizlilik Politikası</Link>
                'nı okudum ve kabul ediyorum
              </span>
            </label>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <span style={styles.loadingWrapper}>
                  <span style={styles.spinner}></span>
                  Hesap oluşturuluyor...
                </span>
              ) : (
                <>
                  <span>Ücretsiz Hesap Oluştur</span>
                  <span style={styles.buttonIcon}>→</span>
                </>
              )}
            </button>
          </form>

          <p style={styles.loginLink}>
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" style={styles.link}>
              Giriş yapın
            </Link>
          </p>

          <p style={styles.freeCredits}>
            🎁 İlk 10 görsel kredisi <strong>ücretsiz!</strong>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#0a0a0f",
  },
  leftSide: {
    flex: 1,
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  brandContent: {
    maxWidth: "500px",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    marginBottom: "48px",
  },
  logoIcon: {
    fontSize: "32px",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  heroContent: {
    marginBottom: "48px",
  },
  heroTitle: {
    fontSize: "42px",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: "16px",
  },
  heroGradient: {
    background: "linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroDescription: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "40px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  featureIcon: {
    fontSize: "24px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(167,139,250,0.2)",
    borderRadius: "10px",
  },
  featureTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  featureDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    margin: 0,
  },
  trustBadges: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  badge: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
  },
  rightSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#0a0a0f",
    overflowY: "auto" as const,
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    animation: "fadeIn 0.5s ease-out",
  },
  formHeader: {
    marginBottom: "32px",
    textAlign: "center" as const,
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
  },
  socialButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  socialIcon: {
    width: "20px",
    height: "20px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.5)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
    left: "14px",
    fontSize: "16px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
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
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    marginTop: "2px",
    accentColor: "#a78bfa",
    cursor: "pointer",
  },
  checkboxText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
  },
  termsLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 500,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "12px",
    color: "#f87171",
    fontSize: "14px",
  },
  errorIcon: {
    fontSize: "18px",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "8px",
  },
  buttonIcon: {
    fontSize: "18px",
    transition: "transform 0.2s ease",
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
  loginLink: {
    textAlign: "center" as const,
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    marginTop: "24px",
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 500,
  },
  freeCredits: {
    textAlign: "center" as const,
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
    marginTop: "16px",
    padding: "12px",
    background: "rgba(167,139,250,0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(167,139,250,0.2)",
  },
};
