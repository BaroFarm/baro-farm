import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import s from "./CouponsPage.module.css";
import PromoBanner from '../common/PromoBanner';

export default function CouponsPage({ banners = [], onClaim }) {
  const [idx, setIdx] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);

  //배너 자동 슬라이드 -> 쿠폰 페이지 배너 따로 있는 경우 PromoBanner 말고 이거 사용
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    async function fetchCoupons() {
      try {
      const token =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) {
        console.warn("로그인이 필요합니다.");
        setCoupons([]); // 또는 로그인 페이지로 유도
        return;
      }

      const res = await axios.get("/api/my/coupons/downloadable", {
        params: { page: 1, limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data?.status === "success") {
        // 1) 응답 -> 프론트 모델 매핑
        const list = (res.data.data?.downloadableCoupons || []).map((c) => {
        const isPct = c.type === "PERCENTAGE" || c.type === "percent";
        const discountText = isPct
          ? "퍼센트 할인 쿠폰" // 서버에서 discount_value 내려오면 `${c.discount_value}% 할인`로 교체
          : (c.max_discount != null
          ? `${Number(c.max_discount).toLocaleString()}원 할인`
          : "정액 할인 쿠폰");

        return {
          id: c.coupon_id,
          name: c.coupon_name,
          type: c.type,                          // PERCENTAGE | FIXED_AMOUNT(혹은 AMOUNT)
          minOrder: c.min_order_account,         // 최소주문금액
          maxDiscount: c.max_discount,           // (퍼센트일 때 상한)
          validFrom: c.valid_from,
          validAt: c.valid_at,
          discountText,                          // 배지에 쓸 문구
          imageUrl: "/images/mock/no-image-240.png", // 백엔드가 이미지 안 주므로 임시
          };
        });
        setCoupons(list);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        console.error("인증 만료/누락 – 다시 로그인 필요");
      } else {
        console.error("쿠폰 불러오기 실패:", err);
      }
    }
  }
  fetchCoupons();
}, []);

  // 쿠폰 다운로드 처리
  async function handleClaim(couponId) {
    const token =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await axios.post(
        "/api/my/coupons",
        { coupon_id: couponId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status === "success") {
        alert("쿠폰이 발급되었습니다.");
        // 해당 쿠폰 claimed 상태로 변경
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === couponId ? { ...c, claimed: true } : c
          )
        );
      }
    } catch (err) {
      if (err?.response?.data?.code === "ALREADY_ISSUED") {
        alert("이미 발급받은 쿠폰입니다.");
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === couponId ? { ...c, claimed: true } : c
          )
        );
      } else {
        console.error("쿠폰 발급 실패:", err);
      }
    }
  }

  //보유 쿠폰 목록
  useEffect(() => {
    async function fetchMyCoupons(){
      try{
        const token =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (!token){
          setMyCoupons([]);
          return;
        }
        const res = await axios.get("/api/my/coupons", {
          params: {page:1, limit: 12},
          headers: {Authorization: `Bearer ${token}`},
        });
        if (res.data?.status === "success"){
          const list = (res.data.data?.coupons || []).map((m) => {
            const isPct = m.type === "PERCENTAGE" || m.type === "percent";
            const discountText = isPct
              ? (m.discount_value != null ? `${m.discount_value}% 할인` : "퍼센트 할인 쿠폰")
              : (m.discount_value != null
                ? `${Number(m.discount_value).toLocaleString()}원 할인`
                : (m.max_discount != null
                  ? `${Number(m.max_discount).toLocaleString()}원 할인`
                  : "정액 할인 쿠폰"));
            return {
              issueId: m.issue_coupon_id,
              id: m.coupon_id,
              name: m.coupon_name,
              type: m.type,
              discountText,
              minOrder: m.min_order_account,
              maxDiscount: m.max_discount,
              validFrom: m.valid_from,
              validAt: m.valid_at,
              status: m.status,                         // issued | used | expired
              imageUrl: "/images/mock/no-image-240.png",
            };
          });
        setMyCoupons(list);
        
        const ownedIds = new Set(list.map((x) => x.id));
        setCoupons((prev) => prev.map((c) => (
          ownedIds.has(c.id) ? { ...c, claimed: true } : c
        )));
      }
    } catch (e) {
      console.error("보유 쿠폰 불러오기 실패:", e);
    }
  }
  fetchMyCoupons();
}, []);

            
        
      

  // 3개씩 묶어 한 줄(연두 박스)로
  const rows = useMemo(() => chunk(coupons, 3), [coupons]);
  const myRows = useMemo(() => chunk(myCoupons, 3), [myCoupons]);

  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <div className={s.headerRow}>
          <h1 className={s.title}>쿠폰 (할인권)</h1>
          <div className={s.ai}>AI 챗봇</div>
        </div>
        <div className={s.hr} />

        {/* 배너 */}
        {/* <div className={s.banner}>
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
        </div> */}
        <PromoBanner />

        {/* 쿠폰 리스트 */}
        <div className={s.listWrap}>
          {coupons.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyTitle}>사용 가능한 쿠폰이 없어요</div>
              <div className={s.emptyDesc}>이벤트 참여 또는 발급 후 이곳에서 확인할 수 있어요.</div>
            </div>
          ) : (
            rows.map((group, gi) => (
              <div className={s.rowBox} key={`row-${gi}`}>
                <div className={s.grid}>
                  {group.map((c) => (
                    <div className={s.card} key={`card-${c.id}`}>
                      {/* 왼쪽: 썸네일 */}
                      <div className={s.leftCol}>
                        <img className={s.thumb} src={c.imageUrl} alt={c.name} />
                      </div>

                      {/* 가운데: 할인 배지 + 이름/마켓 */}
                      <div className={s.centerCol}>
                        {c.discountText ? (
                          <span className={s.badge}>{c.discountText}</span>
                        ) : null}
                        <div className={s.prod}>{c.name}</div>
                        <div className={s.market}>최소주문 {c.minOrder ? c.minOrder.toLocaleString() : 0}원
                          {c.type?.includes("PERCENT") && c.maxDiscount
                            ? ` · 최대 ${c.maxDiscount.toLocaleString()}원`
                            : ""}</div>
                        </div>

                      <div
                        className={`${s.rightCol} ${
                          c.claimed ? s.disabled : ""
                        }`}
                        onClick={() => !c.claimed && handleClaim(c.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className={s.claimText}>
                          {c.claimed ? "발급완료" : "쿠폰 받기"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {/* 보유한 쿠폰 섹션 */}
        <div className={s.hr} />
        <div className={s.headerRow}>
          <h2 className={s.title}>보유한 쿠폰</h2>
        </div>

        <div className={s.listWrap}>
          {myCoupons.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyTitle}>보유한 쿠폰이 없어요</div>
              <div className={s.emptyDesc}>발급받은 쿠폰은 이곳에서 확인할 수 있어요.</div>
            </div>
          ) : (
            myRows.map((group, gi) => (
              <div className={s.rowBox} key={`mine-${gi}`}>
                <div className={s.grid}>
                  {group.map((c) => {
                    const expired = c.status === "expired" || (c.validAt && new Date(c.validAt) < new Date());
                    const used = c.status === "used";
                    const rightText = used ? "사용완료" : (expired ? "기간만료" : "보유중");
                    return (
                      <div className={s.card} key={`mine-card-${c.issueId || c.id}`}>
                        <div className={s.leftCol}>
                          <img className={s.thumb} src={c.imageUrl} alt={c.name} />
                        </div>
                        <div className={s.centerCol}>
                          {c.discountText ? <span className={s.badge}>{c.discountText}</span> : null}
                          <div className={s.prod}>{c.name}</div>
                          <div className={s.market}>
                            유효기간 {new Date(c.validFrom).toLocaleDateString()} ~ {new Date(c.validAt).toLocaleDateString()}
                          </div>
                        </div>
                        {/* 보유목록은 클릭 비활성(회색) */}
                        <div className={`${s.rightCol} ${s.disabled}`}>
                          <span className={s.claimText}>{rightText}</span>
                        </div>
                      </div>
                    );
                  })}
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
