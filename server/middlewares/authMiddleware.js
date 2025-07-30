const jwt = require('jsonwebtoken');
const { Customer, Seller } = require('../models'); // 일단 seller 추가해둠
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; // 

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '인증 정보가 없습니다.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // jwt 복호화

        let user;

        if (decoded.user_type === 'buyer') {
            user = await Customer.findByPk(decoded.id);
        } else if (decode.user_type === 'seller') {
            user = await Seller.findByPk(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error('인증 실패:', err);
    return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

module.exports = authMiddleware;