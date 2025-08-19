import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

const toId = (p) =>
  String(p?.id ?? p?.product_id ?? p?.productId ?? p?.sku ?? p?.slug ?? '').trim();

export default function ProductSlider({ products = [], title = "", onMoreClick, onItemClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  // 아이템별 안정 key 저장소 (객체 참조 -> uuid)
  const keyStoreRef = useRef(new WeakMap());
  const getStableKey = useCallback((p) => {
    const id = toId(p);
    if (id) return id;                   // id 있으면 그걸 사용
    if (!keyStoreRef.current.has(p)) {   // 없으면 1회만 uuid 부여
      keyStoreRef.current.set(p, crypto.randomUUID());
    }
    return keyStoreRef.current.get(p);
  }, []);

  // 1) 안정 키를 부여하고, 그 키로 dedupe
  const items = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of products ?? []) {
      const k = getStableKey(p);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ...p, __key: k });
    }
    return out;
  }, [products, getStableKey]);

  // 2) products가 바뀌면 인덱스 범위 보정
  useEffect(() => {
    const maxStart = Math.max(0, items.length - itemsPerPage);
    if (currentIndex > maxStart) setCurrentIndex(maxStart);
  }, [items.length, itemsPerPage, currentIndex]);

  const start = currentIndex;
  const end = start + itemsPerPage;
  const visibleProducts = items.slice(start, end);

  const canPrev = start > 0;
  const canNext = end < items.length;

  const nextSlide = () => { if (canNext) setCurrentIndex(i => i + itemsPerPage); };
  const prevSlide = () => { if (canPrev) setCurrentIndex(i => Math.max(i - itemsPerPage, 0)); };

  return (
    <div style={{ width: '100%', padding: 0, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>{title}</h2>
        {onMoreClick && (
          <button onClick={onMoreClick} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' }}>
            정기배송 상품 더보기 &gt;
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden', justifyContent: 'flex-start' }}>
          {visibleProducts.map((product) => (
            <div key={product.__key} style={{ flexShrink: 0, flexGrow: 0, maxWidth: 233, width: 233 }}>
              <ProductCard
                product={product}
                onClick={onItemClick ? () => onItemClick(product) : undefined}
              />
            </div>
          ))}
          {visibleProducts.length === 0 && (
            <div style={{ padding: 16, color: '#888' }}>표시할 상품이 없습니다.</div>
          )}
        </div>

        <button
          onClick={prevSlide}
          disabled={!canPrev}
          style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #ccc', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', zIndex: 10, opacity: canPrev ? 1 : 0.3
          }}
          aria-label="이전"
        >
          ◀
        </button>

        <button
          onClick={nextSlide}
          disabled={!canNext}
          style={{
            position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #ccc', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', zIndex: 10, opacity: canNext ? 1 : 0.3
          }}
          aria-label="다음"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
