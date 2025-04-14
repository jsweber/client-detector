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
    truncateString
} from './utils';
import { setENV, isDev, isProd } from './config';
import { overwriteConsole } from './console';

// 添加一个常量定义错误堆栈的最大长度
export const DEFAULT_ERROR_STACK_MAX_LENGTH = 2000;

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
            if (isDev()) {
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
         * @param level error level (0-3)
         * @param maxLength maximum total length for error stack traces, default is 2000
         */
        async sendError(err: Error | string, errorComponentStack = '', level = 2, maxLength = DEFAULT_ERROR_STACK_MAX_LENGTH) {
            try {
                const error = err instanceof Error ? err : (new Error(err));
                const clientInfo = await getClientInfo();
                
                // 获取错误堆栈和组件堆栈
                const errorStack = error.stack || '';
                
                // 计算两者的总长度与最大长度的差值
                const totalLength = errorStack.length + errorComponentStack.length;
                const excessLength = Math.max(0, totalLength - maxLength);
                
                let truncatedErrorStack = errorStack;
                let truncatedComponentStack = errorComponentStack;
                
                // 定义半长阈值，用于判断一个堆栈是否算"短"
                const halfMaxLength = maxLength / 2;
                
                // 如果总长度超出最大限制
                if (excessLength > 0) {
                    // 如果其中一个未超出阈值，则优先保留未超出的部分
                    if (errorStack.length <= halfMaxLength && errorComponentStack.length > halfMaxLength) {
                        // errorStack 短，将剩余空间分配给 errorComponentStack
                        const remainingLength = maxLength - errorStack.length;
                        truncatedComponentStack = truncateString(errorComponentStack, remainingLength);
                    } else if (errorComponentStack.length <= halfMaxLength && errorStack.length > halfMaxLength) {
                        // errorComponentStack 短，将剩余空间分配给 errorStack
                        const remainingLength = maxLength - errorComponentStack.length;
                        truncatedErrorStack = truncateString(errorStack, remainingLength);
                    } else {
                        // 两者都超出或都未超出阈值，按比例分配
                        const errorStackRatio = errorStack.length / totalLength;
                        const errorStackMaxLength = Math.floor(maxLength * errorStackRatio);
                        const componentStackMaxLength = maxLength - errorStackMaxLength;
                        
                        truncatedErrorStack = truncateString(errorStack, errorStackMaxLength);
                        truncatedComponentStack = truncateString(errorComponentStack, componentStackMaxLength);
                    }
                }
                // 如果总长度未超出，则保持原样
                
                const info = {
                    ...clientInfo,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorLevel: level,
                    errorStack: truncatedErrorStack,
                    errorComponentStack: truncatedComponentStack
                };
                ClientDetector.send<ErrorInfo>(EventNameEnums.collectErrorInfo, info);
            } catch (err) {
                console.warn('[ClientDetector warn]', err);
            }
        },

        async sendError0(error: Error | string, errorComponentStack = '', maxLength = DEFAULT_ERROR_STACK_MAX_LENGTH) {
            ClientDetector.sendError(error, errorComponentStack, 0, maxLength);
        },
        async sendError1(error: Error | string, errorComponentStack = '', maxLength = DEFAULT_ERROR_STACK_MAX_LENGTH) {
            ClientDetector.sendError(error, errorComponentStack, 1, maxLength);
        },
        async sendError2(error: Error | string, errorComponentStack = '', maxLength = DEFAULT_ERROR_STACK_MAX_LENGTH) {
            ClientDetector.sendError(error, errorComponentStack, 2, maxLength);
        },
        async sendError3(error: Error | string, errorComponentStack = '', maxLength = DEFAULT_ERROR_STACK_MAX_LENGTH) {
            ClientDetector.sendError(error, errorComponentStack, 3, maxLength);
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

export const init = (serviceHost: string, param: ClientDetectorGlobalParam, env: ENVType = 'production', isOverwriteConsole: boolean = true) => {
    detector = createClientDetector(serviceHost, param);
    setENV(env);
    if (env === 'production' || env === true) {
        overwriteConsole(isOverwriteConsole);
    }
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
    if (isProd()) {
        const strArgs = (args || []).join('\n ');
        sendActionLog(strArgs, actionKey);
    }

    return actionKey;
}
