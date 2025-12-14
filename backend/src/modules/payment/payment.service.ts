import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { CreditType } from '@prisma/client';
// Note: Install stripe package: npm install stripe
// import Stripe from 'stripe';

// =============================================================================
// Types
// =============================================================================

export interface CreateCheckoutSessionDto {
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents
  currency: string;
  description?: string;
  popular?: boolean;
}

// =============================================================================
// Credit Packages Configuration
// =============================================================================

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Başlangıç',
    credits: 50,
    price: 2500, // $25
    currency: 'usd',
    description: 'Küçük projeler ve test için ideal',
  },
  {
    id: 'professional',
    name: 'Profesyonel',
    credits: 200,
    price: 4900, // $49
    currency: 'usd',
    description: 'Büyüyen markalar için',
    popular: true,
  },
  {
    id: 'studio',
    name: 'Stüdyo',
    credits: 600,
    price: 9900, // $99
    currency: 'usd',
    description: 'Yoğun kullanım için en ekonomik paket',
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    credits: 2000,
    price: 24900, // $249
    currency: 'usd',
    description: 'Büyük ölçekli operasyonlar için',
  },
];

// =============================================================================
// Payment Service
// =============================================================================

// Stripe type placeholder - replace with actual import after: npm install stripe
// import Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeClient = any;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: StripeClient = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      // Stripe initialization - uncomment after installing stripe package
      // const StripeModule = require('stripe');
      // this.stripe = new StripeModule.default(secretKey, { apiVersion: '2024-11-20.acacia' });
      this.logger.warn('Stripe SDK not installed. Run: npm install stripe');
    } else {
      this.logger.warn('Stripe not configured - STRIPE_SECRET_KEY not set');
    }
  }

  // ==========================================================================
  // Stripe Status
  // ==========================================================================

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  // ==========================================================================
  // Credit Packages
  // ==========================================================================

  getPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  }

  getPackageById(packageId: string): CreditPackage | undefined {
    return CREDIT_PACKAGES.find((p) => p.id === packageId);
  }

  // ==========================================================================
  // Checkout Session
  // ==========================================================================

  async createCheckoutSession(
    userId: number,
    organizationId: number,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    const creditPackage = this.getPackageById(dto.packageId);
    if (!creditPackage) {
      throw new BadRequestException('Invalid package selected');
    }

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: creditPackage.currency,
              product_data: {
                name: `${creditPackage.name} - ${creditPackage.credits} Kredi`,
                description: creditPackage.description,
                metadata: {
                  packageId: creditPackage.id,
                  credits: creditPackage.credits.toString(),
                },
              },
              unit_amount: creditPackage.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        customer_email: user.email,
        metadata: {
          userId: userId.toString(),
          organizationId: organizationId.toString(),
          packageId: creditPackage.id,
          credits: creditPackage.credits.toString(),
        },
        locale: 'tr',
      });

      this.logger.log(
        `Checkout session created: ${session.id} for user ${userId}, package ${creditPackage.id}`,
      );

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException('Failed to create payment session');
    }
  }

  // ==========================================================================
  // Webhook Handler
  // ==========================================================================

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    let event: any; // Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error: any) {
      this.logger.error(
        `Webhook signature verification failed: ${error.message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object); // Stripe.Checkout.Session
        break;

      case 'payment_intent.succeeded':
        this.logger.log('Payment succeeded');
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object); // Stripe.PaymentIntent
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    // Stripe.Checkout.Session
    const { userId, organizationId, packageId, credits } =
      session.metadata || {};

    if (!userId || !organizationId || !credits) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    const creditAmount = parseInt(credits, 10);
    const orgId = parseInt(organizationId, 10);
    const uId = parseInt(userId, 10);

    try {
      // Add credits to organization
      await this.creditsService.addCredits(
        orgId,
        creditAmount,
        CreditType.PURCHASE,
        `Kredi satın alımı: ${packageId} paketi`,
      );

      // Log success - invoice creation would require proper schema
      this.logger.log(
        `Credits added: ${creditAmount} to org ${orgId}, payment session ${session.id}`,
      );

      this.logger.log(
        `Credits added: ${creditAmount} to org ${orgId}, payment session ${session.id}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process checkout completion: ${error.message}`,
      );
      throw error;
    }
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    // Stripe.PaymentIntent
    this.logger.error(
      `Payment failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message}`,
    );
    // Could send notification to user here
  }

  // ==========================================================================
  // Payment History
  // ==========================================================================

  async getPaymentHistory(organizationId: number) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoice(invoiceId: number, organizationId: number) {
    return this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: { items: true },
    });
  }

  // ==========================================================================
  // Subscription Management (Credits-based)
  // ==========================================================================

  /**
   * Get organization's subscription status (based on credit balance)
   */
  async getActiveSubscription(organizationId: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        remainingCredits: true,
      },
    });

    if (!org) return null;

    const hasCredits = org.remainingCredits > 0;

    return {
      organizationId: org.id,
      organizationName: org.name,
      status: hasCredits ? 'active' : 'inactive',
      plan: 'credits',
      remainingCredits: org.remainingCredits,
      isActive: hasCredits,
    };
  }

  // ==========================================================================
  // Invoice Management
  // ==========================================================================

  /**
   * Create invoice for a purchase
   */
  async createInvoice(data: {
    organizationId: number;
    packageId: string;
    amount: number;
    credits: number;
  }) {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === data.packageId);

    // Get organization for customer info
    const org = await this.prisma.organization.findUnique({
      where: { id: data.organizationId },
      include: { owner: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    // Generate invoice number
    const invoiceCount = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const subtotal = data.amount / 100; // Convert from cents
    const taxRate = 18;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId: data.organizationId,
        invoiceNumber,
        status: 'PAID',
        dueDate: new Date(),
        paidAt: new Date(),
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        currency: pkg?.currency?.toUpperCase() || 'USD',
        customerName: org.name,
        customerEmail: org.owner.email,
        items: {
          create: {
            description: `${pkg?.name || data.packageId} - ${data.credits} Kredi`,
            quantity: 1,
            unitPrice: subtotal,
            totalPrice: subtotal,
          },
        },
      },
      include: { items: true },
    });

    this.logger.log(
      `Invoice created: ${invoice.id} for org ${data.organizationId}`,
    );
    return invoice;
  }

  /**
   * Get all invoices for admin
   */
  async getAllInvoices(params?: { skip?: number; take?: number }) {
    return this.prisma.invoice.findMany({
      skip: params?.skip || 0,
      take: params?.take || 50,
      include: {
        organization: {
          select: { id: true, name: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================================
  // Package Statistics
  // ==========================================================================

  /**
   * Get package statistics
   */
  async getPackageStats() {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: 'PAID' },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalSales = invoices.length;

    // Sales by month
    const monthlyStats = invoices.reduce(
      (acc, inv) => {
        const month = inv.createdAt.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { revenue: 0, sales: 0 };
        }
        acc[month].revenue += inv.totalAmount;
        acc[month].sales += 1;
        return acc;
      },
      {} as Record<string, { revenue: number; sales: number }>,
    );

    return {
      packages: CREDIT_PACKAGES.map((pkg) => ({
        ...pkg,
        priceFormatted: `$${(pkg.price / 100).toFixed(2)}`,
      })),
      stats: {
        totalRevenue,
        totalRevenueFormatted: `$${(totalRevenue / 100).toFixed(2)}`,
        totalSales,
        monthlyStats,
      },
    };
  }

  /**
   * Admin: Grant free credits to organization
   */
  async grantFreeCredits(
    organizationId: number,
    credits: number,
    reason: string,
    adminUserId: number,
  ) {
    await this.creditsService.addCredits(
      organizationId,
      credits,
      CreditType.ADJUST,
      `Admin tarafından eklendi: ${reason}`,
    );

    this.logger.log(
      `Admin ${adminUserId} granted ${credits} free credits to org ${organizationId}: ${reason}`,
    );

    return {
      success: true,
      message: `${credits} kredi başarıyla eklendi`,
      organizationId,
      credits,
    };
  }
}
