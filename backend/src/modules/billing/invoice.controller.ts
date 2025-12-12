import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { InvoiceService, CreateInvoiceDto, UpdateInvoiceDto } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    // ---------------------------------------------------------------------------
    // Create Invoice
    // ---------------------------------------------------------------------------

    @Post()
    async createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.createInvoice(organizationId, dto);
    }

    // ---------------------------------------------------------------------------
    // Get Invoice
    // ---------------------------------------------------------------------------

    @Get(':id')
    async getInvoice(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.getInvoice(id, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Get Invoice by Number
    // ---------------------------------------------------------------------------

    @Get('number/:invoiceNumber')
    async getInvoiceByNumber(@Request() req: any, @Param('invoiceNumber') invoiceNumber: string) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.getInvoiceByNumber(invoiceNumber, organizationId);
    }

    // ---------------------------------------------------------------------------
    // List Invoices
    // ---------------------------------------------------------------------------

    @Get()
    async listInvoices(
        @Request() req: any,
        @Query('status') status?: InvoiceStatus,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.listInvoices(organizationId, {
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }

    // ---------------------------------------------------------------------------
    // Update Invoice
    // ---------------------------------------------------------------------------

    @Put(':id')
    async updateInvoice(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInvoiceDto,
    ) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.updateInvoice(id, dto, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Mark as Paid
    // ---------------------------------------------------------------------------

    @Put(':id/pay')
    async markAsPaid(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { paymentMethod: PaymentMethod; paymentReference?: string },
    ) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.markAsPaid(id, body.paymentMethod, body.paymentReference, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Cancel Invoice
    // ---------------------------------------------------------------------------

    @Put(':id/cancel')
    async cancelInvoice(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.cancelInvoice(id, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Refund Invoice
    // ---------------------------------------------------------------------------

    @Put(':id/refund')
    async refundInvoice(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.refundInvoice(id, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Get Invoice Statistics
    // ---------------------------------------------------------------------------

    @Get('stats/summary')
    async getInvoiceStats(@Request() req: any) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.getInvoiceStats(organizationId);
    }

    // ---------------------------------------------------------------------------
    // Get Invoice for PDF
    // ---------------------------------------------------------------------------

    @Get(':id/pdf-data')
    async getInvoiceForPdf(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.getInvoiceForPdf(id, organizationId);
    }

    // ---------------------------------------------------------------------------
    // Delete Invoice (Draft only)
    // ---------------------------------------------------------------------------

    @Delete(':id')
    async deleteInvoice(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
        const organizationId = req.user.organizationId;
        return this.invoiceService.deleteInvoice(id, organizationId);
    }
}
