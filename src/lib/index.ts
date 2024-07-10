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
        eventName:`fe_bury_sdk_${eventName}`,
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
}

export type ErrorInfo = DeviceInfo | {
    errorName: string;
    errorMessage: string;
    errorStack: string;
    errorComponentStack: string;
}

export const DefaultUserId = 'visitor';

export const getFingerprint = async (): Promise<string> => {
    let id = DefaultUserId;
    try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        id = result.visitorId;
    } catch(err){
        console.warn('[ClientDetector warn]', err);
    }finally {
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

const getClientInfo = (): DeviceInfo => {
    const {name: os, version: osVersion} = getOSInfo();
    const screenSize = getScreenSize();
    const windowSize = getWindowSize();
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
        gpu: getGPU()
    }

    return info;
}

export const createClientDetector = (serviceHost: string, param: ClientDetectorGlobalParam) => {
    const {
        serviceName,
        userId,
        buryId,
    } = param;

    const ClientDetector = {
        userId,
        serviceHost,
        async send<T = any>(eventName: string, data: T) {
            try {
                const param = createCollectInfo({
                    serviceName,
                    eventName,
                    userId: this.userId || DefaultUserId,
                    buryId,
                    data
                });
                await collect<T>(this.serviceHost, param);
            } catch(err) {
                console.warn('[ClientDetector warn]', err);
            }
        },
        setUserId(userId: string) {
            this.userId = userId;
        },
        async setFingerprint() {
            const id = await getCachedUserId();
            this.userId = id;
        },
        async sendClientInfo() {
            try{
                const info = getClientInfo();
                this.send<DeviceInfo>(EventNameEnums.collectClientInfo, info);
            }catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },
        /**
         * 
         * @param error javascript error instance
         * @param errorComponentStack if you are using react or vue, you pass it.
         */
        async sendError(error: Error, errorComponentStack: string = '') {
            try{
                const info = {
                    ...getClientInfo(),
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack || '',
                    errorComponentStack
                };
                this.send<ErrorInfo>(EventNameEnums.collectErrorInfo, info);
            }catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },
    }

    return ClientDetector;
}
