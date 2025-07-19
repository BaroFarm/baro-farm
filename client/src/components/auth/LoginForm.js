import React, { useState } from 'react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberId, setRememberId] = useState(false);
    const [isBuyerLogin, setIsBuyerLogin] = useState(true); // 구매자 or 판매자 버튼

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: 로그인 API 연동
        console.log({
            email,
            password,
            rememberId,
            userType: isBuyerLogin ? 'buyer' : 'seller',
        });
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
