// src/components/productDetail/ProductSummary.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCartModal from '../modal/AddCartModal';
import BuyNowModal from '../modal/BuyNowModal';
import StarRating from '../common/product/StarRating';

export default function ProductSummary({ product, subscriptionOnly = false }) {
  const navigate = useNavigate();
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openBuyModal, setOpenBuyModal] = useState(false);

  // ✅ 안전 가드
  const pid = String(product?.id ?? product?.product_id ?? '');
  const name = (product?.name ?? product?.title ?? '상품').toString();

  // ✅ 서버가 준 값이 있으면 초기값으로
  const initialScore = Math.max(0, Math.min(5, Number(product?.rating ?? product?.average_rating ?? 0)));
  const initialCount = Number(product?.rating_count ?? 0);

  const [ratingState, setRatingState] = useState({
    score: initialScore,
    count: initialCount,
  });

  // ✅ 별점 보완: summary 실패 → 리뷰목록으로 계산
  useEffect(() => {
    let alive = true;
    if (!pid) return;

    // 서버가 이미 평균/개수를 줬다면 굳이 다시 안 불러도 됨
    if (initialScore > 0 && initialCount > 0) return;

    const BASE = process.env.REACT_APP_API_BASE_URL || '';

    (async () => {
      // 목록으로 직접 계산
      try {
        const rr = await fetch(`${BASE}/api/products/${pid}/reviews?ts=${Date.now()}`, { cache: 'no-store' });
        if (!rr.ok) return;
        const js = await rr.json();
        const list = js?.reviews ?? js?.data?.reviews ?? js?.data ?? [];
        const nums = (Array.isArray(list) ? list : [])
          .map(r => Number(r.rating))
          .filter(n => !Number.isNaN(n) && n >= 0);

        const cnt = nums.length;
        const avg = cnt ? nums.reduce((a, b) => a + b, 0) / cnt : 0;

        if (alive) {
          setRatingState({
            score: Math.max(0, Math.min(5, Math.round(avg * 10) / 10)),
            count: cnt,
          });
        }
      } catch {
        // 실패 시 그대로 유지
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  // ✅ 이미지 URL 통합 + 폴백
  const imageSrc = useMemo(() => {
    const url =
      product?.image ??
      product?.image_url ??
      product?.thumbnail ??
      product?.main_image_url ??
      product?.images?.[0]?.image_url ??
      product?.images?.[0]?.url ??
      `https://picsum.photos/seed/${encodeURIComponent(pid || name || 'default')}/800/600`;
    return url;
  }, [product, pid, name]);

  const priceNum = Number(product?.price ?? 0);

  const handleAddToWishlist = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ product_id: product?.product_id ?? product?.id }),
      });
      if (res.status === 201) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || '찜 목록에 추가되었습니다!');
        return;
      }
      if (res.status === 409) {
        // 이미 존재
        alert('이미 찜 목록에 추가되어 있습니다.');
        return;
      }
      const json = await res.json().catch(() => ({}));
      alert(json.message || '찜하기에 실패했습니다.');
    } catch (err) {
      console.error('찜하기 에러:', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleAddToFavorites = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    try {
      const storeId = product?.store?.id ?? product?.direct_store?.direct_store_id;
      if (!storeId) return alert('매장 정보를 찾을 수 없습니다.');

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ store_id: Number(storeId) }),
      });
      const json = await res.json();
      alert(res.status === 201 ? (json.message || '즐겨찾기에 추가되었습니다.') : (json.message || '즐겨찾기 추가 실패!'));
    } catch (err) {
      console.error('즐겨찾기 추가 중 오류:', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <section style={{ display: 'flex', gap: '40px', alignItems: 'start', padding: '24px' }}>
      {/* 왼쪽 영역 */}
      <div style={{ width: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '10px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>상품 상세</h3>

        {/* 판매자명 + 즐겨찾기 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{product?.seller?.name ?? '판매자'}</h2>
          <button onClick={handleAddToFavorites} style={{ ...roundStyle, cursor: 'pointer' }}>
            즐겨찾기
          </button>
        </div>

        {/* 이미지 + 반품 뱃지 */}
        <div style={{ position: 'relative' }}>
          <img
            src={imageSrc}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(pid || name || 'default')}/800/600`;
            }}
            style={{ width: 450, height: 300, objectFit: 'cover' }}
          />
          <p
            style={{
              ...roundStyle,
              backgroundColor: product?.is_returnable ? '#B6D19B' : '#D9D9D9',
              position: 'relative',
              margin: '20px 10px',
              width: 'fit-content',
              fontSize: '16px',
            }}
          >
            {product?.is_returnable ? '반품 가능' : '반품 불가'}
          </p>
        </div>
      </div>

      {/* 오른쪽 영역 */}
      <div style={{ flex: 1 }}>
        <h2 style={{ marginTop: 120, textAlign: 'left' }}>
          {name} {product?.weight ? `(${product.weight})` : ''}
        </h2>
        <p style={{ textAlign: 'left' }}>{product?.intro ?? product?.description ?? ''}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {priceNum ? `${priceNum.toLocaleString()}원` : '가격 정보 없음'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating value={ratingState.score} size={20} />
            {ratingState.count > 0 && (
              <span style={{ fontSize: 14, color: '#666' }}>({ratingState.count})</span>
            )}
          </div>
        </div>

        {/* 쿠폰 영역 (나중에 추가) */}
        <div style={{ border: '1px solid gray', height: '100px' }}>쿠폰 영역 (나중에 추가)</div>

        {/* 버튼들 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            onClick={handleAddToWishlist}
            style={{ ...roundStyle, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <img src="/logoWithoutText.svg" alt="찜" style={{ width: '20px', height: '20px' }} />
            찜하기
          </button>

          {subscriptionOnly ? (
            <button
              style={{ ...roundStyle, width: '140px' }}
              onClick={() =>
                navigate(`/shop/subscription/apply/${product?.product_id ?? product?.id}`, {
                  state: {
                    productSnapshot: {
                      id: product?.product_id ?? product?.id,
                      title: name,
                      price: priceNum,
                      image_url: imageSrc,
                    },
                    from: 'subscription',
                  },
                })
              }
            >
              정기배송 신청
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setOpenCartModal(true)} style={{ ...roundStyle, width: '100px' }}>
                장바구니
              </button>
              {openCartModal ? (
                <AddCartModal openModal={openCartModal} setOpenModal={setOpenCartModal} product={product} />
              ) : null}

              <button onClick={() => setOpenBuyModal(true)} style={{ ...roundStyle, width: '100px' }}>
                구매하기
              </button>
              {openBuyModal ? (
                <BuyNowModal openModal={openBuyModal} setOpenModal={setOpenBuyModal} product={product} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const roundStyle = {
  fontSize: '16px',
  padding: '6px 12px',
  borderRadius: '999px',
  backgroundColor: '#B6D19B',
  border: 'none',
  cursor: 'pointer',
  height: 'fit-content',
};
