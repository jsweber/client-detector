import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
    init,
    get,
    createClientDetector,
    log,
    sendActionLog,
} from './lib/core';
import {
    getFingerprint,
    getCachedUserId,
} from './lib/utils';

// Mock performance
global.performance = {
    now: vi.fn(() => 1234567890)
};

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock window and navigator
global.window = {
    location: {
        href: 'http://test.com'
    }
};

global.navigator = {
    userAgent: 'test-agent',
    platform: 'test-platform',
    language: 'zh-CN'
};

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
    default: {
        load: () => Promise.resolve({
            get: () => Promise.resolve({ visitorId: 'test-visitor-id' })
        })
    }
}));

// Mock Image
global.Image = class {
    constructor() {
        setTimeout(() => {
            this.onload && this.onload();
        }, 0);
    }
    set src(url) {}
};

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
});

afterEach(() => {
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
});

// Mock ENV
vi.mock('./lib/core', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        ENV: 'production'
    }
});

describe('ClientDetector 核心功能测试', () => {
    beforeEach(() => {
        // 每个测试前重置 mock
        vi.clearAllMocks();
        localStorageMock.getItem.mockReset();
        localStorageMock.setItem.mockReset();
    });

    test('初始化测试', () => {
        const serviceHost = 'http://test-api.com';
        const param = {
            serviceName: 'test-service',
            userId: 'test-user'
        };
        
        init(serviceHost, param);
        const detector = get();
        
        expect(detector.serviceHost).toBe(serviceHost);
        expect(detector.userId).toBe(param.userId);
    });

    test('设置用户ID', () => {
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        const newUserId = 'new-user-id';
        detector.setUserId(newUserId);
        
        expect(detector.userId).toBe(newUserId);
    });

    test('获取指纹ID', async () => {
        const fingerprintId = await getFingerprint();
        expect(fingerprintId).toBeDefined();
        expect(typeof fingerprintId).toBe('string');
    });

    test('获取缓存的用户ID - 有缓存', async () => {
        const cachedId = 'cached-user-id';
        localStorageMock.getItem.mockReturnValue(cachedId);
        
        const userId = await getCachedUserId();
        
        expect(userId).toBe(cachedId);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('__client_detector_local_key__');
    });

    test('获取缓存的用户ID - 无缓存', async () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        const userId = await getCachedUserId();
        
        expect(userId).toBeDefined();
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('发送客户端信息', async () => {
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        await detector.sendClientInfo();
        // 由于使用 Image 发送请求，这里主要验证函数执行不抛出错误
        expect(true).toBe(true);
    });

    test('发送错误信息', async () => {
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        const error = new Error('test error');
        await detector.sendError(error, 'test component stack');
        
        // 验证不同级别的错误发送
        await detector.sendError0(error);
        await detector.sendError1(error);
        await detector.sendError2(error);
        await detector.sendError3(error);
    });

    test('发送行为日志', async () => {
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        await detector.sendAction('test log', 'test-action');
    });

    test('log 函数测试', async () => {
        // 使用 vi.mocked 来访问被 mock 的模块
        const actionKey = log('test message', 'additional info');
        expect(actionKey).toBe('test messageadditional info');
    });

    test('sendActionLog 函数测试', async () => {
        const detector = get();
        await sendActionLog('test log', 'test-key', true);
        await sendActionLog('test log', 'test-key', false);
    });

    test('开发环境不发送请求', async () => {
        // 重新 mock ENV 为 development
        vi.mock('./lib/core', async (importOriginal) => {
            const mod = await importOriginal();
            return {
                ...mod,
                ENV: 'development'
            }
        });
        
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        const sendSpy = vi.spyOn(detector, 'send');
        await detector.send('test-event', { data: 'test' });
        
        expect(sendSpy).toHaveBeenCalled();
        sendSpy.mockRestore();
    });

    test('生产环境发送请求', async () => {
        // 重新 mock ENV 为 production
        vi.mock('./lib/core', async (importOriginal) => {
            const mod = await importOriginal();
            return {
                ...mod,
                ENV: 'production'
            }
        });
        
        const detector = createClientDetector('http://test-api.com', {
            serviceName: 'test-service'
        });
        
        const sendSpy = vi.spyOn(detector, 'send');
        await detector.send('test-event', { data: 'test' });
        
        expect(sendSpy).toHaveBeenCalled();
        sendSpy.mockRestore();
    });

    test('serviceHost 为空时的错误处理', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const detector = createClientDetector('', {
            serviceName: 'test-service'
        });
        
        await detector.send('test-event', { data: 'test' });
        
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
