import React from "react";
import s from "./FavoritesPage.module.css";

export default function FavoritesPage({ favorites = [] }) {
  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <h1 className={s.title}>즐겨찾기</h1>
        <div className={s.divider} />

        {favorites.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>아직 즐겨찾기한 마켓이 없어요</div>
            <div className={s.emptyDesc}>마이페이지에서 원하는 마켓을 즐겨찾기해 보세요.</div>
          </div>
        ) : (
          favorites.map((market) => (
            <div key={market.marketId} className={s.marketSection}>
              <h2 className={s.marketName}>{market.marketName}</h2>
              <div className={s.grid}>
                {market.products.map((p) => (
                  <div className={s.card} key={p.id}>
                    <img src={p.imageUrl} alt={p.name} className={s.img} />
                    <div className={s.body}>
                      <div className={s.name}>{p.name}</div>
                      <div className={s.footer}>
                        <div className={s.stars}>{renderStars(p.rating)}</div>
                        <div className={s.price}>{formatKRW(p.price)}~</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function renderStars(rating) {
  const n = Math.max(0, Math.min(5, Math.floor(Number(rating ?? 0))));
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}
function formatKRW(value) {
  if (value == null || isNaN(Number(value))) return "-";
  try {
    return Number(value).toLocaleString("ko-KR") + "원";
  } catch {
    return `${value}원`;
  }
}
