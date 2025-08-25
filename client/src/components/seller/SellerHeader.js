import React from 'react';
import Logo from '../Logo';          // 경로는 프로젝트 구조에 맞게 조정
import UserNav from '../UserNav';    // (판매자 프로필/로그아웃 등 유지 가능)

export default function SellerHeader() {
  return (
    <header style={{
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <Logo />
      <UserNav />
    </header>
  );
}
