import React from 'react';
import LoginForm from '../components/auth/LoginForm'; // 아까 만든 로그인 폼

export default function LoginPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
            <img src="/logo.svg" alt="바로팜 로고" style={{ height: '100px', marginTop: '5px' }} />
            <LoginForm />
        </div>
    );
}
