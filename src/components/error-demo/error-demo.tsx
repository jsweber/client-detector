import { FC, ReactNode, useEffect } from 'react';
import styles from './error-demo.module.less';

export interface ErrorDemoProps {
    children?: ReactNode;
}

const ErrorDemo: FC<ErrorDemoProps> = () => {

    useEffect(() => {
        throw new TypeError('error message');
    }, []);

    return (
        <div className={styles.errorDemo}>
            ErrorDemo
        </div>
    );
};

export default ErrorDemo;
