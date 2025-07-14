import React from 'react';
import Logo from './Logo';
import UserNav from './UserNav';

export default function Header() {
    return (
        <header style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', }}>
            <Logo />
            <UserNav />
        {/* 나중에 네비게이션, 로그인, 장바구니 등도 여기 넣기 */}
        </header>
    );
}