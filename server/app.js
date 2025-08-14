
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
//프론트에서 추가했습니다..!
const cors = require('cors');

dotenv.config();
const indexRouter = require('./routes');

const app = express();
app.set('port', process.env.PORT || 3002);

app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.resolve(__dirname, '../client/public/images')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false, 
    saveUninitialized: false, 
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true, 
        secure: false,
    },
}));
// 확인용 로그(일시적으로 찍어보세요)
console.log('STATIC /images →', path.resolve(__dirname, 'public', 'images'));

app.use('/api', indexRouter); // 모든 api 경로 앞에 /api 붙도록 수정

app.use(cors({ origin: '*', credentials: false })); // AI 상품 상세페이지 - Figma 플러그인 호출 시 필요

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});