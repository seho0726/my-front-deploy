# 📚 AI 도서 구매 관리 시스템 (AI Book Purchase System)

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwindcss)

## 📖 프로젝트 소개
기존의 도서 대출 시스템을 E-Commerce 형태의 도서 구매 시스템으로 리팩토링하고, OpenAI (DALL-E 3)를 연동하여 도서 표지를 자동으로 생성해주는 웹 애플리케이션입니다.
TypeScript로 진행하여 안정성을 높혔습니다.

## ✨ 주요 기능 (Key Features)

### 1. 사용자 기능 (User)
* **회원가입 & 로그인:** JWT 기반 인증 및 토큰 관리 (Access/Refresh Token).
* **도서 목록 조회:** 검색(제목, 저자), 필터링(장르), 정렬 기능을 통한 도서 탐색.
* **도서 구매:** 상세 페이지에서 수량을 선택하고 장바구니 담기 및 즉시 구매.
* **마이페이지:** 내 정보 수정, 구매한 도서 내역 조회.


### 2. 관리자 기능 (Admin)
* **도서 관리 (CRUD):** 신규 도서 등록, 정보 수정, 삭제.
* **재고 관리:** 실시간 재고 파악 및 수량 조절 (입고/폐기).
* **🎨 AI 표지 생성:**
    * OpenAI GPT-4o-mini를 활용한 프롬프트 최적화.
    * DALL-E 3를 활용한 고품질 표지 이미지 자동 생성 및 적용.

### 3. 기술적 특징
* **TypeScript 마이그레이션:** 정적 타입 검사를 통해 코드 안정성 확보.
* **API Client 패턴:** `apiFetch` 유틸리티를 구현하여 토큰 자동 재발급(Interceptor) 및 에러 핸들링 중앙화.
* **반응형 UI:** Tailwind CSS를 활용한 모던하고 직관적인 디자인.

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend:** React (Vite), TypeScript
* **Styling:** CSS, Lucide React (Icons)
* **Routing:** React Router DOM
* **API Integration:** Fetch API
* **AI:** OpenAI API (GPT-4o-mini, DALL-E 3)

---

## 📂 프로젝트 구조 (Project Structure)

```bash
src/
├── api/
│   └── client.ts        # API 호출 및 토큰 인터셉터 처리
├── components/
│   ├── ui/              # UI 컴포넌트
│   ├── AddBookDialog.tsx    # 도서 등록/수정 모달
│   ├── AIImageGenerator.tsx    # AI 책 표지 생성
│   ├── BookCard.tsx         # 도서 카드 컴포넌트
│   ├── BookDetailDialog.tsx # 상세 정보 및 구매/리뷰
│   ├── BookInventoryDialog.tsx # 도서 통계
│   ├── BookList.tsx         # 도서 목록 그리드
│   ├── LoginScreen.tsx      # 로그인 화면
│   ├── SignUpScreen.tsx     # 회원가입 화면
│   ├── MyPage.tsx           # 마이페이지 (구매내역)
│   └── ...
├── types.tsx                   # User, Book, Order 등 공통 타입 정의
├── App.tsx              # 메인 라우팅 및 상태 관리
└── main.tsx             # 앱 진입점
