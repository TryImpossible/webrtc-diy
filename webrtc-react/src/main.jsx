import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import VConsole from 'vconsole';
import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';
import './styles/css/styles.scss';
import './index.css';
import App from './App.jsx';

new VConsole();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
