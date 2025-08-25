import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
    return (
    <Link
        to={to}
        className="logo"
        aria-label="홈으로 이동"
        style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
        }}
    >
        <img src="/logo.svg" alt="바로팜 로고" style={{ height: '100px', marginTop: '5px' }} />
        <span style={{ fontWeight: 'bold', fontSize: '35px', marginLeft: 0, padding: 0 }}>
            바로팜
        </span>
    </Link>
    );
}