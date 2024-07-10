import { FC, ReactNode, useEffect } from 'react';
import { clientDetector } from '../../detector';
import ErrorBoundary from '../error-boundary';
import ErrorDemo from '../error-demo'
import styles from './navigator-demo.module.less';

export interface NavigatorDemoProps {
    children?: ReactNode;
}

const NavigatorDemo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // userId为visitor
        clientDetector.sendClientInfo();
        return () => {
            
        };
    }, []);

    return (
        <ErrorBoundary>
            <div className={styles.navigatorDemo}>
                请求发送测试页面
            </div>
            <ErrorDemo />
        </ErrorBoundary>
    );
};

export default NavigatorDemo;
