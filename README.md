# 介绍
<div>
前端埋点sdk，开发者利用该sdk可以去搜集设备信息、错误日志(开发中)和性能数据(开发中)等。
</div>

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
未完成<br/><br/>

## 性能数据
未完成<br/><br/>

# 安装

```sh
npm install @easycode/client-detector
```

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
<div>在具体业务场景中我们发现userId并不一定能在初始化ClientDetector阶段获取，</div>
<div>所以提供setUserId方法，开发者可以通过该方法设置userId，设置后发送的所有埋点请求都会带上userId,</div>
<div>注意! 在调用setUserId前的请求不会带有userid，使用默认值visitor</div>

```js
import { createClientDetector } from '@easycode/client-detector';

const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询

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

## 设置网略指纹
<div>version >= 1.1.0</div>
<p>网略指纹指通过客户端信息分辨用户的技术，当app没有用户功能去区分使用者时，可以使用网略指纹，它会根据用户客户端信息生成一个hash值，帮助后台系统做区分。</p>

```js
import { createClientDetector } from '@easycode/client-detector';

const serviceHost = 'https://demo.com/data-bury'; // 必填，服务请求地址
const serviceName = 'test-service'; // 必填且唯一，找管理员查询

const clientDetector = createClientDetector(serviceHost,{
    serviceNam
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

## 单独使用网络指纹
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

# 开发

```sh

npm run dev
```
