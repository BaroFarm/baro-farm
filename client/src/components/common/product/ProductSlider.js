import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';

// 중복 제거 유틸 (한 번만 정의)
const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = getKey(x);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const getId = (p) =>
  String(p?.id ?? p?.product_id ?? p?.productId ?? p?.sku ?? p?.slug ?? p?.name ?? '').trim();

export default function ProductSlider({ products = [], title = "", onMoreClick, onItemClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  // 1) 중복 제거 (products 변경될 때만 재계산)
  const items = useMemo(() => dedupeBy(products, getId), [products]);

  // 2) products가 바뀌면 인덱스 범위 보정
  useEffect(() => {
    const maxStart = Math.max(0, items.length - itemsPerPage);
    if (currentIndex > maxStart) {
      setCurrentIndex(maxStart);
    }
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = currentIndex;
  const end = start + itemsPerPage;
  const visibleProducts = items.slice(start, end);

  const canPrev = start > 0;
  const canNext = end < items.length;

  const nextSlide = () => { if (canNext) setCurrentIndex((i) => i + itemsPerPage); };
  const prevSlide = () => { if (canPrev) setCurrentIndex((i) => Math.max(i - itemsPerPage, 0)); };

  return (
    <div style={{ width: '100%', padding: 0, position: 'relative' }}>
      {/* 제목 + 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>{title}</h2>
        {onMoreClick && (
          <button
            onClick={onMoreClick}
            style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' }}
          >
            정기배송 상품 더보기 &gt;
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        {/* 상품 카드 슬라이더 */}
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden', justifyContent: 'flex-start' }}>
          {visibleProducts.map((product) => {
            const pid = getId(product) || crypto.randomUUID(); // 키는 "안정적이고 유니크"하게
            return (
              <div key={pid} style={{ flexShrink: 0, flexGrow: 0, maxWidth: 233, width: 233 }}>
                <ProductCard
                  product={product}
                  onClick={onItemClick ? () => onItemClick(product) : undefined}
                />
              </div>
            );
          })}
          {visibleProducts.length === 0 && (
            <div style={{ padding: 16, color: '#888' }}>표시할 상품이 없습니다.</div>
          )}
        </div>

        {/* 좌우 버튼 */}
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
