'use client';

import { cn } from '@/lib/utils';

interface Step {
    number: number;
    label: string;
}

interface WizardProgressProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function WizardProgress({ steps, currentStep, className }: WizardProgressProps) {
    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                                    currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-primary text-black animate-pulse'
                                            : 'bg-surface border-2 border-border text-textMuted'
                                )}
                            >
                                {currentStep > step.number ? (
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={cn(
                                    'mt-2 text-xs font-medium text-center',
                                    currentStep >= step.number ? 'text-white' : 'text-textMuted'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-4 relative">
                                <div className="absolute inset-0 bg-border rounded-full" />
                                <div
                                    className={cn(
                                        'absolute inset-0 rounded-full transition-all duration-500',
                                        currentStep > step.number ? 'bg-green-500' : 'bg-border'
                                    )}
                                    style={{
                                        width: currentStep > step.number ? '100%' : '0%',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
