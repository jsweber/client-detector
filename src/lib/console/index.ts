import { ENV, get } from '../core';
import { getClientInfo } from '../utils';
import { EventNameEnums } from '../enums';

interface QueueItem {
    level: 'info' | 'error';
    message: string;
    timestamp: number;
    clientInfo?: any;
}

class ConsoleQueue {
    private queue: QueueItem[] = [];
    private isProcessing = false;
    private readonly maxBatchSize = 10;
    private readonly maxWaitTime = 5000; // 5秒
    private lastProcessTime = Date.now();
    private cachedClientInfo: any = null;

    constructor() {
        this.initClientInfo();
    }

    private async initClientInfo() {
        try {
            this.cachedClientInfo = await getClientInfo();
        } catch (error) {
            originalConsole.error('[ClientDetector initClientInfo error]', error);
        }
    }

    public async add(item: QueueItem) {
        try {
            if (!this.cachedClientInfo) {
                await this.initClientInfo();
            }
            
            this.queue.push({
                ...item,
                clientInfo: this.cachedClientInfo
            });
            this.scheduleProcess();
        } catch (error) {
            originalConsole.error('[ClientDetector queue add error]', error);
        }
    }

    private scheduleProcess() {
        try {
            if (this.isProcessing) return;

            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => this.processQueue(), { timeout: 1000 });
            } else {
                setTimeout(() => this.processQueue(), 0);
            }
        } catch (error) {
            originalConsole.error('[ClientDetector scheduleProcess error]', error);
        }
    }

    private async processQueue() {
        try {
            if (this.isProcessing || this.queue.length === 0) return;

            this.isProcessing = true;
            const currentTime = Date.now();
            const timeElapsed = currentTime - this.lastProcessTime;

            if (this.queue.length >= this.maxBatchSize || timeElapsed >= this.maxWaitTime) {
                const batch = this.queue.splice(0, this.maxBatchSize);
                const detector = get();

                if (!detector || typeof detector.send !== 'function') {
                    throw new Error('Detector not properly initialized');
                }

                try {
                    await detector.send(EventNameEnums.collectConsoleInfo, {
                        logs: batch.map(item => ({
                            level: item.level,
                            message: item.message,
                            timestamp: item.timestamp,
                            clientInfo: item.clientInfo
                        }))
                    });
                } catch (error) {
                    this.queue.unshift(...batch);
                    originalConsole.error('[ClientDetector queue send error]', error);
                }

                this.lastProcessTime = Date.now();
            }

            this.isProcessing = false;

            if (this.queue.length > 0) {
                this.scheduleProcess();
            }
        } catch (error) {
            this.isProcessing = false;
            originalConsole.error('[ClientDetector processQueue error]', error);
        }
    }
}

const queue = new ConsoleQueue();

function formatArgs(...args: any[]): string {
    try {
        return args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    } catch (error) {
        originalConsole.error('[ClientDetector formatArgs error]', error);
        return String(args);
    }
}

const originalConsole = {
    info: console.info.bind(console),
    error: console.error.bind(console)
};

function createEnhancedConsole() {
    return {
        info: function(...args: any[]) {
            try {
                if ((typeof ENV === 'string' && ENV !== 'production') || 
                    (typeof ENV === 'boolean' && !ENV) || 
                    typeof window === 'undefined') {
                    return originalConsole.info(...args);
                }

                queue.add({
                    level: 'info',
                    message: formatArgs(...args),
                    timestamp: Date.now()
                });

                originalConsole.info(...args);
            } catch (error) {
                originalConsole.error('[ClientDetector console.info error]', error);
                originalConsole.info(...args);
            }
        },

        error: function(...args: any[]) {
            try {
                if ((typeof ENV === 'string' && ENV !== 'production') || 
                    (typeof ENV === 'boolean' && !ENV) || 
                    typeof window === 'undefined') {
                    return originalConsole.error(...args);
                }

                queue.add({
                    level: 'error',
                    message: formatArgs(...args),
                    timestamp: Date.now()
                });

                originalConsole.error(...args);
            } catch (error) {
                originalConsole.error('[ClientDetector console.error error]', error);
                originalConsole.error(...args);
            }
        }
    };
}

export function overwriteConsole() {
    try {
        const enhancedConsole = createEnhancedConsole();
        console.info = enhancedConsole.info;
        console.error = enhancedConsole.error;
    } catch (error) {
        originalConsole.error('[ClientDetector overwriteConsole error]', error);
        console.info = originalConsole.info;
        console.error = originalConsole.error;
    }
}

export const originalConsoleInfo = originalConsole.info;
export const originalConsoleError = originalConsole.error;

export const _queue = queue;
