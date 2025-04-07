import { collect } from './api';
import { EventNameEnums } from './enums';
import type {
    ENVType,
    ClientDetectorGlobalParam,
    Detector,
    DeviceInfo,
    ErrorInfo,
    ActionInfo,
    logType
} from './types';
import {
    createTimestamp,
    DefaultUserId,
    getCachedUserId,
    getClientInfo,
} from './utils';

export let ENV: ENVType = 'production';

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
            if ((typeof ENV === 'string' && ENV !== 'production') || (typeof ENV === 'boolean' && !ENV)) {
                // console.log('[ClientDetector info]', 'ENV is development, detector will not send request.')
                return;
            }
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
        async sendError(err: Error | string, errorComponentStack = '', level = 2) {
            try {
                const error = err instanceof Error ? err : (new Error(err));
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

        async sendError0(error: Error | string, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 0);
        },
        async sendError1(error: Error | string, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 1);
        },
        async sendError2(error: Error | string, errorComponentStack = '') {
            ClientDetector.sendError(error, errorComponentStack, 2);
        },
        async sendError3(error: Error | string, errorComponentStack = '') {
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

export const log: logType = (...args) => {
    const actionKey = args.join('');
    if ((typeof ENV === 'string' && ENV === 'production') || (typeof ENV === 'boolean' && ENV)) {
        const strArgs = (args || []).join('\n ');
        sendActionLog(strArgs, actionKey);
    }

    return actionKey;
}
