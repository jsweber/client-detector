import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type { DeviceInfo } from '../types';

export const DefaultText = 'Unknown';

export const createTimestamp = (): string => {
    return Date.now() + '';
}

export const getBrowserVersion = (): string => {
    const Sys = {
        ie: '',
        edge: '',
        firefox: '',
        opera: '',
        chrome: '',
        safari: ''
    }; 
    const ua = navigator.userAgent.toLowerCase(); 
    let s; 
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
    (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] : 
    (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
    (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] : 
    (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] : 
    (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] : 
    (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0; 
    // 根据关系进行判断
    if (Sys.ie) return ('IE: ' + Sys.ie); 
    if (Sys.edge) return ('EDGE: ' + Sys.edge);
    if (Sys.firefox) return ('Firefox: ' + Sys.firefox); 
    if (Sys.chrome) return ('Chrome: ' + Sys.chrome); 
    if (Sys.opera) return ('Opera: ' + Sys.opera); 
    if (Sys.safari) return ('Safari: ' + Sys.safari);
    return DefaultText; //1.0.8版本以前有问题，搜集的是Unkonwn
}

export const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if(userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1){
        return 'Opera';
    }
    else if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1){
        return 'IE';
    }
    else if(userAgent.indexOf("Edge") > -1){
        return 'Edge';
    }
    else if(userAgent.indexOf("Firefox") > -1){
        return 'Firefox';
    }
    else if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1){
        return 'Safari';
    }
    else if(userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1){
        return 'Chrome';
    }
    else if("ActiveXObject" in window){
        return 'IE>=11';
    }
    else{
        return DefaultText; //1.0.8版本以前有问题，搜集的是Unkonwn
    }
}

export interface ISize {
    width: number; height: number;
}

export const getScreenSize = (): ISize => {
    if (window.screen) {
        return {
            width: window.screen.width,
            height: window.screen.height
        }
    }

    return {
        width: 0,
        height: 0
    }
}

export const getWindowSize = (): ISize => {
    if (window) {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    return {
        width: 0,
        height: 0
    }
}

export const isMobile = (): boolean => {
    if (
        navigator.userAgent.match(/Mobi/i) ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i)
    ) {
        // 当前设备是移动设备
        return true;
    }

    return false;
}

export const getOSInfo = (): {name: string, version: string} => {
    const userAgent = navigator.userAgent;  
    const osInfo = { name: DefaultText, version: DefaultText };  
    
    if (/windows nt 10\.0/i.test(userAgent)) {  
        osInfo.name = 'Windows';  
        osInfo.version = '10';  
    } else if (/windows nt 6\.3/i.test(userAgent)) {  
        // Windows 8.1 的 userAgent 通常包含 "Windows NT 6.3"  
        osInfo.name = 'Windows';  
        osInfo.version = '8.1';  
    } else if (/windows nt 6\.2/i.test(userAgent)) {  
        osInfo.name = 'Windows';  
        osInfo.version = '8';  
    } else if (/windows nt 6\.1/i.test(userAgent)) {  
        osInfo.name = 'Windows';  
        osInfo.version = '7';  
    } else if (/macintosh|mac os x/i.test(userAgent)) {  
        osInfo.name = 'Mac';  
        // Mac OS X 的 userAgent 中可能包含具体的版本号，需要进一步解析  
        const match = /mac os x (\d+)_(\d+)/.exec(userAgent);  
        if (match) {  
            osInfo.version = match[1] + '.' + match[2];  
        }  
    } else if (/android/i.test(userAgent)) {  
        osInfo.name = 'Android';  
        // Android 的 userAgent 也可能包含版本信息，解析方法类似于 Mac OS X
        const match = /Android\s+(\d+)\.(\d+)\.(\d+)/.exec(userAgent);  
        if (match) {  
            osInfo.version = match[1] + '.' + match[2] + '.' + match[3];  
        } else {  
            // 有些Android userAgent可能不会包含详细的版本号  
            var simpleMatch = /Android\s+(\d+)\.(\d+)/.exec(userAgent);  
            if (simpleMatch) {  
                osInfo.version = simpleMatch[1] + '.' + simpleMatch[2];  
            }  
        }
    } else if (/iphone|ipad|ipod/i.test(userAgent) && /os (\d+)_(\d+)/.test(userAgent)) {  
        osInfo.name = 'iOS';  
        // iOS 的 userAgent 中版本号格式为 "OS X_Y"，其中 X 是主版本号，Y 是次版本号  
        const match = /OS (\d+)_(\d+)(?:_(\d+))?/.exec(userAgent);  
        if (match) {  
            osInfo.version = match[1] + '.' + match[2] + (match[3] ? '.' + match[3] : '');  
        }
    } else if (/Linux/.test(navigator.platform)) {  
        osInfo.name = 'Linux';  
        // Linux userAgent或platform通常不包含具体的版本号  
        // 如果需要更详细的版本信息，可能需要借助其他方法或API  
    }  

    return osInfo;
}

export const isWeChart = () => {
    return /MicroMessenger/i.test(window.navigator.userAgent);
}

export const getGPU = (): string => {
    let GPUInfo = DefaultText

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const gpuText: string = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (gpuText) {
                    GPUInfo = gpuText;
                }
            }
        }
    } catch (err: any) {
        console.warn('[ClientDetector warn]', err);
    } finally {
        return GPUInfo;
    }
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

export const getClientInfo = async (): Promise<DeviceInfo> => {
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

/**
 * 获取请求的url
 * @param obj AxiosError | AxiosResponse
 * @returns api url
 */
export const getRequestUrl = (obj: any): string => {
    try {
        return obj?.request?.responseURL || obj?.config?.url || obj?.config?.baseURL || 'unknown api';
    } catch (error) {
        return 'unknown api';
    }
}

/**
 * 截断过长的字符串
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @returns 截断后的字符串
 */
export const truncateString = (str: string, maxLength: number = 2000): string => {
    if (!str || str.length <= maxLength) return str;
    
    // 保留前半部分和后半部分，中间用省略号代替
    const halfLength = Math.floor(maxLength / 2) - 15;
    return `${str.substring(0, halfLength)}...truncated ${str.length - maxLength} chars...${str.substring(str.length - halfLength)}`;
};
