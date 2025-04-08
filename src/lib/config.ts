
import type { ENVType } from './types';

export let ENV: ENVType = 'production';

export const setENV = (env: ENVType) => {
    ENV = env;
}

export const getENV = () => {
    return ENV;
}

export const isDev = () => {
    return (typeof ENV === 'string' && ENV !== 'production') || 
    (typeof ENV === 'boolean' && !ENV);
}

export const isProd = () => {
    return (typeof ENV === 'string' && ENV === 'production') || (typeof ENV === 'boolean' && ENV)
}
