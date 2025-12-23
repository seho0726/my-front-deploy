# 1) Build stage
FROM public.ecr.aws/docker/library/node:20-alpine AS build
WORKDIR /app/list

# 의존성 파일만 먼저 복사
COPY package*.json ./

# 의존성 설치 (실행 권한이 자동으로 설정됨)
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 2) Run stage
FROM public.ecr.aws/nginx/nginx:1.27-alpine

# 수정 포인트: /app/list/dist 에서 가져와야 합니다.
# (만약 vite.config.ts에서 build.outDir를 수정했다면 그에 맞는 이름을 쓰세요)
COPY --from=build /app/list/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
