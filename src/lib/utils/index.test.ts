// @ts-nocheck
vi.mock('../utils', async () => {
    // 导入原始模块
    const actual = await vi.importActual('../utils');
    
    // 覆盖特定函数
    return {
        ...actual,
        getClientInfo: vi.fn().mockResolvedValue({
            os: 'test-os',
            browserName: 'test-browser',
            osVersion: 'test-os-version',
            browserVersion: 'test-browser-version',
            isMobile: false,
            screenSizeWidth: 1920,
            screenSizeHeight: 1080,
            windowSizeWidth: 1920,
            windowSizeHeight: 1080,
            userAgent: 'test-user-agent',
            platform: 'test-platform',
            language: 'test-language',
            isWeChart: false,
            gpu: 'test-gpu',
            printWater: 'test-print-water',
            executeTimestamp: 'test-timestamp',
            performanceNow: 'test-performance',
            location: 'test-location'
        }),
        getGPU: vi.fn().mockReturnValue('test-gpu'),
        isWeChart: vi.fn().mockReturnValue(false) // 明确模拟这个函数
    };
}); 