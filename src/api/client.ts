// src/api/client.ts (신규 파일)

// 명세서의 재발급 엔드포인트: POST /auth/refresh
// ✅ types.ts에 정의된 TokenRefreshResponse를 임포트합니다.
import { Book, TokenRefreshResponse } from '../types';
const BASE_URL = 'http://localhost:8080';

// ⭐ API 요청을 가로채서 토큰을 붙여주는 핵심 클라이언트
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');

    // 1. Authorization Header 추가
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const url = `${BASE_URL}${endpoint}`;

    let response = await fetch(url, { ...options, headers });

    // 2. 401 Unauthorized 에러 발생 시 토큰 재발급 시도
    if (response.status === 401 && endpoint !== '/auth/refresh') {
        const refreshToken = localStorage.getItem('refreshToken'); // ⭐ [추가] Refresh Token 가져오기

        if (!refreshToken) {
            // Refresh Token 자체가 없으면 바로 로그아웃
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            throw new Error('No Refresh Token. Redirecting to login.');
        }

        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // ⭐ [수정] 명세서대로 Refresh Token을 Body에 담아 보냅니다.
            body: JSON.stringify({ refreshToken: refreshToken }),
        });

        if (refreshResponse.ok) {
            const data: TokenRefreshResponse = await refreshResponse.json();

            // ⭐ [수정] 새로운 Access Token과 Refresh Token을 모두 저장합니다.
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // 새 토큰으로 1단계 요청 재시도
            const newHeaders = { ...headers, 'Authorization': `Bearer ${data.accessToken}` };
            response = await fetch(url, { ...options, headers: newHeaders });
        } else {
            // 재발급 실패 (리프레시 토큰 만료 등)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw new Error('Refresh Token expired. Please log in again.');
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // JSON 파싱 실패 대비
        const errorMessage = errorData["Error Message"] || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    // DELETE 204 No Content 처리
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}