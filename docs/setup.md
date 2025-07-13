## 🗂️ 프로젝트 구조

```
**baro-farm/**
├── **client/**                    # React 기반 프론트엔드 디렉토리
│   ├── public/                # 정적 파일 (index.html, 이미지 등)
│   ├── src/                   # 실제 React 컴포넌트 및 로직이 포함된 소스 디렉토리
│   ├── package.json           # 프론트엔드 의존성 및 실행 스크립트 정의
│   └── ...                    # 기타 설정 파일들 (.gitignore 등)
│
**├── server/**                    # Express + Sequelize 기반 백엔드 디렉토리
│   ├── config/
│   │   └── config.js          # Sequelize에서 사용하는 DB 설정 파일 (환경별 username, password 등)
│   ├── models/
│   │   └── index.js           # Sequelize 초기화 및 모델 자동 로딩 설정 파일
│   ├── routes/
│   │   └── index.js           # 기본 라우터 설정 
│   ├── .env.example           # 환경변수 설정 예시 파일 (실제 사용 시 .env 복사해서 사용)
│   ├── .gitignore             # Git에서 추적 제외할 파일/디렉토리 목록
│   ├── app.js                 # Express 서버의 진입점 (미들웨어, 라우터, 에러 처리 등 설정)
│   ├── package-lock.json      # 의존성 트리 고정을 위한 자동 생성 파일
│   ├── package.json           # 백엔드 의존성 및 실행 스크립트 정의
│
└── README.md                  # 프로젝트 소개, 설치 방법, 실행 방법 등을 설명하는 문서 (추후 작성) 

```

## 1️⃣ Node.js 설치

**Node.js 공식 사이트에서 설치** 

> [**https://nodejs.org/ko](https://nodejs.org/ko)**
> 

**Node.js 설치 확인** 

> 터미널에 아래 명령어 입력 시 버전 정보가 출력되면 설치 완료
> 
> 
> ```bash
> node -v
> npm -v
> ```
> 
<br>

## 2️⃣ 레포지토리 클론

```bash
git clone https://github.com/BaroFarm/baro-farm.git
cd baro-farm 
```
<br>

## 3️⃣ 프론트엔드 (client) 세팅


```bash
cd client 
npm install
npm start 
```

> React 개발 서버가 `http://localhost:3000`에서 실행됩니다.

<br>

## 4️⃣ 백엔드 (server) 세팅

**📦 의존성 설치**

```bash
cd ../server
npm install 
```

**🔐 .env 파일 생성**

> `.env.example`을 복사해 `.env`를 생성하고 정보를 입력해주세요!
> 

```bash
cp .env.example .env 
```

**🛠 데이터베이스 설정**

> MySQL 콘솔 접속
> 

```bash
mysql -u root -p
```

> MySQL 실행 후 아래 명령으로 개발용 DB 생성
> 

```sql
CREATE DATABASE database_development;
```

**🧬 DB 마이그레이션**

```bash
mkdir migrations 
npx sequelize-cli db:migrate
```

**🚀 서버 실행**

```bash
npm run dev
```

> Express 서버가 http://localhost:3002에서 실행됩니다.

<br>

## 5️⃣ 서버 / 클라이언트 동시 실행


> **루트 디렉토리(`barofarm/`)**에서 다음 명령으로 서버와 클라이언트를 동시에 실행할 수 있습니다.
> 

```bash
npm install  
npm start 
```
