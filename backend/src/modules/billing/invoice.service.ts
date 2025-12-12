import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, PaymentMethod, Prisma } from '@prisma/client';

// =============================================================================
// DTOs
// =============================================================================

export interface CreateInvoiceDto {
  dueDate: Date;
  subtotal: number;
  taxRate?: number;
  discountAmount?: number;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  taxId?: string;
  notes?: string;
  items: CreateInvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
  description: string;
  quantity?: number;
  unitPrice: number;
  productType?: string;
  productId?: string;
}

export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

export interface InvoiceFilterDto {
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// =============================================================================
// Service
// =============================================================================

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) { }

  // ---------------------------------------------------------------------------
  // Generate Invoice Number
  // ---------------------------------------------------------------------------

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}`;

    // Get the last invoice number for this year
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(
        lastInvoice.invoiceNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  // ---------------------------------------------------------------------------
  // Create Invoice
  // ---------------------------------------------------------------------------

  async createInvoice(organizationId: number, dto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();
    const taxRate = dto.taxRate ?? 18;
    const subtotal = dto.subtotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = dto.discountAmount ?? 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create invoice items
    const items = dto.items.map((item) => ({
      description: item.description,
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * (item.quantity ?? 1),
      productType: item.productType,
      productId: item.productId,
    }));

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber,
        status: InvoiceStatus.PENDING,
        dueDate: dto.dueDate,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerAddress: dto.customerAddress,
        taxId: dto.taxId,
        notes: dto.notes,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    this.logger.log(
      `Created invoice ${invoiceNumber} for organization ${organizationId}`,
    );
    return invoice;
  }

  // ---------------------------------------------------------------------------
  // Get Invoice
  // ---------------------------------------------------------------------------

  async getInvoice(id: number, organizationId?: number) {
    const where: Prisma.InvoiceWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    return invoice;
  }

  // ---------------------------------------------------------------------------
  // Get Invoice by Number
  // ---------------------------------------------------------------------------

  async getInvoiceByNumber(invoiceNumber: string, organizationId?: number) {
    const where: Prisma.InvoiceWhereInput = { invoiceNumber };
    if (organizationId) where.organizationId = organizationId;

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: { items: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceNumber} not found`);
    }

    return invoice;
  }

  // ---------------------------------------------------------------------------
  // List Invoices
  // ---------------------------------------------------------------------------

  async listInvoices(organizationId: number, options: InvoiceFilterDto = {}) {
    const { status, startDate, endDate, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { organizationId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = startDate;
      if (endDate) where.issueDate.lte = endDate;
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { issueDate: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Update Invoice
  // ---------------------------------------------------------------------------

  async updateInvoice(
    id: number,
    dto: UpdateInvoiceDto,
    organizationId?: number,
  ) {
    const where: Prisma.InvoiceWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const existing = await this.prisma.invoice.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status,
        paymentMethod: dto.paymentMethod,
        paymentReference: dto.paymentReference,
        notes: dto.notes,
        ...(dto.status === InvoiceStatus.PAID ? { paidAt: new Date() } : {}),
      },
      include: { items: true },
    });

    this.logger.log(`Updated invoice ${id} - status: ${invoice.status}`);
    return invoice;
  }

  // ---------------------------------------------------------------------------
  // Mark as Paid
  // ---------------------------------------------------------------------------

  async markAsPaid(
    id: number,
    paymentMethod: PaymentMethod,
    paymentReference?: string,
    organizationId?: number,
  ) {
    return this.updateInvoice(
      id,
      {
        status: InvoiceStatus.PAID,
        paymentMethod,
        paymentReference,
      },
      organizationId,
    );
  }

  // ---------------------------------------------------------------------------
  // Cancel Invoice
  // ---------------------------------------------------------------------------

  async cancelInvoice(id: number, organizationId?: number) {
    return this.updateInvoice(
      id,
      { status: InvoiceStatus.CANCELLED },
      organizationId,
    );
  }

  // ---------------------------------------------------------------------------
  // Refund Invoice
  // ---------------------------------------------------------------------------

  async refundInvoice(id: number, organizationId?: number) {
    const invoice = await this.getInvoice(id, organizationId);

    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Only paid invoices can be refunded');
    }

    return this.updateInvoice(
      id,
      { status: InvoiceStatus.REFUNDED },
      organizationId,
    );
  }

  // ---------------------------------------------------------------------------
  // Get Invoice Statistics
  // ---------------------------------------------------------------------------

  async getInvoiceStats(organizationId: number) {
    const [statusCounts, totals] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { organizationId },
        _sum: { totalAmount: true },
      }),
    ]);

    const stats = {
      totalInvoices: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      byStatus: {} as Record<InvoiceStatus, { count: number; amount: number }>,
    };

    for (const status of Object.values(InvoiceStatus)) {
      const countData = statusCounts.find((s) => s.status === status);
      const totalData = totals.find((t) => t.status === status);

      stats.byStatus[status] = {
        count: countData?._count || 0,
        amount: totalData?._sum.totalAmount || 0,
      };

      stats.totalInvoices += countData?._count || 0;

      if (status === InvoiceStatus.PAID) {
        stats.totalRevenue += totalData?._sum.totalAmount || 0;
      } else if (status === InvoiceStatus.PENDING) {
        stats.pendingAmount += totalData?._sum.totalAmount || 0;
      } else if (status === InvoiceStatus.OVERDUE) {
        stats.overdueAmount += totalData?._sum.totalAmount || 0;
      }
    }

    return stats;
  }

  // ---------------------------------------------------------------------------
  // Check Overdue Invoices
  // ---------------------------------------------------------------------------

  async checkOverdueInvoices() {
    const now = new Date();

    const result = await this.prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: { lt: now },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    if (result.count > 0) {
      this.logger.warn(`Marked ${result.count} invoices as overdue`);
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Delete Invoice (Draft only)
  // ---------------------------------------------------------------------------

  async deleteInvoice(id: number, organizationId?: number) {
    const where: Prisma.InvoiceWhereInput = { id, status: InvoiceStatus.DRAFT };
    if (organizationId) where.organizationId = organizationId;

    const invoice = await this.prisma.invoice.findFirst({ where });
    if (!invoice) {
      throw new NotFoundException(`Draft invoice ${id} not found`);
    }

    await this.prisma.invoice.delete({ where: { id } });
    this.logger.log(`Deleted invoice ${id}`);
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Generate Invoice Data for PDF
  // ---------------------------------------------------------------------------

  async getInvoiceForPdf(id: number, organizationId?: number) {
    const invoice = await this.getInvoice(id, organizationId);

    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString().split('T')[0],
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      status: invoice.status,
      customer: {
        name: invoice.customerName,
        email: invoice.customerEmail,
        address: invoice.customerAddress,
        taxId: invoice.taxId,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      notes: invoice.notes,
      paidAt: invoice.paidAt?.toISOString().split('T')[0],
      paymentMethod: invoice.paymentMethod,
    };
  }
}
