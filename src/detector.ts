import { createClientDetector } from './lib';
const serviceHost = 'https://openxlab.org.cn/gw/data-bury'; // 服务请求地址
const serviceName = 'test-service'; // 必须唯一，找管理员查询
const userId = 'visitor'; // 用户id，可选
const buryId = ''; // 可选

export const clientDetector = createClientDetector(serviceHost,{
    serviceName,
    userId,
    buryId
});
