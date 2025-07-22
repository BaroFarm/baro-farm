import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import InputField from '../form/InputField';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberId, setRememberId] = useState(false);
    const [isBuyerLogin, setIsBuyerLogin] = useState(true); // 구매자/판매자 선택

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
                email,
                password,
                user_type: isBuyerLogin ? 'buyer' : 'seller',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { accessToken, tokenType, user } = response.data.data || {};
            if (!user) {
                alert('로그인 응답에서 사용자 정보를 찾을 수 없습니다.');
                return;
            }

            // ✅ localStorage 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('userId', user.user_id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userType', user.user_type);
            localStorage.setItem('tokenType', tokenType);

            if (rememberId) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            alert('로그인 성공!');
            //navigate("/shop") 등으로 이동 처리 가능
            navigate("/");
        } catch (err) {
    const { response } = err;

    if (response) {
        const { data } = response;
        const message = data?.error?.message || data?.message || "알 수 없는 오류가 발생했습니다.";
        alert(message); 
    } else {
        alert("서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.");
    }

    console.error('로그인 에러:', err);
}


    };

    return (
        <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleSubmit} 
            className="w-full max-w-md mt-6 space-y-4 mx-auto flex flex-col items-center">
            {/* 이메일 입력 */}
            <InputField
                type="email"
                label="ID"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onClear = {() => setEmail('')}
                required
            />

            {/* 비밀번호 입력 */}
            <InputField
                type="password"
                label="PW"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onClear = {() => setEmail('')}
                required
            />

            {/* 아이디 저장 */}
            <div className="flex items-center">
                <input
                    id="rememberId"
                    type="checkbox"
                    checked={rememberId}
                    onChange={() => setRememberId(!rememberId)}
                    className="mr-2"
                />
                <label htmlFor="rememberId" className="text-sm">아이디 저장</label>
            </div>

        {/* 로그인 버튼 */}
            <div className="flex justify-center space-x-4 mt-6">
            {/* 구매자 로그인 버튼: 초록 배경 */}
                <button
                    type="submit"
                    onClick={() => setIsBuyerLogin(true)}
                    style={{
                        width: '150px',
                        marginRight: '10px',
                        padding: '10px 0',
                        borderRadius: '9999px',
                        fontSize: '18px',
                        fontWeight: '500',
                        backgroundColor: '#B6D19B',
                        color: 'black',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    구매자로 로그인
                </button>

            {/* 판매자 로그인 버튼: 흰 배경 + 초록 테두리/글자 */}
                <button
                    type="submit"
                    onClick={() => setIsBuyerLogin(false)}
                    style={{
                        width: '150px',
                        padding: '10px 0',
                        borderRadius: '9999px',
                        fontSize: '18px',
                        fontWeight: '500',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid gray',
                        cursor: 'pointer',
                    }}
                >
                    판매자로 로그인
                </button>
            </div>


        {/* 아이디/비밀번호 찾기/회원가입 */}
        <div className="flex justify-between text-sm text-gray-600 mt-2 px-1">
            <button type="button" style={buttonStyle} onClick={() => alert('아이디 찾기')}>
                아이디 찾기
            </button>
            <button type="button" style={buttonStyle} onClick={() => alert('비밀번호 찾기')}>
                비밀번호 찾기
            </button>
            <button type="button" style={buttonStyle} onClick={() => navigate('/signup')}>
                회원가입
            </button>
        </div>
        </form>
    </div>
    );
}

const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px 10px',
    borderBottom: 'none',
};