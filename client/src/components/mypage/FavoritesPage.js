// client/src/components/mypage/FavoritesPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";              // ✅ 상세 이동
import StarRating from "../common/product/StarRating";
import s from "./FavoritesPage.module.css";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const ASSET_BASE = (process.env.REACT_APP_ASSET_BASE_URL || API_BASE || "").replace(/\/$/, "");

function toAbsUrl(url) {
  const v = String(url || "").trim().replace(/\\/g, "/").replace(/\s/g, "");
  if (!v) return "/images/placeholder.png";
  if (/^https?:\/\//i.test(v)) return v;
  return `${ASSET_BASE}/${v.replace(/^\/+/, "")}`;
}

function formatKRW(value) {
  if (value == null || isNaN(Number(value))) return "-";
  try { return Number(value).toLocaleString("ko-KR") + "원"; }
  catch { return `${value}원`; }
}

export default function FavoritesPage({
  pageSize = 10,
  getToken = () => localStorage.getItem("accessToken") || "",
  onUnauthorized,
}) {
  const navigate = useNavigate();                            // ✅ useNavigate
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [favorites, setFavorites] = useState([]); // [{marketId, marketName, products: []}]
  const [pg, setPg] = useState({ currentPage: 1, totalPages: 1, totalElements: 0, pageSize });

  // ── 스토어 대표상품 4개만 가져오기 ───────────────────────────
  async function fetchStoreProducts(storeId, signal) {
    const auth = { Authorization: `Bearer ${getTokenRef.current()}` };

    // 1) /api/stores/:id/products?limit=4
    try {
      const r = await fetch(`${API_BASE}/api/stores/${storeId}/products?limit=4`, { headers: auth, signal });
      if (r.ok) {
        const j = await r.json();
        const items = (j?.data?.products ?? j?.products ?? []).slice(0, 4);
        return items.map((p) => ({
          id: p.product_id ?? p.id ?? p.productId,
          name: p.name ?? p.title ?? "",
          price: p.price ?? 0,
          imageUrl: toAbsUrl(p.image_url ?? p.img_url ?? p.images?.[0]?.img_url),
          rating: Number(p.average_rating ?? p.rating_avg ?? p.rating ?? 0) || 0,
        })).filter(x => x.id != null);
      }
    } catch { /* fall through */ }

    // 2) /api/products?store_id=...&limit=4
    try {
      const r = await fetch(`${API_BASE}/api/products?store_id=${encodeURIComponent(storeId)}&limit=4`, { headers: auth, signal });
      if (r.ok) {
        const j = await r.json();
        const items = (j?.data?.products ?? j?.products ?? []).slice(0, 4);
        return items.map((p) => ({
          id: p.product_id ?? p.id ?? p.productId,
          name: p.name ?? p.title ?? "",
          price: p.price ?? 0,
          imageUrl: toAbsUrl(p.image_url ?? p.img_url ?? p.images?.[0]?.img_url),
          rating: Number(p.average_rating ?? p.rating_avg ?? p.rating ?? 0) || 0,
        })).filter(x => x.id != null);
      }
    } catch {}

    return [];
  }

  // 즐겨찾기 + 대표상품 하이드레이션
  async function fetchFavorites(page = 1, signal) {
    if (loading) return;
    setLoading(true);
    setErr("");

    const url = `${API_BASE}/api/my/favorites?page=${page}&limit=${pageSize}`;
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getTokenRef.current()}`,
        },
        signal,
      });

      if (signal?.aborted) return;

      if (res.status === 401) {
        setErr("로그인이 필요합니다.");
        setFavorites([]);
        if (typeof onUnauthorized === "function") onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const list = json?.data?.favoriteStores ?? json?.favoriteStores ?? [];
      const p = json?.data?.pagination ?? json?.pagination ?? {};

      const base = list.map((x) => ({
        marketId: x.store_id ?? x.market_id ?? x.id,
        marketName: x.store_name ?? x.storeName ?? x.name ?? "",
        products: [],
        createdAt: x.created_at ?? x.createdAt,
      })).filter(m => m.marketId != null);

      const productsList = await Promise.all(
        base.map((m) => fetchStoreProducts(m.marketId, signal).catch(() => []))
      );
      const hydrated = base.map((m, i) => ({ ...m, products: productsList[i] || [] }));

      setFavorites(hydrated);
      setPg({
        currentPage: p.currentPage ?? p.page ?? page,
        totalPages: p.totalPages ?? p.pages ?? 1,
        totalElements: p.totalElements ?? p.total ?? hydrated.length,
        pageSize: p.pageSize ?? p.limit ?? pageSize,
      });
    } catch (e) {
      if (e.name !== "AbortError") setErr(e?.message || "즐겨찾기를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetchFavorites(1, ctrl.signal);
    return () => ctrl.abort();
  }, [pageSize]);

  const canPrev = useMemo(() => pg.currentPage > 1, [pg]);
  const canNext = useMemo(() => pg.currentPage < pg.totalPages, [pg]);

  const onPrev = () => { if (!loading && canPrev) fetchFavorites(pg.currentPage - 1); };
  const onNext = () => { if (!loading && canNext) fetchFavorites(pg.currentPage + 1); };

  // 상세 이동 핸들러
  const goDetail = (id) => navigate(`/shop/product/${id}`);

  return (
    <div className={s.wrap}>
      <div className={s.container}>
        <h1 className={s.title}>즐겨찾기</h1>
        <div className={s.divider} />

        {err && <div className={s.err}>{err}</div>}
        {loading && <div>불러오는 중…</div>}

        {(!loading && favorites.length === 0) ? (
          <div className={s.empty}>
            <div className={s.emptyTitle}>아직 즐겨찾기한 마켓이 없어요</div>
            <div className={s.emptyDesc}>마이페이지에서 원하는 마켓을 즐겨찾기해 보세요.</div>
          </div>
        ) : (
          favorites.map((market) => (
            <div key={market.marketId} className={s.marketSection}>
              <h2 className={s.marketName}>{market.marketName}</h2>

              <div className={s.grid}>
                {(market.products?.length ? market.products : [{ id: "__placeholder__" }]).map((p) =>
                  p.id === "__placeholder__" ? (
                    <div className={s.card} key="placeholder">
                      <div className={s.body}>
                        <div className={s.name}>대표 상품 정보가 없습니다</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={s.card}
                      key={p.id}
                      onClick={() => goDetail(p.id)}              // ✅ 카드 클릭 이동
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(p.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={toAbsUrl(p.imageUrl)}
                        alt={p.name}
                        className={s.img}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          if (e.currentTarget.dataset.fallback === "1") return;
                          e.currentTarget.dataset.fallback = "1";
                          e.currentTarget.src = "/images/placeholder.png";
                        }}
                      />
                      <div className={s.body}>
                        <div className={s.name}>{p.name}</div>
                        <div className={s.footer}>
                          <div className={s.stars}>
                            <StarRating value={p.rating} size={16} />
                          </div>
                          <div className={s.price}>{formatKRW(p.price)}~</div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}

        <div className={s.pager}>
          <button className={s.btn} onClick={onPrev} disabled={!canPrev || loading}>이전</button>
          <span>{pg.currentPage} / {pg.totalPages}</span>
          <button className={s.btn} onClick={onNext} disabled={!canNext || loading}>다음</button>
        </div>
      </div>
    </div>
  );
}
