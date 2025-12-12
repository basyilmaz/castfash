import React from "react";
import Link from "next/link";

export type AuthMode = "login" | "register";
export type AuthCardProps = {
  mode: AuthMode;
  title?: string;
  subtitle?: string;
  onSubmit?: (formData: FormData) => void;
};

export function AuthCard({ mode, title, subtitle, onSubmit }: AuthCardProps) {
  const defaultTitle = mode === "login" ? "Castfash hesabına giriş" : "Castfash hesabı oluştur";
  const defaultSubtitle =
    mode === "login"
      ? "AI kataloglarınıza erişin ve üretime devam edin."
      : "Dakikalar içinde kaydolun, üretime başlayın.";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-4 space-y-1">
        <h3 className="text-xl font-semibold text-white">{title || defaultTitle}</h3>
        <p className="text-sm text-textMuted">{subtitle || defaultSubtitle}</p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          required
          placeholder="E-posta"
          className="w-full rounded-lg bg-surface border border-border px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Şifre"
          className="w-full rounded-lg bg-surface border border-border px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {mode === "register" && (
          <input
            name="organization"
            type="text"
            required
            placeholder="Organizasyon adı"
            className="w-full rounded-lg bg-surface border border-border px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        {mode === "login" && (
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:-translate-y-0.5 transition"
        >
          {mode === "login" ? "Giriş yap" : "Kayıt ol"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-textMuted">
        {mode === "login" ? (
          <>
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Kayıt olun
            </Link>
          </>
        ) : (
          <>
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Giriş yapın
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

