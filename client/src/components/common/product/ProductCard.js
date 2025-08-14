import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

const FALLBACK_IMG = `${process.env.PUBLIC_URL}/images/mock/no-image-240.png`; // public 기준

// 상대경로 → 절대경로로 정규화
const normalizeImg = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;          // http(s)면 그대로
  if (u.startsWith('/')) return u;                // /images/mock/...
  return '/' + u.replace(/^\.?\/*/, '');          // images/mock/.. → /images/mock/..
};

export default function ProductCard({ product, onClick }) {
  const navigate = useNavigate();

  // ✅ id 통합
  const pid = String(
    product?.id ??
    product?.product_id ??
    product?.productId ??
    ''
  );

  // ✅ 상품명 통합
  const name = (String(
    product?.name ??
    product?.title ??
    product?.product_name ??
    ''
  ).trim()) || '상품';

  // ✅ 가격 통합
  const priceNum = Number(
    product?.price ??
    product?.sale_price ??
    product?.amount ??
    0
  );

  // ✅ 이미지 통합 (백엔드/프론트 다양한 키 모두 커버)
  const imageSrcRaw =
    product?.image ??
    product?.image_url ??
    product?.img_url ??                         // ← product_img 단일 필드
    product?.main_image_url ??
    product?.thumbnail ??
    product?.ProductImgs?.[0]?.img_url ??       // ← Sequelize include: ProductImgs
    product?.product_imgs?.[0]?.img_url ??      // ← 다른 alias 가능성
    product?.images?.[0]?.image_url ??
    product?.images?.[0]?.url ??
    null;

  const imageSrc = normalizeImg(imageSrcRaw) || FALLBACK_IMG;

  // ✅ 평점 통합
  const rating = Math.max(
    0,
    Math.min(
      5,
      Number(product?.average_rating ?? product?.rating ?? product?.score ?? 0)
    )
  );

  // ✅ 클릭 핸들러
  const handleClick = () => {
    if (onClick) return onClick();
    if (!pid) return;
    navigate(`/shop/product/${pid}`);
  };

  return (
    <div
      className="border rounded p-3"
      onClick={handleClick}
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
        referrerPolicy="no-referrer"
        onError={(e) => {
          // 무한루프 방지
          if (!e.currentTarget.src.includes('no-image-240.png')) {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMG;
          }
        }}
        style={{ width: '100%', height: 150, objectFit: 'cover' }}
      />

      {/* 상품명 + 가격 한 줄 */}
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

        <span
          style={{
            fontWeight: 'bold',
            color: '#2e7d32',
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {priceNum ? `${priceNum.toLocaleString()}원` : '가격 정보 없음'}
        </span>
      </div>

      {/* 별점 */}
      <p>
        <StarRating value={rating} size={20} />
      </p>
    </div>
  );
}
