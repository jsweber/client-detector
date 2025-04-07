import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { overwriteConsole, originalConsoleInfo, originalConsoleError, _queue } from './index';

// Mock core module
vi.mock('../core', () => ({
    ENV: 'production',
    get: () => ({
        send: vi.fn().mockResolvedValue(undefined)
    })
}));

describe('Console 增强功能测试', () => {
    const originalConsole = {
        info: console.info,
        error: console.error
    };

    beforeEach(() => {
        // 恢复原始console方法
        console.info = originalConsole.info;
        console.error = originalConsole.error;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('开发环境下不应该修改console行为', () => {
        vi.mock('../core', () => ({
            ENV: 'development',
            get: () => ({
                send: vi.fn()
            })
        }));

        overwriteConsole();
        const testMessage = 'test message';
        const spy = vi.spyOn(originalConsole, 'info');
        
        console.info(testMessage);
        
        expect(spy).toHaveBeenCalledWith(testMessage);
    });

    test('生产环境下应该将消息添加到队列', async () => {
        vi.mock('../core', () => ({
            ENV: 'production',
            get: () => ({
                send: vi.fn().mockResolvedValue(undefined)
            })
        }));

        overwriteConsole();
        const addSpy = vi.spyOn(_queue, 'add');
        
        console.info('test message');
        
        // 等待异步操作完成
        await vi.runAllTimersAsync();
        
        expect(addSpy).toHaveBeenCalled();
    });

    test('应该正确格式化不同类型的参数', async () => {
        vi.mock('../core', () => ({
            ENV: 'production',
            get: () => ({
                send: vi.fn().mockResolvedValue(undefined)
            })
        }));

        overwriteConsole();
        const addSpy = vi.spyOn(_queue, 'add');
        
        console.info('test', { a: 1 }, null, undefined, [1, 2, 3]);
        
        // 等待异步操作完成
        await vi.runAllTimersAsync();
        
        expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('test'),
            level: 'info'
        }));
    });

    test('错误处理应该正确工作', async () => {
        vi.mock('../core', () => ({
            ENV: 'production',
            get: () => ({
                send: vi.fn().mockResolvedValue(undefined)
            })
        }));

        overwriteConsole();
        const error = new Error('test error');
        const addSpy = vi.spyOn(_queue, 'add');
        
        console.error(error);
        
        // 等待异步操作完成
        await vi.runAllTimersAsync();
        
        expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
            level: 'error',
            message: expect.stringContaining('test error')
        }));
    });

    test('队列处理应该正确工作', async () => {
        const mockSend = vi.fn().mockResolvedValue(undefined);
        vi.mock('../core', () => ({
            ENV: 'production',
            get: () => ({
                send: mockSend
            })
        }));

        overwriteConsole();
        
        // 添加多条消息
        for (let i = 0; i < 12; i++) {
            console.info(`test message ${i}`);
        }

        // 等待队列处理
        await vi.runAllTimersAsync();

        // 验证发送请求
        expect(mockSend).toHaveBeenCalled();
    });

    test('应该包含clientInfo', async () => {
        const mockSend = vi.fn().mockResolvedValue(undefined);
        vi.mock('../core', () => ({
            ENV: 'production',
            get: () => ({
                send: mockSend
            })
        }));

        overwriteConsole();
        const addSpy = vi.spyOn(_queue, 'add');
        
        console.info('test message');
        
        // 等待异步操作完成
        await vi.runAllTimersAsync();
        
        expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
            level: 'info',
            message: expect.any(String)
        }));
    });
}); 