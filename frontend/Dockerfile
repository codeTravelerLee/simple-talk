FROM node:18-alpine

# 컨테이너 안에서 /app 폴더를 작업 공간으로 사용
WORKDIR /app

# package.json과 package-lock.json 복사 - Docker 캐시 활용
COPY package*.json ./

RUN npm ci

# frontend 폴더전체를 컨테이너로 복사
COPY . .

# Vite 개발 서버 포트
EXPOSE 5173

# Vite 개발 서버 실행
# --host: Docker 컨테이너 밖에서도 vite에 접근 가능하도록 설정
CMD ["npm", "run", "dev", "--", "--host"]
