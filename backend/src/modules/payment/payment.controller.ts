import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    Param,
    Req,
    UseGuards,
    RawBodyRequest,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService, CreateCheckoutSessionDto } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    // ==========================================================================
    // Public Endpoints
    // ==========================================================================

    @Get('packages')
    @ApiOperation({ summary: 'Get available credit packages' })
    @ApiResponse({ status: 200, description: 'List of credit packages' })
    getPackages() {
        return {
            success: true,
            data: this.paymentService.getPackages(),
        };
    }

    @Get('status')
    @ApiOperation({ summary: 'Check if payment system is configured' })
    getStatus() {
        return {
            success: true,
            data: {
                configured: this.paymentService.isConfigured(),
            },
        };
    }

    // ==========================================================================
    // Authenticated Endpoints
    // ==========================================================================

    @Post('checkout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a checkout session for credit purchase' })
    @ApiResponse({ status: 200, description: 'Checkout session created' })
    @ApiResponse({ status: 400, description: 'Invalid package or configuration' })
    async createCheckout(
        @CurrentUser() user: RequestUser,
        @Body() dto: CreateCheckoutSessionDto,
    ) {
        if (!user.organizationId) {
            throw new BadRequestException('Organization required');
        }

        const result = await this.paymentService.createCheckoutSession(
            user.userId,
            user.organizationId,
            dto,
        );

        return {
            success: true,
            data: result,
        };
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get payment history' })
    async getPaymentHistory(@CurrentUser() user: RequestUser) {
        if (!user.organizationId) {
            throw new BadRequestException('Organization required');
        }

        const history = await this.paymentService.getPaymentHistory(
            user.organizationId,
        );

        return {
            success: true,
            data: history,
        };
    }

    @Get('invoice/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get invoice details' })
    async getInvoice(
        @Param('id') id: string,
        @CurrentUser() user: RequestUser,
    ) {
        if (!user.organizationId) {
            throw new BadRequestException('Organization required');
        }

        const invoice = await this.paymentService.getInvoice(
            parseInt(id, 10),
            user.organizationId,
        );

        if (!invoice) {
            throw new BadRequestException('Invoice not found');
        }

        return {
            success: true,
            data: invoice,
        };
    }

    // ==========================================================================
    // Webhook Endpoint
    // ==========================================================================

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe webhook handler' })
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!req.rawBody) {
            throw new BadRequestException('No raw body');
        }

        await this.paymentService.handleWebhook(req.rawBody, signature);

        return { received: true };
    }
}
