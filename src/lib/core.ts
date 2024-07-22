import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { collect } from './api';
import { EventNameEnums } from './enums';
import {
    createTimestamp,
    getBrowserVersion,
    getBrowserName,
    getOSInfo,
    getScreenSize,
    getWindowSize,
    isMobile,
    isWeChart,
    getGPU
} from './utils';

export interface IClientDetector {
    userId?: string;
    send: () => Promise<any>;
    setUserId: (userId: string) => any;
}

export interface ClientDetectorGlobalParam {
    serviceName: string; // 
    userId?: string;
    buryId?: string;
}

export const createCollectInfo = <T>({
    serviceName,
    eventName,
    userId = '',
    buryId = '',
    data
}: {
    serviceName: string;
    eventName: string;
    userId?: string;
    buryId?: string;
    data: T
}) => {
    const timestamp = createTimestamp();

    const param = {
        buryId,
        serviceName,
        eventName: `fe_bury_sdk_${eventName}`,
        eventTimestamp: timestamp,
        operatorUid: userId,
        operatedObjInfo: {
            ...data
        }
    }

    return param;
}

export interface DeviceInfo {
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

export type ErrorInfo = DeviceInfo | {
    errorName: string;
    errorMessage: string;
    errorLevel: number;
    errorStack: string;
    errorComponentStack: string;
    actionKey: string;
}

export type ActionInfo = DeviceInfo | {
    log: string;
    actionKey: string;
}

export const DefaultUserId = 'visitor';

export const getFingerprint = async (): Promise<string> => {
    let id = DefaultUserId;
    try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        id = result.visitorId;
    } catch (err) {
        console.warn('[ClientDetector warn]', err);
    } finally {
        return id;
    }
}

export const getCachedUserId = async (): Promise<string> => {
    const localKey = '__client_detector_local_key__';
    let id = localStorage.getItem(localKey);

    if (!id) {
        id = await getFingerprint();
        localStorage.setItem(localKey, id);
    }

    return id;
}

const getClientInfo = async (): Promise<DeviceInfo> => {
    const { name: os, version: osVersion } = getOSInfo();
    const screenSize = getScreenSize();
    const windowSize = getWindowSize();
    const printWater = await getCachedUserId();
    const performanceNow = performance ? performance.now() : Date.now();
    const info = {
        os,
        osVersion,
        browserName: getBrowserName(),
        browserVersion: getBrowserVersion(),
        isMobile: isMobile(),
        screenSizeWidth: screenSize.width,
        screenSizeHeight: screenSize.height,
        windowSizeWidth: windowSize.width,
        windowSizeHeight: windowSize.height,
        userAgent: navigator.userAgent.toLowerCase(),
        platform: navigator.platform,
        language: navigator.language,
        isWeChart: isWeChart(),
        gpu: getGPU(),
        // 1.2.0 add
        printWater,
        // 1.3.0 add
        executeTimestamp: (Date.now()).toString(),
        performanceNow: performanceNow.toString(),
        location: window.location.href
    }

    return info;
}

type SendErrorType = (error: Error, errorComponentStack?: string) => Promise<void>;
export interface Detector {
    userId: string | undefined;
    serviceHost: string;
    send: <T>(eventName: string, data: T) => Promise<void>;
    setUserId: (userId: string) => void;
    setFingerprint: () => Promise<void>;
    sendClientInfo: () => Promise<void>;
    sendError: (error: Error, errorComponentStack: string, level: number) => Promise<void>;
    sendError0: SendErrorType;
    sendError1: SendErrorType;
    sendError2: SendErrorType;
    sendError3: SendErrorType;
    sendAction: (log: string, actionKey: string) => Promise<void>;
}


export const createClientDetector = (serviceHost: string, param: ClientDetectorGlobalParam): Detector => {
    const {
        serviceName,
        userId,
        buryId,
    } = param;

    const ClientDetector: Detector = {
        userId,
        serviceHost,
        async send<T = any>(eventName: string, data: T) {
            if (!serviceHost) {
                console.error('[ClientDetector error]', 'serviceHost is empty, please init first!');
                return;
            }

            if (!serviceName) {
                console.error('[ClientDetector error]', 'serviceName is empty, please init first!');
                return;
            }

            try {
                const param = createCollectInfo({
                    serviceName,
                    eventName,
                    userId: ClientDetector.userId || DefaultUserId,
                    buryId,
                    data
                });
                await collect<T>(ClientDetector.serviceHost, param);
            } catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },
        setUserId(userId: string) {
            ClientDetector.userId = userId;
        },
        async setFingerprint() {
            const id = await getCachedUserId();
            ClientDetector.userId = id;
        },
        async sendClientInfo() {
            try {
                const info = await getClientInfo();
                ClientDetector.send<DeviceInfo>(EventNameEnums.collectClientInfo, info);
            } catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },
        /**
         * 
         * @param error javascript error instance
         * @param errorComponentStack if you are using react or vue, you pass it.
         */
        async sendError(error: Error, errorComponentStack = '', level = 2) {
            try {
                const clientInfo = await getClientInfo();
                const info = {
                    ...clientInfo,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorLevel: level,
                    errorStack: error.stack || '',
                    errorComponentStack
                };
                ClientDetector.send<ErrorInfo>(EventNameEnums.collectErrorInfo, info);
            } catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },

        async sendError0(error: Error, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 0);
        },
        async sendError1(error: Error, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 1);
        },
        async sendError2(error: Error, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 2);
        },
        async sendError3(error: Error, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 3);
        },

        async sendAction(log: string, actionKey: string) {
            try {
                const clientInfo = await getClientInfo();
                const info = {
                    ...clientInfo,
                    log,
                    actionKey
                };
                ClientDetector.send<ActionInfo>(EventNameEnums.collectActionLogInfo, info);
            } catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        }
    }

    return ClientDetector;
}

export let detector: Detector = createClientDetector('', {
    serviceName: ''
});

export type ENVType = 'production' | 'development';

export let ENV: ENVType = 'production';

export const init = (serviceHost: string, param: ClientDetectorGlobalParam, env: ENVType = 'production') => {
    detector = createClientDetector(serviceHost, param);
    ENV = env;
}

export const get = (): Detector => {
    return detector;
}

export const sendActionLog = async (log: string, actionKey: string, isSend: boolean = true) => {
    if (isSend && detector) {
        detector.sendAction(log, actionKey);
    } else {
        console.error(`[ClientDetector error]: detector is ${detector}`);
    }
}

export type logType = (message?: any, ...optionalParams: any[]) => string;

export const log: logType = (...args) => {
    const actionKey = args.join('');
    if (ENV === 'production') {
        const strArgs = (args || []).join('\n ');
        sendActionLog(strArgs, actionKey);
    }

    return actionKey;
}
