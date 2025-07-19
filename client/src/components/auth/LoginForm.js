import React, { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberId, setRememberId] = useState(false);
    const [isBuyerLogin, setIsBuyerLogin] = useState(true); // 구매자/판매자 선택

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

            const { accessToken, user, tokenType } = response.data.data;

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
            // TODO: navigate("/shop") 등으로 이동 처리 가능
        } catch (err) {
            const { response } = err;

            if (response) {
            // 서버 응답이 있는 경우
                const { status, data } = response;

                if (status === 401 && data?.error?.code === "INVALID_CREDENTIALS") {
                    alert(data.error.message); // "이메일 또는 비밀번호가 올바르지 않습니다."
                } else if (status === 500 && data?.code === "SERVER_ERROR") {
                    alert(data.message); // "서버 내부 오류가 발생했습니다."
                } else {
                    alert("알 수 없는 오류가 발생했습니다.");
                }

            } else {
            // 서버 응답 없음 (네트워크 문제 등)
                alert("서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.");
            }

        console.error('로그인 에러:', err);
        }

    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mt-6 space-y-4">
            {/* 이메일 입력 */}
            <input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded px-4 py-3 text-sm"
            />

            {/* 비밀번호 입력 */}
            <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded px-4 py-3 text-sm"
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
            <div className="flex space-x-2 mt-4">
                <button
                    type="submit"
                    onClick={() => setIsBuyerLogin(true)}
                    className={`w-1/2 py-2 rounded ${isBuyerLogin ? 'bg-[#B6D19B] text-white' : 'border'}`}
                >
                    구매자로 로그인
                </button>
                <button
                    type="submit"
                    onClick={() => setIsBuyerLogin(false)}
                    className={`w-1/2 py-2 rounded ${!isBuyerLogin ? 'bg-[#B6D19B] text-white' : 'border'}`}
                >
                    판매자로 로그인
                </button>
            </div>
        </form>
    );
}
