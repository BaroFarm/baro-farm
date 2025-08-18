// components/payment/OrderItemList.jsx
import React, { useEffect, useState } from 'react';

const BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const imgCache = new Map(); // product_id -> image_url|null

// 상대경로 → 절대경로
const toAbs = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return BASE ? `${BASE}${raw}` : raw;
};

function OrderItemRow({ item }) {
  const pid = item.product_id ?? item.id;           // 상품 id
  const initial =
    item.image ||
    item.image_url ||
    item.thumbnail ||
    null;

  const [img, setImg] = useState(toAbs(initial));

  useEffect(() => {
    let alive = true;
    if (!pid || img) return;             // id 없거나 이미 이미지 있으면 스킵

    if (imgCache.has(pid)) {             // 캐시 우선
      if (alive) setImg(toAbs(imgCache.get(pid)));
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${BASE}/api/products/${pid}?ts=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
          imgCache.set(pid, null);
          return;
        }
        const js = await res.json();
        const url =
          js?.data?.images?.[0]?.url ||
          js?.data?.image_url ||
          null;

        imgCache.set(pid, url);
        if (alive) setImg(toAbs(url));
      } catch {
        imgCache.set(pid, null);
      }
    })();

    return () => { alive = false; };
  }, [pid, img]);

  const price = Number(item.price || 0);
  const qty = Number(item.quantity || 0);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        marginLeft: '15px',
        gap: '16px',
      }}
    >
      {/* 이미지: 없으면 플레이스홀더 렌더 */}
      {img ? (
        <img
          src={img}
          alt={item.name || item.product_name || '상품'}
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
          onError={(e) => {
            // 실패 시 이미지 감춤(빈 src 방지)
            e.currentTarget.onerror = null;
            e.currentTarget.src = '';
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '4px',
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 12,
          }}
        >
          no image
        </div>
      )}

      {/* 상품 정보 */}
      <div style={{ display: 'flex', gap: '40px', fontWeight: 'bold' }}>
        <div>{item.name || item.product_name || '상품명'}</div>
        <div>{price.toLocaleString()}원</div>
        <div>{qty}개</div>
        <div>{item.delivery || (item.delivery_type === 'pickup' ? '바로 찾음' : '스마트 배송')}</div>
      </div>
    </div>
  );
}

export default function OrderItemList({ items = [] }) {
  const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);

  return (
    <div
      style={{
        backgroundColor: '#f9faf8',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'left',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px', marginLeft: '15px' }}>
        주문 상품
      </div>

      {items.map((it) => (
        <OrderItemRow key={it.product_id ?? it.id} item={it} />
      ))}

      <div style={{ fontWeight: 'bold', marginTop: '20px', marginLeft: '15px' }}>총 상품 금액</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '15px' }}>
        {total.toLocaleString()}원
      </div>
    </div>
  );
}
