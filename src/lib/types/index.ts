type ENVType = 'production' | 'development' | true | false;

interface IClientDetector {
    userId?: string;
    send: () => Promise<any>;
    setUserId: (userId: string) => any;
}

interface ClientDetectorGlobalParam {
    serviceName: string; // 
    userId?: string;
    buryId?: string;
}

interface DeviceInfo {
    os: string;
    osVersion: string;
    browserName: string;
    browserVersion: string;
    isMobile: boolean;
    screenSizeWidth: number;
    screenSizeHeight: number;
    windowSizeWidth: number;
    windowSizeHeight: number;
    userAgent: string;
    platform: string;
    language: string;
    isWeChart: boolean;
    gpu: string;
    // 1.2.0 add
    printWater: string;
    // 1.3.0 add
    executeTimestamp: string;
    performanceNow: string;
    location: string;
}

type ErrorInfo = DeviceInfo | {
    errorName: string;
    errorMessage: string;
    errorLevel: number;
    errorStack: string;
    errorComponentStack: string;
    actionKey: string;
}

type ActionInfo = DeviceInfo | {
    log: string;
    actionKey: string;
}

type SendErrorType = (error: Error | string, errorComponentStack?: string) => Promise<void>;

type logType = (message?: any, ...optionalParams: any[]) => string;

interface Detector {
    userId: string | undefined;
    serviceHost: string;
    send: <T>(eventName: string, data: T) => Promise<void>;
    setUserId: (userId: string) => void;
    setFingerprint: () => Promise<void>;
    sendClientInfo: () => Promise<void>;
    sendError: (error: Error | string, errorComponentStack?: string, level?: number, maxLength?: number) => Promise<void>;
    sendError0: (error: Error | string, errorComponentStack?: string, maxLength?: number) => Promise<void>;
    sendError1: (error: Error | string, errorComponentStack?: string, maxLength?: number) => Promise<void>;
    sendError2: (error: Error | string, errorComponentStack?: string, maxLength?: number) => Promise<void>;
    sendError3: (error: Error | string, errorComponentStack?: string, maxLength?: number) => Promise<void>;
    sendAction: (log: string, actionKey: string) => Promise<void>;
}

export type {
    ENVType,
    SendErrorType,
    ErrorInfo,
    ActionInfo,
    DeviceInfo,
    ClientDetectorGlobalParam,
    IClientDetector,
    logType,
    Detector
}


