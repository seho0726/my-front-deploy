import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ⭐ 이거 필수!
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter> {/* ⭐ App을 이걸로 감싸야 라우팅이 작동합니다 */}
            <App />
        </BrowserRouter>
    </StrictMode>
);