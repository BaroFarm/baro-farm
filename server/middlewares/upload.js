// server/middlewares/upload.js
// cloudinary에서 이미지 업로드 할 때 사용하는 multer 미들웨어

const multer = require('multer');
const { storage } = require('../modules/cloudinary');

const upload = multer({ storage });

module.exports = upload;
