FROM node:18-alpine

# 컨테이너 안에서 /app 폴더를 기본 작업 공간으로 사용
WORKDIR /app

# package.json, package-lock.json 복사 - 의존성이 변경되지 않았을 때 캐시를 활용해 빠르게 빌드
COPY package*.json ./

# 의존성 설치 (devDependencies 포함)
RUN npm ci

#  backend 폴더의 모든 파일을 컨테이너로 복사
COPY backend/ ./backend/

# 포트번호 
EXPOSE 5000

# 7단계: 개발 서버 실행
# nodemon을 사용하여 파일 변경시 자동 재시작
CMD ["npm", "run", "dev"]
