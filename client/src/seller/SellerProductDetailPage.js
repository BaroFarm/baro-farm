// src/seller/SellerProductDetailPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CouponCard from './CouponCard';
import ProductDetailInfo from '../components/productDetail/ProductDetailInfo';

const GREEN_LIGHT = '#A8CFA3';
const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
const PLACEHOLDER_IMG = '/images/mock/no-image-240.png';

function toAbs(u) {
  const v = String(u || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (!API_BASE) return v.replace(/^\/+/, '');
  return `${API_BASE}/${v.replace(/^\/+/, '')}`;
}
function toKRW(n) {
  const x = Number(n);
  if (!isFinite(x)) return '-';
  try { return x.toLocaleString('ko-KR') + '원'; } catch { return `${x}원`; }
}
async function safeJson(res) { try { return await res.json(); } catch { return null; } }
function normalize(d) {
  if (!d || typeof d !== 'object') return null;
  const id = d.product_id ?? d.id;
  const name = String(d.title ?? d.name ?? '상품').trim() || '상품';
  const img =
    d.image_url ??
    d.image ??
    d.thumbnail ??
    d.images?.[0]?.image_url ??
    d.images?.[0]?.img_url ??
    d.images?.[0]?.url ??
    d.img_url ??
    '';
  const images =
    Array.isArray(d.images)
      ? d.images.map(x => x.image_url || x.img_url || x.url).filter(Boolean)
      : [];
  return {
    id,
    name,
    title: name,
    intro: d.intro ?? d.description ?? '',
    price: Number(d.price ?? 0),
    weight: d.weight ?? null,
    returnable: d.returnable ?? d.is_returnable ?? false,
    regular_delivery: d.regular_delivery ?? d.is_subscription ?? false,
    image_url: img,
    images,
    created_at: d.created_at ?? null,
    updated_at: d.updated_at ?? null,
    // 상세 탭에서 쓸 수 있는 필드들 그대로 전달
    video_url: d.video_url ?? '',
    is_video: d.is_video ?? Boolean(d.video_url),
    detail_page: d.detail_page ?? { figma_export_url: d.figma_export_url ?? '' },
    store_name: d.store_name ?? d.store?.name ?? '내 스토어',
  };
}

export default function SellerProductDetailPage() {
  const { id } = useParams(); // /seller/products/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [p, setP] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr('');
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) { setErr('로그인이 필요합니다.'); return; }

        const u = new URL(`/api/store/product/${id}`, API_BASE);
        u.searchParams.set('_', Date.now());
        const res = await fetch(u.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        });
        const json = await safeJson(res);
        if (!res.ok) throw new Error(json?.message || json?.error?.message || `조회 실패 (${res.status})`);

        const raw = json?.data ?? json;
        let norm = normalize(raw);

        if (!norm.image_url) {
          try {
            const u2 = new URL(`/api/products/${id}`, API_BASE);
            u2.searchParams.set('_', Date.now());
            const res2 = await fetch(u2.toString(), { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            if (res2.ok) {
              const j2 = await safeJson(res2);
              const d2 = j2?.data ?? j2?.product ?? j2;
              const buyerImg =
                d2?.image_url ||
                d2?.main_image_url ||
                d2?.thumbnail ||
                d2?.images?.[0]?.image_url ||
                d2?.images?.[0]?.img_url ||
                d2?.images?.[0]?.url || '';
              if (buyerImg) norm = { ...norm, image_url: buyerImg };
            }
          } catch {}
        }
        if (alive) setP(norm);
      } catch (e) {
        console.error(e);
        if (alive) setErr(e.message || '상품 정보를 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleEdit = () => navigate(`/seller/products/${id}/edit`);

  // 안전값
  const imgSrc = useMemo(() => {
    const pid = String(p?.id ?? p?.product_id ?? "");
    const name = String(p?.name ?? p?.title ?? "상품");
    // ProductSummary와 동일한 후보 우선순위
    const raw =
      p?.image_url ||
      p?.image ||
      p?.thumbnail ||
      p?.main_image_url ||
      p?.images?.[0] || ""; // normalize에서 images 배열을 만들어둠

    const url =
      typeof raw === "string"
        ? raw
        : (raw?.image_url || raw?.img_url || raw?.url || "");

    const picked =
      url ||
      `https://picsum.photos/seed/${encodeURIComponent(pid || name || "default")}/800/600`;

    return /^https?:\/\//i.test(picked) ? picked : toAbs(picked);
  }, [p?.image_url, p?.image, p?.thumbnail, p?.main_image_url, p?.images, p?.id, p?.product_id, p?.name, p?.title]);

  if (loading) return <div style={styles.section}><p>불러오는 중…</p></div>;
  if (err) return <div style={styles.section}><p style={{ color: 'crimson' }}>{err}</p></div>;
  if (!p) return <div style={styles.section}><p>상품을 찾을 수 없습니다.</p></div>;

  return (
    <>
      {/* 상단 요약 영역: ProductSummary 톤 */}
      <section style={styles.section}>
        {/* 왼쪽 450px */}
        <div style={styles.leftCol}>
          <h3 style={styles.leftTitle}>상품 상세</h3>

          <div style={styles.storeRow}>
            <h2 style={styles.storeName}>{p.store_name}</h2>
            <p
              style={{
                ...roundStyle,
                backgroundColor: p.returnable ? '#B6D19B' : '#D9D9D9',
                margin: 0,
              }}
            >
              {p.returnable ? '반품 가능' : '반품 불가'}
            </p>
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </div>

          <div style={styles.imageWrap}>
            <img
              src={imgSrc}
              alt={p.name}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
              style={styles.image}
            />
            <button style={styles.editInImage} onClick={handleEdit}>✎ 수정하기</button>
          </div>
        </div>

        {/* 오른쪽 */}
        <div style={styles.rightCol}>
          <h2 style={styles.productTitle}>
            {p.name} {p.weight ? <span style={styles.variant}>({p.weight})</span> : null}
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </h2>

          <p style={styles.desc}>
            {p.intro || '상품 설명이 없습니다.'}
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </p>

          <div style={styles.priceRow}>
            <p style={styles.price}>{toKRW(p.price)}</p>
            <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button>
          </div>

          {/* 쿠폰 예시 */}
          <div style={styles.couponRow}>
            <div style={{ flex: '1 1 0' }}>
              <CouponCard />
            </div>
          </div>

          {/* 액션 – 판매자 페이지라 관리 버튼 위주로 두어도 됨 */}
          <div style={styles.actions}>
              <button
                style={{ ...roundStyle, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => alert('찜하기 기능은 추후 구현됩니다.')}
              >
                <img src="/logoWithoutText.svg" alt="찜" style={{ width: 20, height: 20 }} />
                찜하기
              </button>
  
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{ ...roundStyle, width: 100 }}
                  onClick={() => alert('장바구니 기능은 추후 구현됩니다.')}
                >
                  장바구니
                </button>
                <button
                  style={{ ...roundStyle, width: 100 }}
                  onClick={() => alert('구매하기 기능은 추후 구현됩니다.')}
                >
                  구매하기
                </button>
              </div>
            </div>
        </div>
      </section>

      {/* 하단 상세 섹션: ProductDetailInfo 그대로 사용 */}
      {/* <button style={styles.inlineEdit} onClick={handleEdit}>✎ 수정하기</button> */}
      <ProductDetailInfo product={p} />
    </>
  );
}

/* pill 버튼 공통 */
const roundStyle = {
  fontSize: 16,
  padding: '6px 12px',
  borderRadius: 999,
  backgroundColor: '#B6D19B',
  border: 'none',
  cursor: 'pointer',
  height: 'fit-content',
};

/* 레이아웃/스타일 */
const styles = {
  section: {
    display: 'flex',
    gap: 40,
    alignItems: 'start',
    padding: 24,
    maxWidth: 1200,
    margin: '0 auto',
    textAlign: 'left',
  },

  leftCol: { width: 450, display: 'flex', flexDirection: 'column' },
  leftTitle: { margin: '10px 0 30px 0', fontSize: 18 },
  storeRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  storeName: { margin: 0, fontSize: 20, fontWeight: 'bold' },

  imageWrap: { position: 'relative', width: 450, height: 300, overflow: 'hidden', borderRadius: 8 },
  image: { width: 450, height: 300, objectFit: 'cover', display: 'block' },
  editInImage: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    textShadow: '1px 1px 2px rgba(0,0,0,.85)',
    fontSize: 14,
    cursor: 'pointer',
  },

  rightCol: { flex: 1, minWidth: 0 },

  productTitle: {
    marginTop: 120,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  variant: { fontWeight: 'bold' },

  desc: { fontSize: 16, lineHeight: 1.6, color: '#333', whiteSpace: 'pre-line', margin: '6px 0 8px 0' },

  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' },
  price: { fontSize: 20, fontWeight: 'bold', margin: 0 },

  couponRow: { display: 'flex', gap: 16, alignItems: 'stretch', marginTop: 16, marginBottom: 18 },

  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },

  inlineEdit: {
    background: 'transparent',
    border: 'none',
    color: GREEN_LIGHT,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline',
  },
};
