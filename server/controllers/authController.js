const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Customer, Seller, Store } = require('../models');
require('dotenv').config();

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
        let newUser, newStore, token;

        /* 구매자 회원가입 */ 
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
        
        /* 판매자 회원가입 */ 
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
        token = jwt.sign({
            id: user_id, //
            email, user_type
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }); // 토큰 유효기간

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

