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
            <img src="/logo.svg" alt="로고" 
                style={{ width: '120px', height: '120px', marginTop: '100px', marginBottom: '32px' }} />
            {/* 라디오 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            {/* 구매 회원 박스 */}
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '220px',
                        padding: '12px 24px',
                        border: '1px solid black',
                        borderRadius: '9999px',
                        backgroundColor: userType === 'buyer' ? '#f7faf5' : 'white',
                        fontWeight: '500',
                        fontSize: '17px',
                        cursor: 'pointer',
                    }}
                >
                    <input
                        type="radio"
                        value="buyer"
                        checked={userType === 'buyer'}
                        onChange={() => setUserType('buyer')}
                        style={{ marginRight: '10px' }}
                    />
                    구매 회원
                </label>

                {/* 판매 회원 박스 */}
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '220px',
                        padding: '12px 24px',
                        border: '1px solid black',
                        borderRadius: '9999px',
                        backgroundColor: userType === 'seller' ? '#f7faf5' : 'white',
                        fontWeight: '500',
                        fontSize: '17px',
                        cursor: 'pointer',
                    }}
                >
                    <input
                        type="radio"
                        value="seller"
                        checked={userType === 'seller'}
                        onChange={() => setUserType('seller')}
                        style={{ marginRight: '10px' }}
                    />
                    판매 회원
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
                    border: 'none',
                    cursor: 'pointer',

                }}
            >
                가입하기
            </button>
        </div>
    );
}
