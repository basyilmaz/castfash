/**
 * Generation Progress WebSocket Client
 * 
 * Real-time progress tracking for image generation
 */

// =============================================================================
// Types
// =============================================================================

export interface GenerationProgressEvent {
    requestId: number;
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
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

export interface RequestCompleteEvent {
    requestId: number;
    totalImages: number;
    failedImages: number;
    success: boolean;
}

type EventCallback<T> = (data: T) => void;

interface SocketLike {
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
    emit: (event: string, data?: any) => void;
    disconnect: () => void;
    connected: boolean;
}

// =============================================================================
// WebSocket Client Class
// =============================================================================

export class GenerationProgressClient {
    private socket: SocketLike | null = null;
    private token: string;
    private apiUrl: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;

    // Event callbacks
    private onProgressCallbacks: Map<number, EventCallback<GenerationProgressEvent>[]> = new Map();
    private onQueueStatusCallbacks: Map<number, EventCallback<QueueStatusEvent>[]> = new Map();
    private onCompleteCallbacks: Map<number, EventCallback<RequestCompleteEvent>[]> = new Map();
    private onErrorCallbacks: EventCallback<Error>[] = [];
    private onConnectCallbacks: (() => void)[] = [];
    private onDisconnectCallbacks: (() => void)[] = [];

    constructor(apiUrl: string, token: string) {
        this.apiUrl = apiUrl.replace(/\/+$/, ''); // Remove trailing slashes
        this.token = token;
    }

    // ==========================================================================
    // Connection Management
    // ==========================================================================

