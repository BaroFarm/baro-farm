import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';

const dedupeBy = (arr, getKey) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = getKey(x) || '__empty__';
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export default function ProductSlider({ products = [], title = "", onMoreClick, onItemClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  const getId = (p) =>
    String(p?.id ?? p?.product_id ?? p?.productId ?? p?.sku ?? p?.slug ?? p?.name ?? '').trim();

  // 1) 중복 제거된 목록(렌더에 실제 사용)
  const items = useMemo(() => dedupeBy(products, getId), [products]);

  // 2) 현재 페이지 아이템
  const visibleProducts = items.slice(currentIndex, currentIndex + itemsPerPage);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex + itemsPerPage < items.length;

  const nextSlide = () => {
    if (canNext) setCurrentIndex((i) => i + itemsPerPage);
  };
  const prevSlide = () => {
    if (canPrev) setCurrentIndex((i) => Math.max(i - itemsPerPage, 0));
  };

  return (
    <div style={{ width: '100%', padding: 0, position: 'relative' }}>
      {/* 제목 + 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</h2>
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
          {visibleProducts.map((product, i) => {
            const base = getId(product) || 'item';
            const globalIndex = currentIndex + i;           // 🔑 전역 인덱스 포함
            const key = `${base}-${globalIndex}`;
            return (
              <div key={key} style={{ flexShrink: 0, flexGrow: 0, maxWidth: 233, width: 233 }}>
                <ProductCard
                  product={product}
                  onClick={onItemClick ? () => onItemClick(product) : undefined}
                />
              </div>
            );
          })}
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
        >
          ▶
        </button>
      </div>
    </div>
  );
}
