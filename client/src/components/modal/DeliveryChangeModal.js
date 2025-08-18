// components/cart/DeliveryChangeModal.jsx
import React, { useState, useMemo } from 'react';

export default function DeliveryChangeModal({
  isOpen, onClose, items = [], initialMethod = 'smart', onConfirm, blocked = false,
}) {
  const [method, setMethod] = useState(initialMethod);
  const [alsoPutToPickup, setAlsoPutToPickup] = useState(false);
  const titles = useMemo(() => items.slice(0, 2).map(i => i.product_name || '상품명'), [items]);
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, filter: blocked ? 'grayscale(0.6) opacity(0.8)' : 'none' }}>
        <button onClick={onClose} style={closeStyle}>✕</button>
        <h3 style={{ fontSize: 20, marginTop: 4, marginBottom: 16 }}>배송 방법 변경</h3>
        <div style={{ borderTop: '1px solid #eee', margin: '8px 0 16px' }} />
        <p style={{ marginBottom: 16 }}>선택하신 <b>{items.length}</b>개 상품의 배송 방법을 선택해주세요.</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {titles.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, background: '#ddd', borderRadius: 6 }} />
              <div style={{ fontWeight: 600 }}>{t}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 20, fontWeight: 600 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="radio" name="method" value="smart" checked={method === 'smart'}
                   onChange={() => setMethod('smart')} disabled={blocked} />
            <span>스마트 배송</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="radio" name="method" value="pickup" checked={method === 'pickup'}
                   onChange={() => setMethod('pickup')} disabled={blocked} />
            <span>바로 찾음</span>
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, opacity: blocked ? 0.5 : 1 }}>
          <input type="checkbox" checked={alsoPutToPickup}
                 onChange={(e) => setAlsoPutToPickup(e.target.checked)} disabled={blocked} />
          <span>바로 찾음 장바구니에도 담아둘래요</span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={onClose}
                  style={{ padding: '12px 24px', background: '#e7efdf', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            취소
          </button>
          <button onClick={() => onConfirm?.(method, alsoPutToPickup)} disabled={blocked}
                  style={{ padding: '12px 24px', background: '#c8d8c0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalStyle = { backgroundColor: '#fff', borderRadius: 10, padding: 24, width: 520, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', position: 'relative' };
const closeStyle = { position: 'absolute', top: 10, right: 10, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' };
