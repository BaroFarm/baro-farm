import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [userType, setUserType] = useState('buyer'); // 기본값: 구매 회원
  const navigate = useNavigate();

  const handleSignup = () => {
    if (userType === 'buyer') {
      navigate('/signup/buyer');
    } else {
      navigate('/signup/seller');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img src="/logo.svg" alt="로고" className="w-24 h-24 mb-6" />
      <h1 className="text-lg font-semibold mb-8">바로팜 AI-FARM</h1>

      {/* 라디오 버튼 */}
      <div className="space-y-4 mb-8 w-64">
        <label className="flex items-center justify-between border px-4 py-2 rounded-full">
          <input
            type="radio"
            value="buyer"
            checked={userType === 'buyer'}
            onChange={() => setUserType('buyer')}
          />
          <span className="ml-2">구매 회원</span>
        </label>
        <label className="flex items-center justify-between border px-4 py-2 rounded-full">
          <input
            type="radio"
            value="seller"
            checked={userType === 'seller'}
            onChange={() => setUserType('seller')}
          />
          <span className="ml-2">판매 회원</span>
        </label>
      </div>

      {/* 가입하기 버튼 */}
      <button
        onClick={handleSignup}
        style={{
          backgroundColor: '#B6D19B',
          color: 'black',
          borderRadius: '9999px',
          padding: '10px 30px',
          fontWeight: '500',
          fontSize: '16px',
        }}
      >
        가입하기
      </button>
    </div>
  );
}
