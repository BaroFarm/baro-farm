import React from "react";
import { useNavigate } from "react-router-dom";

export default function WishlistPage({ items = [] }) {
  const navigate = useNavigate();
  const goDetail = (id) => navigate(`/shop/product/${id}`);

  return (
    
    <div className="wishlist-wrap">
      <style>{`
        .wishlist-wrap{display:flex;justify-content:center;width:100%}
        .wishlist-container{width:100%;max-width:1200px;padding:16px 16px 40px}
        .wishlist-title{font-size:22px;font-weight:600;margin:8px 0 12px}
        .wishlist-divider{height:1px;background:#e5e5e5;margin-bottom:22px}
        .wishlist-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        @media(max-width:1024px){.wishlist-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:640px){.wishlist-grid{grid-template-columns:1fr}}
        .card{border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#fff;
              box-shadow:0 1px 2px rgba(0,0,0,.04);transition:box-shadow .2s}
        .card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .card-img{width:100%;height:180px;object-fit:cover;display:block;background:#f7f7f7}
        .card-body{padding:12px 12px 0}
        .card-name{font-size:15px;font-weight:600;color:#222;margin:0 0 10px;
                   white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .card-footer{display:flex;align-items:center;justify-content:space-between;
                     background:#eaeaea;padding:10px;border-top:1px solid #ddd}
        .stars{font-size:18px;color:#f5c041;letter-spacing:1px;line-height:1}
        .price{font-size:15px;font-weight:700;color:#333}
        .empty{grid-column:1/-1;border:1px solid #eee;border-radius:12px;padding:40px 16px;text-align:center}
        .empty-title{font-size:16px;font-weight:600}
        .empty-desc{color:#666;font-size:13px;margin-top:6px}
      `}</style>

      <div className="wishlist-container">
        <h1 className="wishlist-title">찜 목록</h1>
        <div className="wishlist-divider" />

        <div className="wishlist-grid">
          {items.length === 0 ? (
            <div className="empty">
              <div className="empty-title">아직 찜한 상품이 없어요</div>
              <div className="empty-desc">마음에 드는 상품에서 “찜”을 눌러 보관해 보세요.</div>
            </div>
          ) : (
            items.map((p) => (
              <div className="card" key={p.id}>
                {/* 이미지만 클릭 시 상세 이동 */}
                <img
                  className="card-img"
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  onClick={() => goDetail(p.id)}
                  style={{ cursor: "pointer" }}
                />
                <div className="card-body">
                  {/* ✅ 텍스트로만 표시 (버튼 아님) */}
                  <div className="card-name">{p.name}</div>
                </div>
                {/* ✅ 회색 바: 별점 ← / 가격 → */}
                <div className="card-footer">
                  <div className="stars" aria-label={`별점 ${Math.floor(p.rating ?? 0)}점`}>
                    {renderStars(p.rating)}
                  </div>
                  <div className="price">{formatKRW(p.price)}~</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function renderStars(rating) {
  const n = Math.max(0, Math.min(5, Math.floor(Number(rating ?? 0))));
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}
function formatKRW(value) {
  if (value === undefined || value === null || isNaN(Number(value))) return "-";
  try { return Number(value).toLocaleString("ko-KR") + "원"; }
  catch { return `${value}원`; }
}
