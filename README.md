# 介绍
<div>
前端埋点sdk，开发者利用该sdk可以去搜集设备信息、错误日志和性能数据(开发中)等。
</div>
<br/><br/>

# 兼容性
<ul>
    <li>Chrome >=87</li>
    <li>Firefox >=78</li>
    <li>Safari >=14</li>
    <li>Edge >=88</li>
</ul>

# 功能
## 设备信息搜集
<div>搜集信息如下</div>
<table border>
    <tr>
        <td>os</td>
        <td>操作系统（ 举例：Windows/Mac/Android/iOS/Linux ）</td>
    </tr>
    <tr>
        <td>osVersion</td>
        <td>操作系统版本，(举例：11 | 10 | Unknown ...)</td>
    </tr>
    <tr>
        <td>browserName</td>
        <td>浏览器（ 举例：Chrome | Firefox | Edge ... ）</td>
    </tr>
    <tr>
        <td>browserVersion</td>
        <td>浏览器版本（ 举例：Chrome: 104.0.0.0 ... ）</td>
    </tr>
    <tr>
        <td>screenSizeWidth</td>
        <td>屏幕宽度（ 举例：2560 ）px</td>
    </tr>
    <tr>
        <td>screenSizeHeight</td>
        <td>屏幕高度（ 举例：1440 ）px</td>
    </tr>
    <tr>
        <td>windowSizeWidth</td>
        <td>窗口宽度（ 举例：2495 ）px</td>
    </tr>
    <tr>
        <td>windowSizeHeight</td>
        <td>窗口高度 （ 举例：1440 ）px</td>
    </tr>
    <tr>
        <td>language</td>
        <td>使用语言（ 举例：zh-CN ...）</td>
    </tr>
    <tr>
        <td>isWeChart</td>
        <td>是否在微信环境（true | false）</td>
    </tr>
    <tr>
        <td>isMobile</td>
        <td>是否在移动端（true | false）</td>
    </tr>
    <tr>
        <td>userAgent</td>
        <td>浏览器的navigator.userAgent</td>
    </tr>
    <tr>
        <td>platform</td>
        <td>浏览器的navigator.platform</td>
    </tr>
    <tr>
        <td>gpu</td>
        <td>gpu信息（ANGLE (NVIDIA Corporation, GeForce GTX 1660 Ti/PCIe/SSE2, OpenGL 4.5.0)）</td>
    </tr>
</table>
<br/>

## 错误日志

<div>为了方便确定发生错误的环境，错误信息会包括设备信息，</div>
<div>在此基础上会增加错误相关字段，新增字段见下表</div>

<table border>
    <tr>
        <td>errorName</td>
        <td>错误名称（ 举例：TypeError, ParseError）</td>
    </tr>
    <tr>
        <td>errorMessage</td>
        <td>错误信息</td>
    </tr>
     <tr>
        <td>errorLevel</td>
        <td>错误级别：0-3，一般来说数字越小越严重</td>
    </tr>
    <tr>
        <td>errorStack</td>
        <td>错误栈，依赖浏览器兼容性</td>
    </tr>
    <tr>
        <td>errorComponentStack</td>
        <td>组件级别错误栈，依赖前端框架实现，已知react支持</td>
    </tr>
</table>
<br/>


## 性能数据
todo<br/><br/>

# 安装

## npm安装

```sh
npm install @easycode/client-detector
```

## 浏览器引入

<div>通过script标签引入cdn上的umd包</div>
<div>copy以下代码放在script标签中，如下示例</div>
<br/>

```html
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client detector demo</title>
    <!-- 引入client detector，暴露global对象: ClientDetector -->
    <script src="/src/build/client-detector.umd.cjs"></script>
    <!-- 初始化 client detector -->
    <script>
        (function(){
            const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
            const serviceName = 'test-service'; // 必填且唯一，找管理员查询
            ClientDetector.init(serviceHost, { serviceName: serviceName});
        })();
    </script>
...

```

<br/>

# 使用
## 上手

```js
import { createClientDetector } from '@easycode/client-detector';

const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询
const userId = 'visitor'; // 可选,用户id，默认是visitor
const buryId = ''; // 可选，32位uuid，前端生成，不填则由后端生成


const clientDetector = createClientDetector(serviceHost,{
    serviceName,
    userId,
    buryId
});


const Demo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // 发送客户端设备信息
        clientDetector.sendClientInfo();

    }, []);

    return (
        <div className={ styles.navigatorDemo }>
            Demo
        </div>
    );
};

```

## 设置UserId
<div>在具体业务场景中，我们发现userId并不一定能在初始化ClientDetector阶段获取，</div>
<div>所以提供setUserId方法，开发者可以通过该方法设置userId，设置后发送的所有埋点请求都会带上userId,</div>
<div>注意! 在调用setUserId前的请求不会带有userid，使用默认值visitor</div>

