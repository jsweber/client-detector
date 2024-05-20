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
    isWeChart
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
}

export const DefaultUserId = 'visitor';

export const createClientDetector = (serviceHost: string, param: ClientDetectorGlobalParam) => {
    const {
        serviceName,
        userId,
        buryId
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
        async sendClientInfo() {
            try{
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
                    isWeChart: isWeChart()
                }
                this.send<DeviceInfo>(EventNameEnums.collectClientInfo, info);
            }catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        }
    }

    return ClientDetector;
}
