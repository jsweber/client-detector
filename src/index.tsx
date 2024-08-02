import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import { init } from './lib';
import './index.css'
const serviceHost = 'https://openxlab.org.cn/gw/data-bury'; // 服务请求地址
const serviceName = 'test-service'; // 必须唯一，找管理员查询
init(serviceHost, {
  serviceName
}, 'development');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
