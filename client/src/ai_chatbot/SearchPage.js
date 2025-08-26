// src/pages/SearchPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../components/common/product/ProductList";
import Pagination from "../components/common/pagination/Pagination";
import "./SearchPage.css";
import { FaTimes } from "react-icons/fa";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

// URLSearchParams 헬퍼
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// 디바운스
function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ---------------- 클라이언트 폴백 유틸 ---------------- */
const _txt = (v) => (v ?? "").toString().toLowerCase();
function pickPrice(p) {
  return p.final_price ?? p.sale_price ?? p.price ?? p.unitPrice ?? p.unit_price ?? null;
}
// ❗카테고리 ID 추출 (이름만 있을 때는 name→id 매핑 사용)
function pickCategoryId(p, nameToId) {
  // 우선순위: 명시적 id들
  const raw =
    p.category_id ??
    p.categoryId ??
    p.category?.id ??
    p.category?.category_id ??
    null;
  if (raw != null && raw !== "") return Number(raw);

  // 숫자 문자열로 올 수도 있음
  if (typeof p.category === "number" || /^\d+$/.test(String(p.category || ""))) {
    return Number(p.category);
  }

  // 이름 기반: category_name / categoryName / category(문자열) / category.name
  const name =
    p.category_name ??
    p.categoryName ??
    (typeof p.category === "string" ? p.category : p.category?.name);
  if (name && nameToId) {
    const key = _txt(name.trim());
    if (nameToId.has(key)) return Number(nameToId.get(key));
  }
  return null;
}

function clientFilter(list, { kw, categoryId, min, max, nameToId }) {
  const hasKw = !!kw;
  const hasCat = !!categoryId;
  const hasMin = min !== "" && !Number.isNaN(min);
  const hasMax = max !== "" && !Number.isNaN(max);

  if (!hasKw && !hasCat && !hasMin && !hasMax) return list;

  return list.filter((p) => {
    if (hasKw) {
      const hay = `${_txt(p.name)} ${_txt(p.title)} ${_txt(p.product_name)} ${_txt(p.description)}`;
      if (!hay.includes(kw)) return false;
    }
    if (hasCat) {
      const cid = pickCategoryId(p, nameToId);
      if (cid == null || Number(cid) !== Number(categoryId)) return false;
    }
    if (hasMin || hasMax) {
      const price = pickPrice(p);
      if (price == null) return false;
      if (hasMin && Number(price) < Number(min)) return false;
      if (hasMax && Number(price) > Number(max)) return false;
    }
    return true;
  });
}

function clientSort(list, sort) {
  const arr = [...list];
  switch (sort) {
    case "latest":
      arr.sort(
        (a, b) =>
          new Date(b.created_at ?? b.createdAt ?? b.updated_at ?? 0) -
          new Date(a.created_at ?? a.createdAt ?? a.updated_at ?? 0)
      );
      break;
    case "price_asc":
      arr.sort((a, b) => (pickPrice(a) ?? Infinity) - (pickPrice(b) ?? Infinity));
      break;
    case "price_desc":
      arr.sort((a, b) => (pickPrice(b) ?? -Infinity) - (pickPrice(a) ?? -Infinity));
      break;
    case "rating_desc":
      arr.sort((a, b) => (b.rating ?? b.avg_rating ?? 0) - (a.rating ?? a.avg_rating ?? 0));
      break;
    default: // relevance
      break;
  }
  return arr;
}

