import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const sellerMenus = [
  { label: '대시보드', to: '/seller' },
  { label: '상품관리', to: '/seller/products' },
  { label: '주문·정산', to: '/seller/orders' },
  { label: '쿠폰·금액권', to: '/seller/vouchers' },
  { label: '메시지·문의', to: '/seller/inbox' },
  { label: '스토어 설정', to: '/seller/settings' },
];

export default function SellerNav() {
  const [active, setActive] = useState(sellerMenus[0].label);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const found = sellerMenus.find(m => loc.pathname.startsWith(m.to));
    setActive(found?.label || sellerMenus[0].label);
  }, [loc.pathname]);

  const go = (m) => {
    setActive(m.label);
    nav(m.to);
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 45,
      backgroundColor: '#B6D19B',
      padding: '0 24px',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: 16,
        flex: 1,
        alignItems: 'center'
      }}>
        {sellerMenus.map((m) => (
          <li key={m.to}>
            <button
              onClick={() => go(m)}
              style={{
                ...btnStyle,
                fontWeight: active === m.label ? 'bold' : 'normal',
                color: active === m.label ? '#000' : '#49454F'
              }}
            >
              {m.label}
            </button>
          </li>
        ))}
      </ul>
      {/* 필요하면 우측에 “상품 등록” 같은 CTA 버튼 배치 */}
      {/* <button style={{ ...ctaStyle }} onClick={() => nav('/product/register')}>상품 등록</button> */}
    </nav>
  );
}

const btnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  color: '#49454F',
  padding: '6px 4px',
  transition: 'background-color 0.2s',
  outline: 'none',
  textAlign: 'left',
  whiteSpace: 'nowrap'
};