```js
import { createClientDetector } from '@easycode/client-detector';

const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询
const userId = 'visitor'; // 用户id，可选
const buryId = ''; // 可选

const clientDetector = createClientDetector(serviceHost,{
    serviceName,
    userId,
    buryId
});


const Demo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // userId为visitor
        clientDetector.sendClientInfo();

        setTimeout(() => {
            // 设置userId
            clientDetector.setUserId('0000000');
            // 获取客户端设备信息
            clientDetector.sendClientInfo();
        }, 1000);

    }, []);

    return (
        <div className={ styles.navigatorDemo }>
            Demo
        </div>
    );
};

```

## 网络指纹
<div>version >= 1.1.0</div>
<p>网络指纹指通过客户端信息分辨用户的技术，当app没有用户功能去区分使用者时，可以使用网络指纹，它会根据客户端信息生成一个hash值，帮助后台系统做区分。</p>

```js
import { createClientDetector } from '@easycode/client-detector';

const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询

const clientDetector = createClientDetector(serviceHost,{
    serviceName
});


const Demo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // 发送客户端设备信息
        // setFingerprint是一个异步方法，会在localstorage中缓存生成的网略指纹
        detector.setFingerprint().then(() => detector.sendClientInfo());
    }, []);

    return (
        <div className={ styles.navigatorDemo }>
            Demo
        </div>
    );
};

```

## 仅使用网络指纹
<div>version >= 1.1.0</div>

```js
import { getFingerprint } from '@easycode/client-detector';


const Demo: FC<NavigatorDemoProps> = () => {
    useEffect(() => {
        // getFingerprint是一个异步函数
        const print = async () => {
            const id = await getFingerprint();
            console.log(id); // 输出一串hash: 801baad441a144716cb8e0a6181ca337
        }

        print();
    }, []);

    return (
        <div className={ styles.navigatorDemo }>
            Demo
        </div>
    );
};

```

## 错误收集功能

<div>version >= 1.2.0</div>
<br/>

<div><code>案例目录结构</code></div>

```
my-app
...
├── detector.tsx
├── error-boundary.tsx
├── error-demo.tsx
├── app.tsx
...
```
<br/>

<div><code>detector.tsx</code></div>

```js
import { createClientDetector } from '@easycode/client-detector';
const serviceHost = 'https://host/burry/api'; // 服务请求地址
const serviceName = 'test-service'; // 必须唯一，找管理员查询
const userId = 'visitor'; // 用户id，可选
const buryId = ''; // 可选

export const clientDetector = createClientDetector(serviceHost,{
    serviceName,
    userId,
    buryId
});

```
<br/>

<div><code>error-boundary.tsx</code> 捕获错误，通过client-detector发送错误</div>

```js
import { ReactNode, Component, ErrorInfo } from 'react';
import { clientDetector } from './detector';

export interface ErrorBoundaryProps {
    children?: ReactNode;
}

export interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        console.log(error);
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 发送错误信息
        // errorInfo是以组件为单位的调用栈
        clientDetector.sendError0(error, errorInfo.componentStack || '');
        // 等同于 clientDetector.sendError(error, errorInfo.componentStack || ''， 0);
    }

    render() {
        if (this.state.hasError) {
        // 你可以自定义降级后的 UI 并渲染
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;


```
<br/>

<div><code>error-demo.tsx</code></div>

```js
import { FC, ReactNode, useEffect } from 'react';

export interface ErrorDemoProps {
    children?: ReactNode;
}

const ErrorDemo: FC<ErrorDemoProps> = () => {

    useEffect(() => {
        throw new TypeError('error message');
    }, []);

    return (
        <div>
            ErrorDemo
        </div>
    );
};

export default ErrorDemo;


```
<br/>

<div><code>app.tsx</code> 使用上述组件</div>

```js
import { FC, ReactNode, useEffect } from 'react';
import { clientDetector } from './detector';
import ErrorBoundary from './error-boundary';
import ErrorDemo from './error-demo'

export interface AppProps {
    children?: ReactNode;
}

const App: FC<AppProps> = () => {
    useEffect(() => {
        // 发送设备信息
        clientDetector.sendClientInfo();
    }, []);

    return (
        <ErrorBoundary>
            <div>
                请求发送测试页面
            </div>
            <ErrorDemo />
        </ErrorBoundary>
    );
};

export default App;

```
<br/>

## 单例模式

<div>version >= 1.3.0</div>
<br/>

<div>
为了简化使用，client-detector提供单例模式，并且继续提供工厂模式（<code>createClientDetector</code>创建实例）的方式。<br/>
</div>
<br/>

### 单例模式初始化

<div>在入口文件<code>main.ts</code>中初始化</div>

```js
import * as ReactDOM from 'react-dom/client';
import { init } from '@easycode/client-detector';
import App from './app';

const serviceHost = 'https://openxlab.org.cn/gw/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询

init(serviceHost, {
    serviceName,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />,
);
```

### 单例模式搜集设备信息

```js
import { detector } from '@easycode/client-detector';
import { useEffect } from 'react';

const App = () => {

    useEffect(() => {
        const init = async () => {
            detector.sendClientInfo();
        };

        init();
    }, []);

    return (

        <div>...</div>
    );
};

export default App;

```

### 单例模式发送错误



<br/>
# 开发

```sh

npm run dev
```
