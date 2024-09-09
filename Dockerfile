# 기반 이미지
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 종속성 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 프로덕션 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# standalone 출력이 있는 경우 사용
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# 시스템 사용자 및 그룹 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 애플리케이션 실행을 위한 사용자 권한 설정
USER nextjs

# 애플리케이션에 할당할 포트 (환경 변수로 설정됨)
EXPOSE ${SERVER_PORT}

# 한국 시간으로 설정
ENV TZ Asia/Seoul

# 애플리케이션 실행 명령어
CMD ["node", "server.js"]