    async connect(): Promise<void> {
        if (this.socket?.connected || this.isConnecting) {
            return;
        }

        this.isConnecting = true;

        try {
            // Dynamic import of socket.io-client
            const { io } = await import('socket.io-client');

            this.socket = io(`${this.apiUrl}/generation`, {
                auth: { token: this.token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
            });

            this.setupEventListeners();
        } catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.onProgressCallbacks.clear();
        this.onQueueStatusCallbacks.clear();
        this.onCompleteCallbacks.clear();
    }

    get isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    // ==========================================================================
    // Subscription Management
    // ==========================================================================

    subscribe(requestId: number): void {
        if (!this.socket?.connected) {
            console.warn('WebSocket not connected. Call connect() first.');
            return;
        }
        this.socket.emit('subscribe', { requestId });
    }

    unsubscribe(requestId: number): void {
        if (!this.socket?.connected) return;
        this.socket.emit('unsubscribe', { requestId });

        // Clean up callbacks
        this.onProgressCallbacks.delete(requestId);
        this.onQueueStatusCallbacks.delete(requestId);
        this.onCompleteCallbacks.delete(requestId);
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    onProgress(requestId: number, callback: EventCallback<GenerationProgressEvent>): () => void {
        if (!this.onProgressCallbacks.has(requestId)) {
            this.onProgressCallbacks.set(requestId, []);
        }
        this.onProgressCallbacks.get(requestId)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.onProgressCallbacks.get(requestId);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    onQueueStatus(requestId: number, callback: EventCallback<QueueStatusEvent>): () => void {
        if (!this.onQueueStatusCallbacks.has(requestId)) {
            this.onQueueStatusCallbacks.set(requestId, []);
        }
        this.onQueueStatusCallbacks.get(requestId)!.push(callback);

        return () => {
            const callbacks = this.onQueueStatusCallbacks.get(requestId);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    onComplete(requestId: number, callback: EventCallback<RequestCompleteEvent>): () => void {
        if (!this.onCompleteCallbacks.has(requestId)) {
            this.onCompleteCallbacks.set(requestId, []);
        }
        this.onCompleteCallbacks.get(requestId)!.push(callback);

        return () => {
            const callbacks = this.onCompleteCallbacks.get(requestId);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    onError(callback: EventCallback<Error>): () => void {
        this.onErrorCallbacks.push(callback);
        return () => {
            const index = this.onErrorCallbacks.indexOf(callback);
            if (index > -1) {
                this.onErrorCallbacks.splice(index, 1);
            }
        };
    }

    onConnect(callback: () => void): () => void {
        this.onConnectCallbacks.push(callback);
        return () => {
            const index = this.onConnectCallbacks.indexOf(callback);
            if (index > -1) {
                this.onConnectCallbacks.splice(index, 1);
            }
        };
    }

    onDisconnect(callback: () => void): () => void {
        this.onDisconnectCallbacks.push(callback);
        return () => {
            const index = this.onDisconnectCallbacks.indexOf(callback);
            if (index > -1) {
                this.onDisconnectCallbacks.splice(index, 1);
            }
        };
    }

    // ==========================================================================
    // Private Methods
    // ==========================================================================

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            console.log('🔌 Generation WebSocket connected');
            this.onConnectCallbacks.forEach(cb => cb());
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Generation WebSocket disconnected');
            this.onDisconnectCallbacks.forEach(cb => cb());
        });

        this.socket.on('error', (data: { message: string }) => {
            console.error('WebSocket error:', data.message);
            this.onErrorCallbacks.forEach(cb => cb(new Error(data.message)));
        });

        this.socket.on('progress', (event: GenerationProgressEvent) => {
            const callbacks = this.onProgressCallbacks.get(event.requestId);
            callbacks?.forEach(cb => cb(event));
        });

        this.socket.on('queueStatus', (event: QueueStatusEvent & { requestId: number }) => {
            const callbacks = this.onQueueStatusCallbacks.get(event.queuePosition);
            callbacks?.forEach(cb => cb(event));
        });

        this.socket.on('requestComplete', (event: RequestCompleteEvent) => {
            const callbacks = this.onCompleteCallbacks.get(event.requestId);
            callbacks?.forEach(cb => cb(event));
        });

        this.socket.on('subscribed', ({ requestId }: { requestId: number }) => {
            console.log(`📡 Subscribed to generation request ${requestId}`);
        });

        this.socket.on('unsubscribed', ({ requestId }: { requestId: number }) => {
            console.log(`📡 Unsubscribed from generation request ${requestId}`);
        });
    }
}

// =============================================================================
// React Hook
// =============================================================================

import { useEffect, useState, useRef, useCallback } from 'react';

export function useGenerationProgress(requestId: number | null) {
    const [progress, setProgress] = useState<GenerationProgressEvent | null>(null);
    const [queueStatus, setQueueStatus] = useState<QueueStatusEvent | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const clientRef = useRef<GenerationProgressClient | null>(null);

    const connect = useCallback(async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError('No authentication token');
            return;
        }

        try {
            const client = new GenerationProgressClient(apiUrl, token);
            await client.connect();
            clientRef.current = client;
            setIsConnected(true);
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            clientRef.current?.disconnect();
        };
    }, [connect]);

    useEffect(() => {
        const client = clientRef.current;
        if (!client || !requestId || !isConnected) return;

        // Subscribe to this request
        client.subscribe(requestId);

        // Set up callbacks
        const unsubProgress = client.onProgress(requestId, (event) => {
            setProgress(event);
            if (event.error) {
                setError(event.error);
            }
        });

        const unsubQueue = client.onQueueStatus(requestId, (event) => {
            setQueueStatus(event);
        });

        const unsubComplete = client.onComplete(requestId, (event) => {
            setIsComplete(true);
            if (!event.success) {
                setError(`${event.failedImages} images failed to generate`);
            }
        });

        const unsubError = client.onError((err) => {
            setError(err.message);
        });

        return () => {
            unsubProgress();
            unsubQueue();
            unsubComplete();
            unsubError();
            client.unsubscribe(requestId);
        };
    }, [requestId, isConnected]);

    return {
        progress,
        queueStatus,
        isComplete,
        error,
        isConnected,
        reset: () => {
            setProgress(null);
            setQueueStatus(null);
            setIsComplete(false);
            setError(null);
        },
    };
}

// =============================================================================
// Singleton Instance
// =============================================================================

let globalClient: GenerationProgressClient | null = null;

export function getGenerationProgressClient(): GenerationProgressClient | null {
    return globalClient;
}

export async function initGenerationProgressClient(
    apiUrl: string,
    token: string,
): Promise<GenerationProgressClient> {
    if (globalClient) {
        globalClient.disconnect();
    }

    globalClient = new GenerationProgressClient(apiUrl, token);
    await globalClient.connect();
    return globalClient;
}
