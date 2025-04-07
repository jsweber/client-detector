import { FC } from 'react';
import styles from './console-demo.module.less';

export interface ConsoleDemoProps {}

const ConsoleDemo: FC<ConsoleDemoProps> = () => {

    const handleSingleInfo = () => {
        console.info('单条info消息', { 
            type: 'info',
            time: new Date().toISOString(),
            data: {
                id: 1,
                name: 'test'
            }
        });
    };

    const handleSingleError = () => {
        console.error('单条error消息', new Error('测试错误'), {
            type: 'error',
            time: new Date().toISOString()
        });
    };

    const handleMultipleMessages = () => {
        // 发送5条不同类型的消息
        console.info('第1条消息 - 普通字符串');
        console.info('第2条消息 - 带对象', { id: 2, type: 'object' });
        console.error('第3条消息 - 错误', new Error('测试错误3'));
        console.info('第4条消息 - 数组', [1, 2, 3, 4, 5]);
        console.error('第5条消息 - 复杂对象', {
            id: 5,
            type: 'complex',
            nested: {
                array: [1, 2, 3],
                date: new Date(),
                null: null,
                undefined: undefined
            }
        });
    };

    const handleBatchMessages = () => {
        // 快速发送多条消息测试队列
        for (let i = 1; i <= 12; i++) {
            console.info(`批量消息 ${i}`, {
                messageId: i,
                timestamp: Date.now()
            });
        }
    };

    return (
        <div className={styles.consoleDemo}>
            <h2>Console 功能测试</h2>
            <div className={styles.buttonGroup}>
                <button onClick={handleSingleInfo}>
                    发送单条 Info 消息
                </button>
                <button onClick={handleSingleError}>
                    发送单条 Error 消息
                </button>
                <button onClick={handleMultipleMessages}>
                    发送5条混合消息
                </button>
                <button onClick={handleBatchMessages}>
                    发送批量消息(12条)
                </button>
            </div>
        </div>
    );
};

export default ConsoleDemo; 