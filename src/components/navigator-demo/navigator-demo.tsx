import { FC, ReactNode, useEffect } from 'react';
import { createClientDetector } from '../../lib';
import styles from './navigator-demo.module.less';

const serviceHost = 'https://openxlab.org.cn/gw/data-bury'; // 服务请求地址
const serviceName = 'test-service'; // 必须唯一，找管理员查询
const userId = 'visitor'; // 用户id，可选
const buryId = ''; // 可选


const clientDetector = createClientDetector(serviceHost,{
    serviceName,
    userId,
    buryId
});

export interface NavigatorDemoProps {
    children?: ReactNode;
}

const NavigatorDemo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // userId为visitor
        clientDetector.sendClientInfo();

        setTimeout(() => {
            // 设置userId
            clientDetector.setUserId('0000000');
            // 获取客户端设备信息
            clientDetector.sendClientInfo();
        }, 1000);
        return () => {
            
        };
    }, []);

    return (
        <div className={ styles.navigatorDemo }>
            NavigatorDemo
        </div>
    );
};

export default NavigatorDemo;
