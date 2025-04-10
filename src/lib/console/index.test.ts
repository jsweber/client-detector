// @ts-nocheck
import { describe, test, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { overwriteConsole, originalConsoleInfo, originalConsoleError, _queue } from './index';
import * as configModule from '../config';
import * as coreModule from '../core';
import * as utilsModule from '../utils';

// 所有 mock 应该放在文件顶部
vi.mock('../core', () => ({
    get: vi.fn(),
    ENV: 'production'
}));

vi.mock('../config', () => ({
    isDev: vi.fn()
}));

vi.mock('../utils', () => ({
    getClientInfo: vi.fn()
}));

describe('Console 增强功能测试', () => {
    const originalConsole = {
        info: console.info,
        error: console.error
    };

    // 模拟 requestIdleCallback
    beforeAll(() => {
        window.requestIdleCallback = vi.fn((callback) => {
            setTimeout(() => callback({
                didTimeout: false,
                timeRemaining: () => 50
            }), 0);
            return 0;
        });
        
        // 模拟 Canvas API
        // 创建模拟的 canvas context
        const mockContext = {
            getImageData: vi.fn(() => ({ data: new Uint8Array([0, 0, 0, 0]) })),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 })),
            // 添加其他可能用到的 context 方法
        };
        
        // @ts-ignore
        HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

        // 模拟 navigator 对象
        Object.defineProperty(global, 'navigator', {
            value: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                platform: 'Win32',
                language: 'zh-CN',
                // 添加其他可能需要的属性
                languages: ['zh-CN', 'en-US'],
                vendor: 'Google Inc.',
                appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                appName: 'Netscape',
                appCodeName: 'Mozilla',
                hardwareConcurrency: 8,
                maxTouchPoints: 0,
                cookieEnabled: true,
                doNotTrack: null
            },
            writable: true
        });
    });

    beforeEach(() => {
        // 恢复原始console方法
        console.info = originalConsole.info;
        console.error = originalConsole.error;
        vi.useFakeTimers();
        
        // 重置模拟的默认返回值
        vi.mocked(configModule.isDev).mockReturnValue(false);
        // @ts-ignore
        vi.mocked(coreModule.get).mockReturnValue({
            send: vi.fn().mockResolvedValue(undefined)
        });
        // @ts-ignore
        vi.mocked(utilsModule.getClientInfo).mockResolvedValue({
            os: 'test-os',
            browserName: 'test-browser'
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('开发环境下不应该修改console行为', () => {
        // 改用 mockReturnValue 而不是 vi.mock
        vi.mocked(configModule.isDev).mockReturnValue(true);

        overwriteConsole();
        const testMessage = 'test message';
        const spy = vi.spyOn(originalConsole, 'info');
        
        console.info(testMessage);
        
        expect(spy).toHaveBeenCalledWith(testMessage);
    });

    test('生产环境下应该将消息添加到队列', async () => {
        // 使用 mockReturnValue
        vi.mocked(configModule.isDev).mockReturnValue(false);

        overwriteConsole();
        const addSpy = vi.spyOn(_queue, 'add');
        
        console.info('test message');
        
        // 等待异步操作完成
        await vi.runAllTimersAsync();
        
        expect(addSpy).toHaveBeenCalled();
    });

    test('应该正确格式化不同类型的参数', async () => {
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
            get: () => ({
                send: mockSend
            })
        }));

        overwriteConsole();
        
        // 添加多条消息以触发批量处理
        for (let i = 0; i < 12; i++) {
            console.info(`test message ${i}`);
        }

        // 等待队列处理
        await vi.runAllTimersAsync();

        // 验证发送请求
        expect(mockSend).toHaveBeenCalled();
    });

    test('队列在超时后应该自动发送', async () => {
        const mockSend = vi.fn().mockResolvedValue(undefined);
        vi.mock('../core', () => ({
            get: () => ({
                send: mockSend
            })
        }));

        overwriteConsole();
        
        // 添加一条消息
        console.info('test message');
        
        // 前进时间超过队列的最大等待时间
        await vi.advanceTimersByTimeAsync(6000);
        
        // 验证发送请求被调用
        expect(mockSend).toHaveBeenCalled();
    });

    test('在发送失败时消息应该重新加入队列', async () => {
        const mockSend = vi.fn().mockRejectedValue(new Error('Send failed'));
        vi.mock('../core', () => ({
            get: () => ({
                send: mockSend
            })
        }));

        const errorSpy = vi.spyOn(originalConsole, 'error');
        overwriteConsole();
        
        // 添加多条消息
        for (let i = 0; i < 10; i++) {
            console.info(`test message ${i}`);
        }

        // 等待队列处理
        await vi.runAllTimersAsync();

        // 验证错误被记录且消息重新入队
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ClientDetector queue send error]'),
            expect.any(Error)
        );
        
        // 等待下一次尝试
        mockSend.mockResolvedValue(undefined);
        await vi.advanceTimersByTimeAsync(6000);
        
        // 验证第二次尝试成功
        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test('客户端信息缓存机制应该正常工作', async () => {
        // 使用 mockReturnValue 代替 vi.mock
        const mockClientInfo = {
            os: 'cached-os',
            browserName: 'cached-browser'
        };
        vi.mocked(utilsModule.getClientInfo).mockResolvedValue(mockClientInfo);
        
        const mockSend = vi.fn().mockResolvedValue(undefined);
        vi.mocked(coreModule.get).mockReturnValue({
            send: mockSend
        });

        overwriteConsole();
        
        // 添加两批消息，确保客户端信息只获取一次
        for (let i = 0; i < 10; i++) {
            console.info(`batch 1 message ${i}`);
        }
        
        await vi.runAllTimersAsync();
        
        for (let i = 0; i < 10; i++) {
            console.info(`batch 2 message ${i}`);
        }
        
        await vi.runAllTimersAsync();
        
        // getClientInfo应该只被调用一次，因为应该使用缓存
        expect(utilsModule.getClientInfo).toHaveBeenCalledTimes(1);
    });

    test('RequestIdleCallback 应该被正确使用', async () => {
        const requestIdleCallbackSpy = vi.spyOn(window, 'requestIdleCallback');
        
        overwriteConsole();
        console.info('test message');
        
        expect(requestIdleCallbackSpy).toHaveBeenCalled();
    });

    test('当 detector 不可用时应该抛出错误', async () => {
        // 不用 vi.mock，而是使用 mockReturnValue
        vi.mocked(coreModule.get).mockReturnValue(null);
        
        const errorSpy = vi.spyOn(originalConsole, 'error');
        overwriteConsole();
        
        // 添加消息
        console.info('test message');
        
        // 等待队列处理
        await vi.runAllTimersAsync();
        
        // 验证错误被记录
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ClientDetector processQueue error]'),
            expect.any(Error)
        );
    });
}); 