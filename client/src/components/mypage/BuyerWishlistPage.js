// src/components/mypage/WishlistPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StarRating from "../common/product/StarRating"; // ✅ 오타 주의: StarRating

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const ASSET_BASE = (process.env.REACT_APP_ASSET_BASE_URL || API_BASE || "").replace(/\/$/, "");

function toAbsUrl(url) {
  if (!url) return "/images/mock/no-image-240.png";
  if (/^https?:\/\//i.test(url)) return url;
  return `${ASSET_BASE}/${String(url).replace(/^\/+/, "")}`;
}

export default function WishlistPage({
  pageSize = 10,
  getToken = () => localStorage.getItem("accessToken") || "",
  onUnauthorized,
  debug = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [pg, setPg] = useState({ currentPage: 1, totalPages: 1, totalElements: 0, pageSize });
  const [lastDebug, setLastDebug] = useState({ status: null, url: "", raw: null });

  const goDetail = (id) => navigate(`/shop/product/${id}`);

  // 다양한 응답 스키마 흡수
  function normalize(json, fallbackPage, fallbackPageSize) {
    const d = json?.data ?? json ?? {};
    const listCandidate =
      d.favoriteProducts ??
      d.productWishlists ??
      d.items ??
      d.list ??
      [];
    const p = d.pagination ?? d.page ?? {};
    return {
      list: Array.isArray(listCandidate) ? listCandidate : [],
      pagination: {
        currentPage: p.currentPage ?? p.page ?? fallbackPage,
        totalPages: p.totalPages ?? p.pages ?? 1,
        totalElements: p.totalElements ?? p.total ?? (Array.isArray(listCandidate) ? listCandidate.length : 0),
        pageSize: p.pageSize ?? p.limit ?? fallbackPageSize,
      },
      raw: json,
    };
  }

  // 제품 정보 보강: 배치 → 실패 시 개별 호출 폴백
  const hydrateWithProducts = async (mapped) => {
    const ids = mapped.map(m => m.id).filter(Boolean);
    if (ids.length === 0) return mapped;

    // 공통 fetch 옵션
    const authHeader = { "Authorization": `Bearer ${getTokenRef.current()}` };

    // 1) 배치 시도: /api/products?ids=1,2,3  (없으면 404/400일 수 있음)
    try {
      const q = ids.join(",");
      const url = `${API_BASE}/api/products?ids=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: authHeader });
      if (res.ok) {
        const j = await res.json();
        const products =
          j?.data?.products ??
          j?.products ??
          [];
        const byId = new Map(
          products.map(p => [
            p.product_id ?? p.id ?? p.productId,
            p,
          ])
        );
        return mapped.map(m => {
          const p = byId.get(m.id);
          if (!p) return m;
          const img =
            p.image_url ?? p.img_url ?? p.images?.[0]?.img_url ?? m.imageUrl;
          const rating =
            p.average_rating ?? p.rating_avg ?? p.rating ?? m.rating ?? 0;
          return {
            ...m,
            imageUrl: toAbsUrl(img),
            rating: Number(rating) || 0,
          };
        });
      }
      // 배치가 2xx가 아니면 폴백으로
    } catch (_) {
      /* ignore, fallback below */
    }

    // 2) 폴백: /api/products/:id 를 병렬로 조회
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const r = await fetch(`${API_BASE}/api/products/${id}`, { headers: authHeader });
          if (!r.ok) return [id, null];
          const j = await r.json();
          // 단건 응답 스키마 후보
          const p = j?.data?.product ?? j?.product ?? j;
          return [id, p];
        })
      );
      const byId = new Map(results);
      return mapped.map(m => {
        const p = byId.get(m.id);
        if (!p) return m;
        const img =
          p.image_url ?? p.img_url ?? p.images?.[0]?.img_url ?? m.imageUrl;
        const rating =
          p.average_rating ?? p.rating_avg ?? p.rating ?? m.rating ?? 0;
        return {
          ...m,
          imageUrl: toAbsUrl(img),
          rating: Number(rating) || 0,
        };
      });
    } catch {
      return mapped; // 보강 실패시 원본 유지
    }
  };

  const fetchWishlists = async (page = 1, signal) => {
    if (loading) return;
    setLoading(true);
    setErr("");
    const url = `${API_BASE}/api/my/wishlists?page=${page}&limit=${pageSize}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getTokenRef.current()}`,
        },
        signal,
      });

      if (signal?.aborted) return;

      if (res.status === 401) {
        setErr("로그인이 필요합니다.");
        setItems([]);
        setLastDebug({ status: 401, url, raw: null });
        if (typeof onUnauthorized === "function") onUnauthorized();
        else navigate("/login", { replace: true, state: { from: location } });
        return;
      }

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : {}; } catch { /* noop */ }
      setLastDebug({ status: res.status, url, raw: json ?? text ?? null });

      if (!res.ok) throw new Error(`HTTP ${res.status}${text ? ` - ${text.slice(0, 200)}` : ""}`);

      const { list, pagination } = normalize(json, page, pageSize);

      // 기본 매핑 (wishlist 필드 기준)
      const base = list.map((x) => ({
        id: x.product_id ?? x.id ?? x.productId,
        name: x.product_name ?? x.title ?? x.name,
        price: x.price,
        imageUrl: toAbsUrl(x.img_url ?? x.image_url ?? x.imageUrl),
        storeName: x.store_name ?? x.storeName,
        createdAt: x.created_at ?? x.createdAt,
        rating: Number.isFinite(Number(x.rating)) ? Number(x.rating) : 0,
      })).filter(v => v.id != null);

      // 제품 API로 이미지/별점 보강
      const hydrated = await hydrateWithProducts(base);

      setItems(hydrated);
      setPg({
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalElements: pagination.totalElements,
        pageSize: pagination.pageSize,
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      setErr(e?.message || "찜 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchWishlists(1, ctrl.signal);
    return () => ctrl.abort();
  }, [pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPrev = useMemo(() => pg.currentPage > 1, [pg]);
  const canNext = useMemo(() => pg.currentPage < pg.totalPages, [pg]);

  const onPrev = () => {
    if (!loading && canPrev) {
      const ctrl = new AbortController();
      fetchWishlists(pg.currentPage - 1, ctrl.signal);
    }
  };
  const onNext = () => {
    if (!loading && canNext) {
      const ctrl = new AbortController();
      fetchWishlists(pg.currentPage + 1, ctrl.signal);
    }
  };

  return (
    <div className="wishlist-wrap">
      <style>{`
        .wishlist-wrap{display:flex;justify-content:center;width:100%}
        .wishlist-container{width:100%;max-width:1200px;padding:16px 16px 40px}
        .wishlist-title{font-size:22px;font-weight:600;margin:8px 0 12px;text-align:left;}
        .wishlist-divider{height:1px;background:#e5e5e5;margin-bottom:22px}
        .wishlist-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        @media(max-width:1024px){.wishlist-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:640px){.wishlist-grid{grid-template-columns:1fr}}
        .card{border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#fff;
              box-shadow:0 1px 2px rgba(0,0,0,.04);transition:box-shadow .2s}
        .card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .card-img{width:100%;height:180px;object-fit:cover;display:block;background:#f7f7f7;cursor:pointer}
        .card-body{padding:12px 12px 0}
        .card-name{font-size:15px;font-weight:600;color:#222;margin:0 0 10px;
                   white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .card-footer{display:flex;align-items:center;justify-content:space-between;
                     background:#eaeaea;padding:10px;border-top:1px solid #ddd}
        .price{font-size:15px;font-weight:700;color:#333}
        .empty{grid-column:1/-1;border:1px solid #eee;border-radius:12px;padding:40px 16px;text-align:center}
        .empty-title{font-size:16px;font-weight:600}
        .empty-desc{color:#666;font-size:13px;margin-top:6px}
        .pager{display:flex;gap:8px;align-items:center;justify-content:center;margin-top:18px}
        .btn{border:1px solid #ddd;background:#fff;border-radius:8px;padding:8px 10px;cursor:pointer}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .err{margin:10px 0;color:#c22;font-size:14px;white-space:pre-line}
        .dbg{margin-top:16px;padding:12px;border:1px dashed #ddd;border-radius:8px;background:#fafafa;font-size:12px;max-height:260px;overflow:auto}
      `}</style>

      <div className="wishlist-container">
        <h1 className="wishlist-title">찜 목록</h1>
        <div className="wishlist-divider" />

        {err && <div className="err">{err}</div>}
        {loading && <div>불러오는 중…</div>}

        <div className="wishlist-grid">
          {!loading && items.length === 0 ? (
            <div className="empty">
              <div className="empty-title">아직 찜한 상품이 없어요</div>
              <div className="empty-desc">마음에 드는 상품에서 “찜”을 눌러 보관해 보세요.</div>
            </div>
          ) : (
            items.map((p) => (
              <div className="card" key={`${p.id}-${p.createdAt || ""}`}>
                <img
                  className="card-img"
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  onClick={() => goDetail(p.id)}
                />
                <div className="card-body">
                  <div className="card-name">{p.name}</div>
                </div>
                <div className="card-footer">
                  <StarRating value={p.rating} size={16} />
                  <div className="price">{formatKRW(p.price)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pager">
          <button className="btn" onClick={onPrev} disabled={!canPrev || loading}>이전</button>
          <span>{pg.currentPage} / {pg.totalPages}</span>
          <button className="btn" onClick={onNext} disabled={!canNext || loading}>다음</button>
        </div>
      </div>
    </div>
  );
}

function formatKRW(value) {
  if (value === undefined || value === null || isNaN(Number(value))) return "-";
  try { return Number(value).toLocaleString("ko-KR") + "원"; }
  catch { return `${value}원`; }
}