export default function SearchPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const listTopRef = useRef(null);

  // URL → 상태
  const [keyword, setKeyword] = useState(q.get("keyword") || "");
  const [sort, setSort] = useState(q.get("sort") || "relevance");
  const [categoryId, setCategoryId] = useState(q.get("category") ? Number(q.get("category")) : 0);
  const [min, setMin] = useState(q.get("min") ? Number(q.get("min")) : "");
  const [max, setMax] = useState(q.get("max") ? Number(q.get("max")) : "");
  const [page, setPage] = useState(Number(q.get("page") || 1));
  const [limit] = useState(40);

  const debouncedKeyword = useDebounced(keyword, 300);

  // 검색 조건 존재 여부
  const hasQuery =
    (debouncedKeyword && debouncedKeyword.trim().length > 0) ||
    Number(categoryId) > 0 ||
    (min !== "" && !Number.isNaN(min)) ||
    (max !== "" && !Number.isNaN(max));

  // 결과 상태
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 카테고리
  const [categories, setCategories] = useState([]); // [{id, name}]
  const [catLoading, setCatLoading] = useState(true);
  const [catErr, setCatErr] = useState("");

  // 이름→ID 매핑 (소문자 키)
  const categoryNameToId = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
      if (c?.name != null && c?.id != null) m.set(_txt(String(c.name).trim()), Number(c.id));
    }
    return m;
  }, [categories]);

  /* ---------------- 카테고리 로드 ---------------- */
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setCatLoading(true);
      setCatErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/api/categories`, {
          signal: ctrl.signal,
          headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const normalized = arr
          .map((c) => ({ id: c.id ?? c.category_id, name: c.name ?? c.category_name }))
          .filter((c) => c.id != null && c.name);
        setCategories(normalized);
      } catch (e) {
        if (e.name !== "AbortError") setCatErr("카테고리를 불러오지 못했습니다.");
      } finally {
        setCatLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  /* ---------------- URL 동기화 ---------------- */
  useEffect(() => {
    const sp = new URLSearchParams();
    if (hasQuery) {
      if (debouncedKeyword) sp.set("keyword", debouncedKeyword);
      if (sort && sort !== "relevance") sp.set("sort", sort);
      if (categoryId) sp.set("category", String(categoryId));
      if (min !== "" && !Number.isNaN(min)) sp.set("min", String(min));
      if (max !== "" && !Number.isNaN(max)) sp.set("max", String(max));
      sp.set("page", String(page));
      navigate(`/search?${sp.toString()}`, { replace: true });
    } else {
      navigate(`/search`, { replace: true });
    }
  }, [hasQuery, debouncedKeyword, sort, categoryId, min, max, page, navigate]);

  /* ---------------- 검색 호출 (+ 폴백) ---------------- */
  useEffect(() => {
    const ctrl = new AbortController();

    if (!hasQuery) {
      setItems([]); setTotal(0); setTotalPages(1); setErr(""); setLoading(false);
      return () => ctrl.abort();
    }

    function extractListAndTotal(json) {
      if (Array.isArray(json)) return { list: json, total: json.length };
      if (Array.isArray(json?.items)) return { list: json.items, total: json.total ?? json.items.length };
      if (Array.isArray(json?.data)) return { list: json.data, total: json.total ?? json.data.length };
      if (Array.isArray(json?.data?.items)) return { list: json.data.items, total: json.data.total ?? json.data.items.length };
      if (Array.isArray(json?.rows)) return { list: json.rows, total: json.total ?? json.rows.length };
      if (Array.isArray(json?.products)) return { list: json.products, total: json.total ?? json.products.length };
      return { list: [], total: 0 };
    }

    async function call(url) {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const errJson = await res.json(); msg = errJson?.message || errJson?.error || msg; } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      if (process.env.NODE_ENV !== "production") console.debug("[/api/products] response:", json);
      return extractListAndTotal(json);
    }

    (async () => {
      setLoading(true); setErr("");
      try {
        const p1 = new URLSearchParams();
        if (debouncedKeyword) p1.set("query", debouncedKeyword);
        if (sort && sort !== "relevance") {
          const sortMap = { latest: "latest", price_asc: "price_asc", price_desc: "price_desc", rating_desc: "rating_desc" };
          p1.set("sort", sortMap[sort] ?? sort);
        }
        if (categoryId) p1.set("category_id", String(categoryId));
        if (min !== "" && !Number.isNaN(min)) p1.set("min", String(min));
        if (max !== "" && !Number.isNaN(max)) p1.set("max", String(max));
        p1.set("page", String(page));
        p1.set("limit", String(limit));

        let { list } = await call(`${API_BASE}/api/products?${p1.toString()}`);

        // 키워드 파라미터 폴백
        if (list.length === 0 && debouncedKeyword) {
          const p2 = new URLSearchParams(p1);
          p2.delete("query"); p2.set("keyword", debouncedKeyword);
          ({ list } = await call(`${API_BASE}/api/products?${p2.toString()}`));
        }

        // 카테고리 파라미터 폴백 (snake→plain / camel)
        if (list.length === 0 && categoryId) {
          const pCat1 = new URLSearchParams(p1);
          pCat1.delete("category_id"); pCat1.set("category", String(categoryId));
          ({ list } = await call(`${API_BASE}/api/products?${pCat1.toString()}`));

          if (list.length === 0) {
            const pCat2 = new URLSearchParams(p1);
            pCat2.delete("category_id"); pCat2.set("categoryId", String(categoryId));
            ({ list } = await call(`${API_BASE}/api/products?${pCat2.toString()}`));
          }
        }

        // page=0 폴백
        if (list.length === 0 && Number(page) === 1) {
          const p3 = new URLSearchParams(p1);
          p3.set("page", "0");
          ({ list } = await call(`${API_BASE}/api/products?${p3.toString()}`));
        }

        // 카테고리만 선택했는데 서버가 비워줄 때 → 전체 받아서 클라 필터
        if (list.length === 0 && categoryId && !debouncedKeyword) {
          const base1 = new URLSearchParams(); base1.set("page", "1"); base1.set("limit", String(Math.max(200, limit)));
          ({ list } = await call(`${API_BASE}/api/products?${base1.toString()}`));
          if (list.length === 0) {
            const base2 = new URLSearchParams(); base2.set("page", "1"); base2.set("per_page", String(Math.max(200, limit)));
            ({ list } = await call(`${API_BASE}/api/products?${base2.toString()}`));
          }
          if (list.length === 0) {
            const base3 = new URLSearchParams(); base3.set("page", "1"); base3.set("size", String(Math.max(200, limit)));
            ({ list } = await call(`${API_BASE}/api/products?${base3.toString()}`));
          }
        }

        // 최종 클라 필터/정렬/페이지
        const kw = (debouncedKeyword || "").trim().toLowerCase();
        let effective = clientFilter(list, { kw, categoryId, min, max, nameToId: categoryNameToId });
        effective = clientSort(effective, sort);

        const totalFiltered = effective.length;
        const start = Math.max(0, (Number(page) - 1) * Number(limit));
        const end = start + Number(limit);
        setItems(effective.slice(start, end));
        setTotal(totalFiltered);
        setTotalPages(Math.max(1, Math.ceil(totalFiltered / limit)));
        listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        if (e.name !== "AbortError") {
          setErr(`검색 중 오류가 발생했습니다. ${e.message ? `(${e.message})` : ""}`);
          setItems([]); setTotal(0); setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [hasQuery, debouncedKeyword, sort, categoryId, min, max, page, limit, categoryNameToId]);

  return (
    <div className="sp-wrap">
      {/* 상단 검색바 */}
      <div className="sp-topbar">
        <div className="sp-searchBar">
          <input
            className="sp-searchInput"
            placeholder="검색어를 입력하세요."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
          <button
            className="sp-searchClearBtn"
            aria-label="검색어 지우기"
            onClick={() => { setKeyword(""); setPage(1); }}
            disabled={!keyword}
          >
            <FaTimes color="#666" />
          </button>
        </div>

        {/* 정렬 */}
        <select
          className="sp-pillSelect sp-sortSelect"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
        >
          <option value="relevance">정확도순</option>
          <option value="latest">최신순</option>
          <option value="price_asc">가격↑</option>
          <option value="price_desc">가격↓</option>
          <option value="rating_desc">평점순</option>
        </select>
      </div>

      {/* 필터 */}
      <div className="sp-filters">
        {/* 카테고리: pill 스타일 */}
        <select
          className="sp-pillSelect sp-categorySelect"
          value={categoryId || 0}
          onChange={(e) => { setCategoryId(Number(e.target.value)); setPage(1); }}
          disabled={catLoading || !!catErr}
          title={catErr || (catLoading ? "카테고리를 불러오는 중..." : undefined)}
        >
          <option value={0}>전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="sp-price">
          <input
            type="number"
            placeholder="최소가격"
            value={min}
            onChange={(e) => { setMin(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
          />
          <span>~</span>
          <input
            type="number"
            placeholder="최대가격"
            value={max}
            onChange={(e) => { setMax(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
          />
        </div>
      </div>

      {/* 상태 라벨 */}
      <div className="sp-status">
        {!hasQuery
          ? "원하는 상품을 검색하거나 필터를 선택해 보세요."
          : loading
          ? "검색 중..."
          : err
          ? err
          : `${total.toLocaleString()}개 결과`}
      </div>

      {/* 결과 리스트 & 페이지네이션 */}
      <div ref={listTopRef} />
      {hasQuery && <ProductList products={items} page={page} type="search" />}
      {hasQuery && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
