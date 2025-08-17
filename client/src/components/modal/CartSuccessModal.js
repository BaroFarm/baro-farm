import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartSuccessModal({ message, onClose }){
    const navigate = useNavigate();

    return (
    <div style={overlayStyle}>
        <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}>✕</button>
        <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
            해당 상품이 장바구니에 담겼습니다.
        </p>
        <p>장바구니로 이동하시겠습니까?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
        <button
            onClick={onClose}
            style={{ padding: '8px 16px', border: '1px solid gray', background: 'white', cursor: 'pointer' }}
        >
            쇼핑 계속하기
        </button>
        <button
            onClick={() => navigate('/cart')}
            style={{ padding: '8px 16px', background: '#222', color: 'white', border: 'none', cursor: 'pointer' }}
        >
            장바구니로 이동
        </button>
        </div>
        </div>
    </div>
    );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '24px',
  width: '360px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  textAlign: 'center',
  position: 'relative'
};

const closeStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  border: 'none',
  background: 'transparent',
  fontSize: '18px',
  cursor: 'pointer'
};