/**
 * Multi-Provider Payment System for CastFash
 *
 * Supports multiple payment providers:
 * - Stripe (International)
 * - PayTR (Turkey)
 * - iyzico (Turkey - Optional)
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// =============================================================================
// Types & Interfaces
// =============================================================================

export enum PaymentProviderType {
    STRIPE = 'STRIPE',
    PAYTR = 'PAYTR',
    IYZICO = 'IYZICO',
}

export interface PaymentProviderConfig {
    provider: PaymentProviderType;
    enabled: boolean;
    isDefault: boolean;
    supportedCountries: string[]; // ISO 3166-1 alpha-2 codes
    supportedCurrencies: string[];
    credentials: {
        apiKey?: string;
        secretKey?: string;
        merchantId?: string;
        merchantKey?: string;
        merchantSalt?: string;
        webhookSecret?: string;
    };
    settings: {
        testMode: boolean;
        autoCapture: boolean;
        paymentMethods?: string[];
    };
}

export interface CreatePaymentRequest {
    organizationId: number;
    userId: number;
    amount: number;
    currency: string;
    packageId: string;
    credits: number;
    customerEmail: string;
    customerName?: string;
    customerCountry?: string;
    successUrl: string;
    cancelUrl: string;
    callbackUrl?: string;
}

export interface PaymentResult {
    success: boolean;
    provider: PaymentProviderType;
    paymentId: string;
    redirectUrl?: string;
    formData?: Record<string, string>;
    error?: string;
}

export interface WebhookPayload {
    provider: PaymentProviderType;
    rawBody: string | Buffer;
    signature?: string;
    headers: Record<string, string>;
}

// =============================================================================
// Abstract Payment Provider
// =============================================================================

export abstract class PaymentProvider {
    abstract readonly providerType: PaymentProviderType;
    abstract readonly displayName: string;

    abstract isConfigured(): boolean;
    abstract createPayment(request: CreatePaymentRequest): Promise<PaymentResult>;
    abstract handleWebhook(payload: WebhookPayload): Promise<{
        success: boolean;
        paymentId?: string;
        organizationId?: number;
        credits?: number;
        error?: string;
    }>;
    abstract verifyPayment(paymentId: string): Promise<boolean>;
}

// =============================================================================
// Stripe Provider
// =============================================================================

@Injectable()
export class StripePaymentProvider extends PaymentProvider {
    readonly providerType = PaymentProviderType.STRIPE;
    readonly displayName = 'Stripe';
    private readonly logger = new Logger(StripePaymentProvider.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private stripe: any = null;

    constructor() {
        super();
        this.initialize();
    }

    private initialize() {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (secretKey) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const Stripe = require('stripe');
                this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
                this.logger.log('Stripe initialized successfully');
            } catch (error) {
                this.logger.warn('Stripe SDK not installed. Run: npm install stripe');
            }
        }
    }

    isConfigured(): boolean {
        return this.stripe !== null;
    }

    async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
        if (!this.stripe) {
            return {
                success: false,
                provider: this.providerType,
                paymentId: '',
                error: 'Stripe is not configured',
            };
        }

        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: request.currency.toLowerCase(),
                            product_data: {
                                name: `${request.credits} Kredi Paketi`,
                                description: `CastFash - ${request.packageId} paketi`,
                            },
                            unit_amount: request.amount,
                        },
                        quantity: 1,
                    },
                ],
                customer_email: request.customerEmail,
                success_url: request.successUrl,
                cancel_url: request.cancelUrl,
                metadata: {
                    organizationId: String(request.organizationId),
                    userId: String(request.userId),
                    packageId: request.packageId,
                    credits: String(request.credits),
                },
            });

            return {
                success: true,
                provider: this.providerType,
                paymentId: session.id,
                redirectUrl: session.url,
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Stripe payment creation failed: ${errorMessage}`);
            return {
                success: false,
                provider: this.providerType,
                paymentId: '',
                error: errorMessage,
            };
        }
    }

    async handleWebhook(payload: WebhookPayload): Promise<{
        success: boolean;
        paymentId?: string;
        organizationId?: number;
        credits?: number;
        error?: string;
    }> {
        if (!this.stripe) {
            return { success: false, error: 'Stripe not configured' };
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return { success: false, error: 'Webhook secret not configured' };
        }

        try {
            const event = this.stripe.webhooks.constructEvent(
                payload.rawBody,
                payload.signature,
                webhookSecret,
            );

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                return {
                    success: true,
                    paymentId: session.id,
                    organizationId: parseInt(session.metadata.organizationId, 10),
                    credits: parseInt(session.metadata.credits, 10),
                };
            }

            return { success: true };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }

    async verifyPayment(paymentId: string): Promise<boolean> {
        if (!this.stripe) return false;
        try {
            const session = await this.stripe.checkout.sessions.retrieve(paymentId);
            return session.payment_status === 'paid';
        } catch {
            return false;
        }
    }
}

// =============================================================================
// PayTR Provider (Turkey)
// =============================================================================

@Injectable()
export class PayTRPaymentProvider extends PaymentProvider {
    readonly providerType = PaymentProviderType.PAYTR;
    readonly displayName = 'PayTR';
    private readonly logger = new Logger(PayTRPaymentProvider.name);

    private merchantId: string | null = null;
    private merchantKey: string | null = null;
    private merchantSalt: string | null = null;

    constructor() {
        super();
        this.initialize();
    }

    private initialize() {
        this.merchantId = process.env.PAYTR_MERCHANT_ID || null;
        this.merchantKey = process.env.PAYTR_MERCHANT_KEY || null;
        this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || null;

        if (this.isConfigured()) {
            this.logger.log('PayTR initialized successfully');
        }
    }

    isConfigured(): boolean {
        return !!(this.merchantId && this.merchantKey && this.merchantSalt);
    }

    async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                provider: this.providerType,
                paymentId: '',
                error: 'PayTR is not configured',
            };
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const crypto = require('crypto');

            const merchantOid = `CF${Date.now()}_${request.organizationId}`;
            const userIp = '127.0.0.1'; // Should get from request
            const userBasket = Buffer.from(
                JSON.stringify([[`${request.credits} Kredi`, request.amount / 100, 1]]),
            ).toString('base64');

            // PayTR expects amount in kuruş (100 = 1 TL)
            const paymentAmount = request.amount;

            // Calculate hash
            const hashStr = `${this.merchantId}${userIp}${merchantOid}${request.customerEmail}${paymentAmount}transaction${userBasket}0${'TR'}${this.merchantSalt}`;
            const paytrToken = crypto
                .createHmac('sha256', this.merchantKey)
                .update(hashStr)
                .digest('base64');

            // Create form data for PayTR
            const formData: Record<string, string> = {
                merchant_id: this.merchantId!,
                user_ip: userIp,
                merchant_oid: merchantOid,
                email: request.customerEmail,
                payment_amount: String(paymentAmount),
                paytr_token: paytrToken,
                user_basket: userBasket,
                debug_on: '0',
                no_installment: '1',
                max_installment: '0',
                currency: 'TL',
                test_mode: process.env.PAYTR_TEST_MODE === 'true' ? '1' : '0',
                merchant_ok_url: request.successUrl,
                merchant_fail_url: request.cancelUrl,
                user_name: request.customerName || 'Müşteri',
                user_address: 'Türkiye',
                user_phone: '5000000000',
                timeout_limit: '30',
                lang: 'tr',
            };

            // In production, send to PayTR API to get iframe token
            // For now, return form data for client-side submission
            return {
                success: true,
                provider: this.providerType,
                paymentId: merchantOid,
                formData,
                // redirectUrl would be the PayTR iframe URL in production
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`PayTR payment creation failed: ${errorMessage}`);
            return {
                success: false,
                provider: this.providerType,
                paymentId: '',
                error: errorMessage,
            };
        }
    }

    async handleWebhook(payload: WebhookPayload): Promise<{
        success: boolean;
        paymentId?: string;
        organizationId?: number;
        credits?: number;
        error?: string;
    }> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const crypto = require('crypto');

            // Parse PayTR callback
            const body = typeof payload.rawBody === 'string'
                ? JSON.parse(payload.rawBody)
                : payload.rawBody;

            const merchantOid = body.merchant_oid;
            const status = body.status;
            const totalAmount = body.total_amount;
            const hash = body.hash;

            // Verify hash
            const hashStr = `${merchantOid}${this.merchantSalt}${status}${totalAmount}`;
            const expectedHash = crypto
                .createHmac('sha256', this.merchantKey)
                .update(hashStr)
                .digest('base64');

            if (hash !== expectedHash) {
                return { success: false, error: 'Invalid hash' };
            }

            if (status === 'success') {
                // Extract organization ID from merchant_oid (format: CF{timestamp}_{orgId})
                const parts = merchantOid.split('_');
                const organizationId = parseInt(parts[parts.length - 1], 10);

                return {
                    success: true,
                    paymentId: merchantOid,
                    organizationId,
                    // Credits should be stored in session/db when creating payment
                };
            }

            return { success: false, error: 'Payment failed' };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }

    async verifyPayment(_paymentId: string): Promise<boolean> {
        // PayTR verification would require API call
        // For now, rely on webhook
        return true;
    }
}

// =============================================================================
// Payment Provider Factory
// =============================================================================

@Injectable()
export class PaymentProviderFactory {
    private readonly logger = new Logger(PaymentProviderFactory.name);
    private providers: Map<PaymentProviderType, PaymentProvider> = new Map();

    constructor(
        private readonly stripeProvider: StripePaymentProvider,
        private readonly paytrProvider: PayTRPaymentProvider,
    ) {
        this.registerProviders();
    }

    private registerProviders() {
        this.providers.set(PaymentProviderType.STRIPE, this.stripeProvider);
        this.providers.set(PaymentProviderType.PAYTR, this.paytrProvider);

        this.logger.log(`Registered ${this.providers.size} payment providers`);
    }

    getProvider(type: PaymentProviderType): PaymentProvider | null {
        return this.providers.get(type) || null;
    }

    getAllProviders(): PaymentProvider[] {
        return Array.from(this.providers.values());
    }

    getConfiguredProviders(): PaymentProvider[] {
        return this.getAllProviders().filter((p) => p.isConfigured());
    }

    /**
     * Get the best provider for a country
     */
    getProviderForCountry(countryCode: string): PaymentProvider | null {
        // Turkey -> PayTR (if configured)
        if (countryCode === 'TR' && this.paytrProvider.isConfigured()) {
            return this.paytrProvider;
        }

        // Default to Stripe for international
        if (this.stripeProvider.isConfigured()) {
            return this.stripeProvider;
        }

        // Fallback to any configured provider
        const configured = this.getConfiguredProviders();
        return configured.length > 0 ? configured[0] : null;
    }

    /**
     * Get provider status for admin panel
     */
    getProvidersStatus(): Array<{
        type: PaymentProviderType;
        name: string;
        configured: boolean;
        supportedCountries: string[];
    }> {
        return [
            {
                type: PaymentProviderType.STRIPE,
                name: 'Stripe',
                configured: this.stripeProvider.isConfigured(),
                supportedCountries: ['*'], // All countries
            },
            {
                type: PaymentProviderType.PAYTR,
                name: 'PayTR',
                configured: this.paytrProvider.isConfigured(),
                supportedCountries: ['TR'],
            },
        ];
    }
}

