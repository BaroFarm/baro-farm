import React, { useEffect, useMemo, useState } from "react";
import s from "./CouponsPage.module.css";

export default function CouponsPage({ banners = [], coupons = [], onClaim }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  // 3개씩 묶어 한 줄(연두 박스)로
  const rows = useMemo(() => chunk(coupons, 3), [coupons]);

  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <div className={s.headerRow}>
          <h1 className={s.title}>쿠폰 (할인권)</h1>
          <div className={s.ai}>AI 챗봇</div>
        </div>
        <div className={s.hr} />

        {/* 배너 */}
        <div className={s.banner}>
          {banners.length ? (
            <img
              key={banners[idx]?.id}
              className={s.bannerImg}
              src={banners[idx]?.imageUrl}
              alt={banners[idx]?.alt || "프로모션 배너"}
            />
          ) : (
            <div className={s.bannerPlaceholder}>
              <div>홍보 배너<br />(자동 슬라이드 형식)</div>
            </div>
          )}
        </div>

        {/* 쿠폰 리스트 */}
        <div className={s.listWrap}>
          {coupons.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyTitle}>사용 가능한 쿠폰이 없어요</div>
              <div className={s.emptyDesc}>이벤트 참여 또는 발급 후 이곳에서 확인할 수 있어요.</div>
            </div>
          ) : (
            rows.map((group, gi) => (
              <div className={s.rowBox} key={gi}>
                <div className={s.grid}>
                  {group.map((c) => (
                    <div className={s.card} key={c.id}>
                      {/* 왼쪽: 썸네일 */}
                      <div className={s.leftCol}>
                        <img className={s.thumb} src={c.imageUrl} alt={c.productName} />
                      </div>

                      {/* 가운데: 할인 배지 + 이름/마켓 */}
                      <div className={s.centerCol}>
                        {c.discountText ? (
                          <span className={s.badge}>{c.discountText}</span>
                        ) : null}
                        <div className={s.prod}>{c.productName}</div>
                        <div className={s.market}>{c.marketName}</div>
                      </div>

                      {/* 오른쪽: 연한 초록 패널 + 텍스트(버튼 아님) */}
                      <div
                        className={s.rightCol}
                        onClick={() => (onClaim ? onClaim(c.id) : null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (onClaim ? onClaim(c.id) : null)}
                      >
                        <span className={s.claimText}>쿠폰 받기</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
