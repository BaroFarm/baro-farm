const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const indexRouter = require('./routes');

const app = express();
app.set('port', process.env.PORT || 3002);

// ✅ CORS 설정 (withCredentials 지원)
app.use(cors({
    origin: 'http://localhost:3000', // 클라이언트 주소 명시
    credentials: true,               // 쿠키/세션 허용
}));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false, // 개발 환경에서는 false, 배포 시 https라면 true
    },
}));

// 🔹 API 라우터
app.use('/api', indexRouter);

// 🔹 404 처리
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// 🔹 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
