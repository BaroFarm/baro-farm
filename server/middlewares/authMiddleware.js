const jwt = require('jsonwebtoken');
const { Customer, Seller } = require('../models'); 
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("🔑 받은 Authorization:", authHeader);

        // Authorization 헤더 체크
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '인증 정보가 없습니다.' });
        }

        // 토큰 추출
        const token = authHeader.split(' ')[1];
        console.log("📦 추출한 토큰:", token);

        // 토큰 검증
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ 디코딩 성공:", decoded);
        } catch (err) {
            console.error("❌ jwt.verify 실패:", err.message);
            return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        }

        // 유저 확인
        let user;
        if (decoded.user_type === 'buyer') {
            user = await Customer.findByPk(decoded.id);
        } else if (decoded.user_type === 'seller') {
            user = await Seller.findByPk(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // req.user에 저장
        req.user = user;
        next();

    } catch (err) {
        console.error('인증 실패:', err);
        return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

// ✅ 비로그인도 허용하는 경우
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ optionalAuth 디코딩:", decoded);
        } catch (err) {
            console.warn("⚠️ optionalAuth 토큰 검증 실패:", err.message);
            req.user = null;
            return next();
        }

        let user;
        if (decoded.user_type === 'buyer') {
            user = await Customer.findByPk(decoded.id);
        } else if (decoded.user_type === 'seller') {
            user = await Seller.findByPk(decoded.id); 
        }

        req.user = user || null;
        return next();

    } catch (err) {
        console.error("optionalAuth 에러:", err);
        req.user = null;
        return next();
    }
};

module.exports = { authMiddleware, optionalAuth };
