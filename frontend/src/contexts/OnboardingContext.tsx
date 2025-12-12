"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector for highlight
    action?: () => void;
    completed?: boolean;
}

interface OnboardingContextType {
    isOnboardingActive: boolean;
    isNewUser: boolean;
    currentStep: number;
    steps: OnboardingStep[];
    showWelcome: boolean;
    startOnboarding: () => void;
    skipOnboarding: () => void;
    nextStep: () => void;
    prevStep: () => void;
    completeOnboarding: () => void;
    dismissWelcome: () => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = "castfash_onboarding";
const WELCOME_STORAGE_KEY = "castfash_welcome_shown";

const DEFAULT_STEPS: OnboardingStep[] = [
    {
        id: "welcome",
        title: "CastFash'a Hoş Geldiniz! 🎉",
        description: "AI destekli görsel üretim platformuna hoş geldiniz. Size temel özellikleri gösterelim.",
    },
    {
        id: "products",
        title: "Ürünlerinizi Ekleyin 📦",
        description: "İlk olarak ürün görsellerinizi yükleyin. AI, ürünlerinizi tanıyacak ve profesyonel görseller oluşturacak.",
        target: "[data-onboarding='products']",
    },
    {
        id: "models",
        title: "Model Profillerini Keşfedin 👤",
        description: "Ürünleriniz için modeller seçin veya AI ile yeni modeller oluşturun.",
        target: "[data-onboarding='models']",
    },
    {
        id: "scenes",
        title: "Sahne Oluşturun 🎨",
        description: "Ürünlerinizin sergileneceği arka planları ve ortamları oluşturun.",
        target: "[data-onboarding='scenes']",
    },
    {
        id: "generate",
        title: "Görsel Üretin ✨",
        description: "Tüm bileşenleri birleştirerek profesyonel e-ticaret görselleri oluşturun.",
        target: "[data-onboarding='generations']",
    },
    {
        id: "complete",
        title: "Hazırsınız! 🚀",
        description: "Artık CastFash'ın tüm özelliklerini kullanabilirsiniz. İlk görselinizi oluşturmaya başlayın!",
    },
];

// Helper to get initial state from localStorage
const getInitialOnboardingState = () => {
    if (typeof window === "undefined") {
        return { isNewUser: false, showWelcome: false };
    }
    const onboardingData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_STORAGE_KEY);

    if (!onboardingData) {
        return {
            isNewUser: true,
            showWelcome: !welcomeShown
        };
    }
    return { isNewUser: false, showWelcome: false };
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isOnboardingActive, setIsOnboardingActive] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps] = useState<OnboardingStep[]>(DEFAULT_STEPS);
    const [showWelcome, setShowWelcome] = useState(false);

    // SSR uyumluluğu için localStorage'dan durum yüklenir
    useEffect(() => {
        const initialState = getInitialOnboardingState();
        setIsNewUser(initialState.isNewUser);
        setShowWelcome(initialState.showWelcome);
    }, []);

    const startOnboarding = () => {
        setShowWelcome(false);
        setIsOnboardingActive(true);
        setCurrentStep(0);
        localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    };

    const skipOnboarding = () => {
        setShowWelcome(false);
        setIsOnboardingActive(false);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ completed: true, skipped: true }));
        localStorage.setItem(WELCOME_STORAGE_KEY, "true");
        setIsNewUser(false);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const completeOnboarding = () => {
        setIsOnboardingActive(false);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ completed: true, skipped: false }));
        setIsNewUser(false);
    };

    const dismissWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        localStorage.removeItem(WELCOME_STORAGE_KEY);
        setIsNewUser(true);
        setShowWelcome(true);
        setCurrentStep(0);
        setIsOnboardingActive(false);
    };

    return (
        <OnboardingContext.Provider
            value={{
                isOnboardingActive,
                isNewUser,
                currentStep,
                steps,
                showWelcome,
                startOnboarding,
                skipOnboarding,
                nextStep,
                prevStep,
                completeOnboarding,
                dismissWelcome,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
