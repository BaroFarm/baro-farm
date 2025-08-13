import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function SearchBar() {
    return (
    <div
        style={{
        backgroundColor: '#E6F4E6',  // 연한 초록색
        borderRadius: '20px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '500px',
        margin: '20px auto',
    }}>
        <input
            type="text"
            placeholder="검색어를 입력하세요."
            style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: '#333',
            }}
        />
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaTimes color="#666" />
        </button>
    </div>
    );
}
