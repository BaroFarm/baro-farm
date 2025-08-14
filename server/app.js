// server/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const indexRouter = require('./routes'); // ./routes/index.js 에서 router export 가정

const app = express();
const PORT = process.env.PORT || 3002;

/* ---------- 미들웨어 ---------- */

// CORS: 프론트 개발 서버(3000)에서 접근 허용 + 쿠키 공유 켜기
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public'))); // 정적파일 (e.g., /images/*)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 쿠키 파서 (서명 쿠키가 꼭 필요하지 않으면 secret 생략 가능)
app.use(cookieParser());

// 세션 (⚠️ secret은 "한 번만" 지정해야 함)
if (!process.env.SESSION_SECRET) {
  console.warn('[WARN] .env에 SESSION_SECRET이 없습니다. 개발용 기본값으로 대체합니다.');
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_dev_secret', // ✅ 유일한 secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // HTTPS가 아니면 false
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1시간
    },
  })
);

/* ---------- 라우트 ---------- */

// 모든 API는 /api 하위로 노출
app.use('/api', indexRouter);

// 404
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// 500
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ status: 'error', message: err.message ?? '서버 오류', code: 500 });
});

/* ---------- 서버 시작 ---------- */
app.listen(PORT, () => {
  console.log(`${PORT}번 포트에서 대기 중`);
});
