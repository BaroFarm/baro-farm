const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Customer, Seller, Store } = require('../models');
require('dotenv').config();

// 회원가입
exports.signup = async (req, res) => {
    try { 
        const { email, password, confirmPassword, phone, // 공통
            zip_code, street, detail, user_type, name,// 공통
            nickname, profile_image, // buyer만 해당
            business_number, license_number, contact, // seller만 해당
            store_name,
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        const hash = await bcrypt.hash(password, 10); // 비밀번호 해시
        let newUser, newStore;

        // 구매자 회원가입
        if (user_type === 'buyer') {
            // 이메일 중복 확인
            const existing = await Customer.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
            }

            newUser = await Customer.create({
                email, password: hash, name, nickname, phone, zip_code, street, detail, 
                profile_image: profile_image || null,
                user_type: 'buyer', status: '활성', created_at: new Date(),
            });
        }
        
        // 판매자 회원가입
        if (user_type === 'seller') {
            const existing = await Seller.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
            }

            newStore = await Store.create({
                name: store_name, 
                zip_code, street, detail, 
                created_at: new Date(),
            });
            
            newUser = await Seller.create({
                email, password: hash, phone, 
                name, business_number, license_number, contact,
                store_id: newStore.store_id, // store 연결
                user_type: 'seller', status: '활성', created_at: new Date(),
            });
        }

        const user_id = user_type === 'buyer' ? newUser.customer_id : newUser.seller_id; // 회원 유형에 따른 회원 아이디 저장

        // 토큰 발급
        const token = jwt.sign({
            id: user_id, //
            email, user_type
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }); // 토큰 유효기간

        res.status(201).json({
            status: "success",
            data: {
                user_id: user_id, //
                email: newUser.email,
                user_type: newUser.user_type,
            }
        });

    } catch (err) { 
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    }
};

// 로그인
exports.login = async (req, res) => {
    try {
        const { email, password, user_type } = req.body;
        let user;

        if (user_type === 'buyer') {
            user = await Customer.findOne({ where: { email } });
        } else if (user_type === 'seller') {
            user = await Seller.findOne({ where: { email } });
        } 

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: 'error',
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                }
            });
        }

        const user_id = user_type === 'buyer' ? user.customer_id : user.seller_id; // 회원 유형에 따른 회원 아이디 저장

        const expiresInSeconds = "7d"; // 토큰 유효 시간 (초 단위)
        const token = jwt.sign(
            {
                id: user_id,
                email: user.email,
                user_type: user.user_type
            }, 
            process.env.JWT_SECRET, 
            { expiresIn:'100y' }
        );
        
        res.status(200).json({
            status: 'success',
            data: {
                accessToken: token,
                tokenType: 'Bearer',
                expiresIn: expiresInSeconds,
                user: {
                    user_id: user_id,
                    email: user.email,
                    user_type: user.user_type
                }
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    }
};

// 로그아웃
exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        // Authorization 헤더가 없는 경우
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: '인증 정보가 없습니다.',
            });
        }

        const token = authHeader.split(' ')[1];

        // 토큰 유효성 검사
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: '유효하지 않거나 만료된 토큰입니다.',
            });
        }

        // 클라이언트에서 토큰 삭제
        res.status(200).json({
            status: 'success',
            message: '로그아웃 되었습니다. 클라이언트에서 토큰을 삭제해주세요.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    }
};
