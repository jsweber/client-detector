import { FC, ReactNode, useEffect } from 'react';
import { detector, log } from '../../lib';
import ErrorBoundary from '../error-boundary';
import ErrorDemo from '../error-demo'
import ConsoleDemo from '../console-demo';
import styles from './navigator-demo.module.less';

export interface NavigatorDemoProps {
    children?: ReactNode;
}

const NavigatorDemo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // userId为visitor
        detector.sendClientInfo();
        return () => {

        };
    }, []);

    const handleClick = () => {
        const key = log('handleclick', 12345, false);
        console.log(key);
    }

    return (
        <ErrorBoundary>
            <div className={styles.navigatorDemo}>
                请求发送测试页面
                <button onClick={handleClick}>点击</button>
                <ConsoleDemo />
            </div>
            <ErrorDemo />
        </ErrorBoundary>
    );
};

export default NavigatorDemo;
