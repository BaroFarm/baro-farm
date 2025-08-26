// src/pages/SeasonalPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../components/common/product/ProductList";
import Pagination from "../components/common/pagination/Pagination";
import "./SearchPage.css"; // pill 스타일 그대로 사용
import "./SeasonalPage.css";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// 여러 응답 스키마 흡수
function extractListAndTotal(json) {
  if (Array.isArray(json)) return { list: json, total: json.length };
  if (Array.isArray(json?.items)) return { list: json.items, total: json.total ?? json.items.length };
  if (Array.isArray(json?.data)) return { list: json.data, total: json.total ?? json.data.length };
  if (Array.isArray(json?.data?.items)) return { list: json.data.items, total: json.data.total ?? json.data.items.length };
  if (Array.isArray(json?.rows)) return { list: json.rows, total: json.total ?? json.rows.length };
  if (Array.isArray(json?.products)) return { list: json.products, total: json.total ?? json.products.length };
  return { list: [], total: 0 };
}

/* ---------------- 중복 제거: '보이는 카드' 기준 ---------------- */
// 타이틀 정규화
function pickTitle(p) {
  return (p.title ?? p.name ?? p.product_name ?? "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
// 숫자 가격만 추출
function pickNumericPrice(p) {
  const raw = p.final_price ?? p.sale_price ?? p.price ?? p.unitPrice ?? p.unit_price ?? 0;
  const n = typeof raw === "string" ? Number(raw.replace(/[^\d.]/g, "")) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}
// 이미지 URL에서 쿼리/프래그먼트 제거(선택)
function normalizeImageUrl(img) {
  if (!img) return "";
  try {
    const u = new URL(img, window.location.origin);
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return String(img);
  }
}

/**
 * 같은 '보이는 카드'를 하나로: 기본은 (이름 + 가격).
 * 이미지까지 같을 때만 묶으려면 includeImage=true
 */
function dedupeByVisualCard(list, { includeImage = false } = {}) {
  const seen = new Set();
  const out = [];
  for (const p of list) {
    const t = pickTitle(p);
    const price = pickNumericPrice(p);
    let key = `${t}|${price}`;
    if (includeImage) {
      const img = normalizeImageUrl(p.image ?? p.thumbnail ?? p.thumb_url ?? "");
      key += `|${img}`;
    }
    if (t === "" && price === 0) {
      // 정보가 너무 빈약하면 그냥 통과(원하면 continue로 버려도 됨)
      out.push(p);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export default function SeasonalPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const listTopRef = useRef(null);

  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(() => {
    const m = Number(q.get("month") || currentMonth);
    return m >= 1 && m <= 12 ? m : currentMonth;
  });
  const [sort, setSort] = useState(q.get("sort") || "latest");
  const [page, setPage] = useState(Number(q.get("page") || 1));
  const [limit] = useState(40);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  // 결과 상태
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // URL 동기화
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("month", String(month));
    if (sort && sort !== "relevance") sp.set("sort", sort);
    sp.set("page", String(page));
    navigate(`/seasonal?${sp.toString()}`, { replace: true });
  }, [month, sort, page, navigate]);

  useEffect(() => {
    const ctrl = new AbortController();

    async function call(url) {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          msg = errJson?.message || errJson?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[/api/products/seasonal] response:", json);
      }
      return extractListAndTotal(json);
    }

    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1차: 공식 시즌 API
        const p1 = new URLSearchParams();
        p1.set("month", String(month));
        p1.set("page", String(page));
        p1.set("limit", String(limit));
        if (sort && sort !== "relevance") p1.set("sort", sort);

        let { list, total: serverTotal } = await call(`${API_BASE}/api/products/seasonal?${p1.toString()}`);

        // 2차 폴백: 시즌 API가 없거나 빈값 → 일반 products로 대체
        if (list.length === 0) {
          const p2 = new URLSearchParams();
          p2.set("page", String(page));
          p2.set("limit", String(limit));
          p2.set("month", String(month)); // BE가 month 지원할 수도 있음
          if (sort && sort !== "relevance") p2.set("sort", sort);
          ({ list, total: serverTotal } = await call(`${API_BASE}/api/products?${p2.toString()}`));

          // 그래도 없으면 넉넉히 받아서 클라에서 처리
          if (list.length === 0) {
            const p3 = new URLSearchParams();
            p3.set("page", "1");
            p3.set("limit", String(Math.max(200, limit)));
            if (sort && sort !== "relevance") p3.set("sort", sort);
            ({ list, total: serverTotal } = await call(`${API_BASE}/api/products?${p3.toString()}`));
          }
        }

        // ✅ 중복 제거: '보이는 카드'(이름+가격) 기준
        list = dedupeByVisualCard(list, { includeImage: false });

        // 정렬(클라 보정)
        const sorted = (() => {
          const arr = [...list];
          switch (sort) {
            case "latest":
              return arr.sort(
                (a, b) =>
                  new Date(b.created_at ?? b.createdAt ?? b.updated_at ?? 0) -
                  new Date(a.created_at ?? a.createdAt ?? a.updated_at ?? 0)
              );
            case "price_asc":
              return arr.sort(
                (a, b) =>
                  (a.final_price ?? a.sale_price ?? a.price ?? Infinity) -
                  (b.final_price ?? b.sale_price ?? b.price ?? Infinity)
              );
            case "price_desc":
              return arr.sort(
                (a, b) =>
                  (b.final_price ?? b.sale_price ?? b.price ?? -Infinity) -
                  (a.final_price ?? a.sale_price ?? a.price ?? -Infinity)
              );
            case "rating_desc":
              return arr.sort((a, b) => (b.rating ?? b.avg_rating ?? 0) - (a.rating ?? a.avg_rating ?? 0));
            default:
              return arr;
          }
        })();

        // 페이지 (서버가 total 안 줄 수도 있어 클라에서 안전 처리)
        const start = Math.max(0, (Number(page) - 1) * Number(limit));
        const end = start + Number(limit);
        // 서버가 total을 주더라도, 중복 제거 후 개수가 달라졌을 수 있으니 클라 기준으로 계산
        const pageSlice = sorted.slice(start, end);
        const finalTotal = sorted.length;

        setItems(pageSlice);
        setTotal(finalTotal);
        setTotalPages(Math.max(1, Math.ceil(finalTotal / limit)));

        listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        if (e.name !== "AbortError") {
          setErr(`목록을 불러오지 못했습니다. ${e.message ? `(${e.message})` : ""}`);
          setItems([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [month, sort, page, limit, navigate]);

  return (
    <div className="sp-wrap">
      {/* 상단 바 */}
      <div className="sp-topbar">
        {/* 월 선택: pill 버튼 12개 */}
        <div className="sp-monthRow">
          {months.map((m) => (
            <button
              key={m}
              className={`sp-monthPill ${m === month ? "is-active" : ""}`}
              onClick={() => { setMonth(m); setPage(1); }}
              title={`${m}월 제철`}
            >
              {m}월
            </button>
          ))}
        </div>

        {/* 정렬 */}
        <select
          className="sp-pillSelect sp-sortSelect"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
        >
          <option value="latest">최신순</option>
          <option value="price_asc">가격 낮은 순</option>
          <option value="price_desc">가격 높은 순</option>
          <option value="rating_desc">평점순</option>
        </select>
      </div>

      {/* 상태 라벨 */}
      <div className="sp-status">
        {loading ? "불러오는 중..." : err ? err : `${month}월 제철 · ${total.toLocaleString()}개`}
      </div>

      {/* 목록 & 페이지네이션 */}
      <div ref={listTopRef} />
      <ProductList products={items} page={page} type="seasonal" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
