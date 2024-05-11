import { collect, ICollectData } from './api';
import { EventNameEnums } from './enums';
import {
    createTimestamp,
    getBrowserVersion,
    getBrowserName,
    getOSInfo,
    getScreenSize,
    getWindowSize,
    isMobile
} from './utils';

export interface IClientDetector {
    collectApi: string;
    userId?: string;
    send: () => Promise<any>;
    setUserId: (userId: string) => any;
}

export interface ClientDetectorGlobalParam {
    collectApi: string;
    serviceName: string;
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
        eventName:`${serviceName}_${eventName}`,
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
}

export const createClientDetector = (param: ClientDetectorGlobalParam) => {
    const {
        collectApi,
        serviceName,
        userId,
        buryId
    } = param;

    const ClientDetector = {
        collectApi,
        userId,
        async send<T = any>(eventName: string, data: T) {
            try {
                const param = createCollectInfo({
                    serviceName,
                    eventName,
                    userId: userId || this.userId,
                    buryId,
                    data
                });
                await collect<T>(this.collectApi, param);
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
                    language: navigator.language
                }
                this.send<DeviceInfo>(EventNameEnums.collectClientInfo, info);
            }catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        }
    }

    return ClientDetector;
}
