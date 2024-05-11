import { FC, ReactNode, useEffect } from 'react';
import { createClientDetector } from '../../lib';
import styles from './navigator-demo.module.less';

const clientDetector = createClientDetector({
    collectApi: 'https://openxlab.org.cn/gw/data-bury/api/v1/bury/collect',
    serviceName: 'test-service',
    userId: '005206',
    buryId: ''
});

export interface NavigatorDemoProps {
    children?: ReactNode;
}

const NavigatorDemo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        clientDetector.sendClientInfo();
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
