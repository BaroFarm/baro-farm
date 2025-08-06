const express = require('express');
const router = express.Router();
const getMyInquiries = require('../../controllers/mypage-buyer/inquiryController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, getMyInquiries);

module.exports = router;
