// src/pages/TestLoginAndRegister.jsx
import React, { useEffect } from 'react';
import api from '../api/axios';

const TestLoginAndRegister = () => {
  
  useEffect(() => {
    const doLoginAndRegister = async () => {
      try {
        // 1️⃣ 로그인 요청
        const loginRes = await api.post('/auth/login', {
          email: 'seller.test@baro-farm.com',
          password: 'Test1234!',
          user_type: 'seller',
        });

        const token = loginRes.data.data.accessToken;
        localStorage.setItem('token', token); // 토큰 저장
        console.log('✅ 로그인 성공! 토큰 저장 완료');

        // 2️⃣ 상품 등록 요청 (토큰 자동 포함)
        const productRes = await api.post('/s-products/basic', {
          product_name: '테스트 상품',
          category: '과일',
          capacity: '1kg',
          price: 15000,
          store: '테스트 직매장',
          returnable: true,
        });

        console.log('🎉 상품 등록 성공:', productRes.data);

      } catch (err) {
        console.error('❌ 에러 발생:', err.response?.data || err.message);
      }
    };

    doLoginAndRegister();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>테스트: 로그인 + 상품 등록</h1>
      <p>콘솔에서 결과를 확인하세요!</p>
    </div>
  );
};

export default TestLoginAndRegister;
