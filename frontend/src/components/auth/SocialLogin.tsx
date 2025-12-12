"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export type SocialProvider = "google" | "github" | "facebook" | "apple";

export interface SocialLoginButtonProps {
    provider: SocialProvider;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
    variant?: "filled" | "outline";
    showLabel?: boolean;
}

export interface SocialLoginGroupProps {
    providers?: SocialProvider[];
    onLogin: (provider: SocialProvider) => Promise<void>;
    disabled?: boolean;
    className?: string;
    dividerText?: string;
    size?: "sm" | "md" | "lg";
    variant?: "filled" | "outline";
}

// =============================================================================
// Provider Configurations
// =============================================================================

const providerConfig: Record<
    SocialProvider,
    {
        name: string;
        icon: React.ReactNode;
        bgColor: string;
        hoverColor: string;
        textColor: string;
        borderColor: string;
    }
> = {
    google: {
        name: "Google",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
        ),
        bgColor: "bg-white",
        hoverColor: "hover:bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
    },
    github: {
        name: "GitHub",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                />
            </svg>
        ),
        bgColor: "bg-[#24292e]",
        hoverColor: "hover:bg-[#2f363d]",
        textColor: "text-white",
        borderColor: "border-[#24292e]",
    },
    facebook: {
        name: "Facebook",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                />
            </svg>
        ),
        bgColor: "bg-[#1877f2]",
        hoverColor: "hover:bg-[#166fe5]",
        textColor: "text-white",
        borderColor: "border-[#1877f2]",
    },
    apple: {
        name: "Apple",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
        ),
        bgColor: "bg-black",
        hoverColor: "hover:bg-gray-900",
        textColor: "text-white",
        borderColor: "border-black",
    },
};

// =============================================================================
// Single Social Login Button
// =============================================================================

export function SocialLoginButton({
    provider,
    onClick,
    disabled = false,
    loading = false,
    className,
    size = "md",
    variant = "filled",
    showLabel = true,
}: SocialLoginButtonProps) {
    const config = providerConfig[provider];

    const sizeClasses = {
        sm: "px-3 py-2 text-sm gap-2",
        md: "px-4 py-3 text-base gap-3",
        lg: "px-6 py-4 text-lg gap-4",
    };

    const iconSizeClasses = {
        sm: "[&>svg]:w-4 [&>svg]:h-4",
        md: "[&>svg]:w-5 [&>svg]:h-5",
        lg: "[&>svg]:w-6 [&>svg]:h-6",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "flex items-center justify-center rounded-xl font-medium transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sizeClasses[size],
                iconSizeClasses[size],
                variant === "filled" && config.bgColor,
                variant === "filled" && config.hoverColor,
                variant === "filled" && config.textColor,
                variant === "outline" && "bg-transparent border-2",
                variant === "outline" && config.borderColor,
                variant === "outline" && "hover:bg-gray-100/10",
                variant === "outline" && "text-white",
                className
            )}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                config.icon
            )}
            {showLabel && (
                <span>{loading ? "Bağlanıyor..." : `${config.name} ile Giriş`}</span>
            )}
        </button>
    );
}

// =============================================================================
// Social Login Group with Divider
// =============================================================================

export function SocialLoginGroup({
    providers = ["google", "github"],
    onLogin,
    disabled = false,
    className,
    dividerText = "veya",
    size = "md",
    variant = "filled",
}: SocialLoginGroupProps) {
    const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

    const handleLogin = async (provider: SocialProvider) => {
        if (disabled || loadingProvider) return;

        setLoadingProvider(provider);
        try {
            await onLogin(provider);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Social Buttons */}
            <div className="space-y-3">
                {providers.map((provider) => (
                    <SocialLoginButton
                        key={provider}
                        provider={provider}
                        onClick={() => handleLogin(provider)}
                        disabled={disabled || (loadingProvider !== null && loadingProvider !== provider)}
                        loading={loadingProvider === provider}
                        size={size}
                        variant={variant}
                        className="w-full"
                    />
                ))}
            </div>

            {/* Divider */}
            {dividerText && (
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#0f172a] text-gray-400">{dividerText}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// Social Login Icons (Compact Version)
// =============================================================================

export function SocialLoginIcons({
    providers = ["google", "github", "facebook"],
    onLogin,
    disabled = false,
    className,
}: Omit<SocialLoginGroupProps, "dividerText" | "size" | "variant">) {
    const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

    const handleLogin = async (provider: SocialProvider) => {
        if (disabled || loadingProvider) return;

        setLoadingProvider(provider);
        try {
            await onLogin(provider);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <div className={cn("flex items-center justify-center gap-4", className)}>
            {providers.map((provider) => {
                const config = providerConfig[provider];
                const isLoading = loadingProvider === provider;
                const isDisabled = disabled || (loadingProvider !== null && !isLoading);

                return (
                    <button
                        key={provider}
                        onClick={() => handleLogin(provider)}
                        disabled={isDisabled}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                            "border-2 border-gray-600 hover:border-gray-500",
                            "bg-surface hover:bg-surface/80",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        title={`${config.name} ile giriş yap`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            config.icon
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// =============================================================================
// Account Linking Component
// =============================================================================

interface LinkedAccount {
    provider: SocialProvider;
    email?: string;
    connectedAt: Date;
}

interface AccountLinkingProps {
    linkedAccounts: LinkedAccount[];
    onLink: (provider: SocialProvider) => Promise<void>;
    onUnlink: (provider: SocialProvider) => Promise<void>;
    availableProviders?: SocialProvider[];
    className?: string;
}

export function AccountLinking({
    linkedAccounts,
    onLink,
    onUnlink,
    availableProviders = ["google", "github", "facebook", "apple"],
    className,
}: AccountLinkingProps) {
    const [loading, setLoading] = useState<SocialProvider | null>(null);

    const handleLink = async (provider: SocialProvider) => {
        setLoading(provider);
        try {
            await onLink(provider);
        } finally {
            setLoading(null);
        }
    };

    const handleUnlink = async (provider: SocialProvider) => {
        setLoading(provider);
        try {
            await onUnlink(provider);
        } finally {
            setLoading(null);
        }
    };

    const isLinked = (provider: SocialProvider) =>
        linkedAccounts.some((a) => a.provider === provider);

    return (
        <div className={cn("space-y-3", className)}>
            <h3 className="text-lg font-semibold mb-4">Bağlı Hesaplar</h3>
            {availableProviders.map((provider) => {
                const config = providerConfig[provider];
                const linked = linkedAccounts.find((a) => a.provider === provider);
                const isLoading = loading === provider;

                return (
                    <div
                        key={provider}
                        className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                                {config.icon}
                            </div>
                            <div>
                                <p className="font-medium">{config.name}</p>
                                {linked?.email && (
                                    <p className="text-sm text-textMuted">{linked.email}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                linked ? handleUnlink(provider) : handleLink(provider)
                            }
                            disabled={isLoading}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                linked
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-primary/20 text-primary hover:bg-primary/30",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    İşleniyor...
                                </span>
                            ) : linked ? (
                                "Bağlantıyı Kaldır"
                            ) : (
                                "Bağla"
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default SocialLoginButton;
