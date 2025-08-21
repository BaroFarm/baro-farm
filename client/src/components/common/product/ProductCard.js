import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

// .env에 REACT_APP_API_BASE_URL=http://localhost:3002 (실서버 주소) 넣어두는 걸 권장
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

const FALLBACK_IMG =
  API_BASE
    ? `${API_BASE}/images/mock/no-image-240.png`
    : `${process.env.PUBLIC_URL}/images/mock/no-image-240.png`;

// 상대경로 → 절대경로
const normalizeImg = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;       // http(s) 절대 URL 그대로
  if (u.startsWith('/images')) return `${API_BASE}${u}`;  // ✅ 서버 정적 경로는 API_BASE 붙이기
  if (u.startsWith('/')) return u;             // 기타 루트 경로는 그대로
  return '/' + u.replace(/^\.?\/*/, '');       // 상대 → 루트
};

export default function ProductCard({ product, onClick }) {
  const navigate = useNavigate();
  console.log("[Card] render", product?.id, product?.name, product?.image);

  const pid = String(
    product?.id ??
    product?.product_id ??
    product?.productId ??
    ''
  ).trim();

  const name =
    (String(product?.name ?? product?.title ?? product?.product_name ?? '').trim()) || '상품';

  const priceNum = Number(product?.price ?? product?.sale_price ?? product?.amount ?? 0);

  const imageSrcRaw =
    product?.image ??
    product?.image_url ??
    product?.img_url ??
    product?.main_image_url ??
    product?.thumbnail ??
    product?.ProductImgs?.[0]?.img_url ??
    product?.product_imgs?.[0]?.img_url ??
    product?.images?.[0]?.image_url ??
    product?.images?.[0]?.url ??
    null;

  const imageSrc = normalizeImg(imageSrcRaw) || FALLBACK_IMG;

  // const rating = Math.max(
  //   0,
  //   Math.min(5, Number(product?.average_rating ?? product?.rating ?? product?.score ?? 0))
  // );

  // 1) API 값 우선
  const ratingRaw = Number(product?.average_rating ?? product?.rating ?? product?.score);

  // 2) 없으면 임의 별점 생성 (항상 동일하게 보이도록)
  function seededDemoRating(seedStr) {
    const s = String(seedStr || '');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const frac = Math.abs(Math.sin(h)) % 1; // 0~1
    const v = 3.8 + frac * 1.1;            // 3.8 ~ 4.9
    return Math.round(v * 2) / 2;           // 0.5 단위 반올림
  }

  const rating = Number.isFinite(ratingRaw) && ratingRaw > 0
    ? Math.min(5, Math.max(0, ratingRaw))
    : seededDemoRating(pid || name);

  const goDetail = () => {
    if (!pid) return;
    navigate(`/shop/product/${encodeURIComponent(pid)}`);
  };

  const handleClick = (e) => {
    try {
      if (onClick) {
        // 부모가 false를 반환하면 내비게이션 취소
        const res = onClick(product, e);
        if (res === false) return;
      }
    } catch (err) {
      // 부모 핸들러 에러가 나더라도 상세 이동은 시도
      console.error('onClick error in ProductCard:', err);
    }
    goDetail();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      className="border rounded p-3"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{
        width: '100%',
        height: 250,
        backgroundColor: '#eee',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#555',
        cursor: 'pointer',
      }}
    >
      {/* 이미지 */}
      <img
        src={imageSrc}
        alt={name}
        onError={(e) => {
          if (!e.currentTarget.src.includes('no-image-240.png')) {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMG;
          }
        }}
        style={{ width: '100%', height: 150, objectFit: 'cover' }}
      />

      {/* 상품명 + 가격 */}
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            fontWeight: 600,
            fontSize: 15,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: 8,
          }}
          title={name}
        >
          {name}
        </h3>

        <span style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: 14, flexShrink: 0 }}>
          {priceNum ? `${priceNum.toLocaleString()}원` : '가격 정보 없음'}
        </span>
      </div>

      {/* 별점: p → div (hydration 에러 방지) */}
      <div>
        <StarRating value={rating} size={20} />
      </div>
    </div>
  );
}
