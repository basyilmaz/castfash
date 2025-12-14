import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// =============================================================================
// Progress Event Types
// =============================================================================

export interface GenerationProgressEvent {
    requestId: number;
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    currentStep?: string;
    imageUrl?: string;
    error?: string;
    queuePosition?: number;
    estimatedTimeMs?: number;
}

export interface QueueStatusEvent {
    totalJobs: number;
    activeJobs: number;
    queuePosition: number;
    estimatedWaitTimeMs: number;
}

// =============================================================================
// WebSocket Gateway
// =============================================================================

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/generation',
})
export class GenerationGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(GenerationGateway.name);

    // Map of room subscriptions: requestId -> Set of socket IDs
    private requestSubscriptions: Map<number, Set<string>> = new Map();

    // Map of socket ID to user info
    private connectedClients: Map<string, { userId: number; organizationId: number }> = new Map();

    constructor(private readonly jwtService: JwtService) { }

    // ==========================================================================
    // Connection Handlers
    // ==========================================================================

    async handleConnection(client: Socket) {
        try {
            // Extract token from auth header or query
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                client.handshake.query?.token;

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without auth token`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }

            // Verify JWT
            const payload = this.jwtService.verify(token as string);

            this.connectedClients.set(client.id, {
                userId: payload.sub,
                organizationId: payload.organizationId,
            });

            this.logger.log(`Client ${client.id} connected (user: ${payload.sub})`);

            client.emit('connected', {
                message: 'Connected to generation progress',
                clientId: client.id,
            });
        } catch (error: any) {
            this.logger.error(`Auth error for client ${client.id}: ${error.message}`);
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Clean up subscriptions
        for (const [requestId, subscribers] of this.requestSubscriptions.entries()) {
            subscribers.delete(client.id);
            if (subscribers.size === 0) {
                this.requestSubscriptions.delete(requestId);
            }
        }

        this.connectedClients.delete(client.id);
        this.logger.log(`Client ${client.id} disconnected`);
    }

    // ==========================================================================
    // Message Handlers
    // ==========================================================================

    @SubscribeMessage('subscribe')
    handleSubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { requestId: number },
    ) {
        const { requestId } = data;

        if (!requestId) {
            client.emit('error', { message: 'requestId is required' });
            return;
        }

        // Add to subscription
        if (!this.requestSubscriptions.has(requestId)) {
            this.requestSubscriptions.set(requestId, new Set());
        }
        this.requestSubscriptions.get(requestId)!.add(client.id);

        // Join room
        client.join(`request:${requestId}`);

        this.logger.log(`Client ${client.id} subscribed to request ${requestId}`);

        client.emit('subscribed', { requestId });
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { requestId: number },
    ) {
        const { requestId } = data;

        const subscribers = this.requestSubscriptions.get(requestId);
        if (subscribers) {
            subscribers.delete(client.id);
            if (subscribers.size === 0) {
                this.requestSubscriptions.delete(requestId);
            }
        }

        client.leave(`request:${requestId}`);

        this.logger.log(`Client ${client.id} unsubscribed from request ${requestId}`);

        client.emit('unsubscribed', { requestId });
    }

    // ==========================================================================
    // Server-side Event Emitters (called from QueueService)
    // ==========================================================================

    /**
     * Emit progress update for a generation request
     */
    emitProgress(event: GenerationProgressEvent): void {
        const room = `request:${event.requestId}`;
        this.server.to(room).emit('progress', event);

        this.logger.debug(
            `Emitted progress for request ${event.requestId}: ${event.status} (${event.progress}%)`,
        );
    }

    /**
     * Emit when a job starts processing
     */
    emitJobStarted(requestId: number, jobId: string, queuePosition: number): void {
        this.emitProgress({
            requestId,
            jobId,
            status: 'processing',
            progress: 10,
            currentStep: 'Generating image...',
            queuePosition,
        });
    }

    /**
     * Emit when a job completes successfully
     */
    emitJobCompleted(requestId: number, jobId: string, imageUrl: string): void {
        this.emitProgress({
            requestId,
            jobId,
            status: 'completed',
            progress: 100,
            currentStep: 'Complete',
            imageUrl,
        });
    }

    /**
     * Emit when a job fails
     */
    emitJobFailed(requestId: number, jobId: string, error: string): void {
        this.emitProgress({
            requestId,
            jobId,
            status: 'failed',
            progress: 0,
            error,
        });
    }

    /**
     * Emit queue status update
     */
    emitQueueStatus(requestId: number, status: QueueStatusEvent): void {
        const room = `request:${requestId}`;
        this.server.to(room).emit('queueStatus', status);
    }

    /**
     * Emit when all jobs for a request are complete
     */
    emitRequestComplete(
        requestId: number,
        totalImages: number,
        failedImages: number,
    ): void {
        const room = `request:${requestId}`;
        this.server.to(room).emit('requestComplete', {
            requestId,
            totalImages,
            failedImages,
            success: failedImages === 0,
        });
    }

    // ==========================================================================
    // Utility Methods
    // ==========================================================================

    /**
     * Get count of connected clients
     */
    getConnectedClientsCount(): number {
        return this.connectedClients.size;
    }

    /**
     * Get count of subscriptions for a request
     */
    getSubscriptionCount(requestId: number): number {
        return this.requestSubscriptions.get(requestId)?.size || 0;
    }
}
