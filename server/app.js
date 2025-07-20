const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // ✅ 이거 추가!

dotenv.config();
const indexRouter = require('./routes');
const sProductsRouter = require('./routes/s-products');

const app = express();
app.set('port', process.env.PORT || 3002);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
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

// test
app.use(express.static(path.join(__dirname, 'views')));
app.use('/', indexRouter);

app.use('/api/s-products', sProductsRouter);
app.use('/api/:productId/images', sProductsRouter);


app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

sequelize.sync({ force: false }) // ✅ 모델 기준으로 테이블 생성
  .then(() => {
    app.listen(app.get('port'), () => {
      console.log(app.get('port'), '번 포트에서 대기 중');
    });
  })
  .catch(err => {
    console.error('DB 연결 실패:', err);
  });


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});