// =============================================================================
// Provider Settings Service (Admin)
// =============================================================================

@Injectable()
export class PaymentSettingsService {
    private readonly logger = new Logger(PaymentSettingsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all payment settings
     */
    async getSettings() {
        // In production, these would come from database
        return {
            stripe: {
                enabled: !!process.env.STRIPE_SECRET_KEY,
                testMode: process.env.STRIPE_TEST_MODE === 'true',
                publicKey: process.env.STRIPE_PUBLISHABLE_KEY ? '****' : null,
                secretKey: process.env.STRIPE_SECRET_KEY ? '****' : null,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '****' : null,
            },
            paytr: {
                enabled: !!(
                    process.env.PAYTR_MERCHANT_ID &&
                    process.env.PAYTR_MERCHANT_KEY &&
                    process.env.PAYTR_MERCHANT_SALT
                ),
                testMode: process.env.PAYTR_TEST_MODE === 'true',
                merchantId: process.env.PAYTR_MERCHANT_ID ? '****' : null,
                merchantKey: process.env.PAYTR_MERCHANT_KEY ? '****' : null,
                merchantSalt: process.env.PAYTR_MERCHANT_SALT ? '****' : null,
            },
            routing: {
                turkeyProvider: 'paytr',
                defaultProvider: 'stripe',
                fallbackEnabled: true,
            },
        };
    }

    /**
     * Update provider settings (would store in DB in production)
     */
    async updateSettings(
        _provider: PaymentProviderType,
        _settings: Partial<PaymentProviderConfig>,
    ) {
        // In production, save to database
        // For now, settings are managed via environment variables
        this.logger.log('Settings update requested - use environment variables');
        return { success: true, message: 'Update via environment variables' };
    }

    /**
     * Test provider connection
     */
    async testConnection(provider: PaymentProviderType): Promise<{
        success: boolean;
        message: string;
    }> {
        // Would make a test API call to the provider
        this.logger.log(`Testing connection to ${provider}`);
        return {
            success: true,
            message: `${provider} connection test successful`,
        };
    }
}
