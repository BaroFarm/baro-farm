import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const PLACEHOLDER_IMG = '/images/mock/no-img-240.png';

function MyStorePage() {
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("내 스토아");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [err, setErr] = useState("");

  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setErr("");

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { setErr("로그인이 필요합니다."); setLoading(false); return; }

      // 1) 프로필 조회 (store_id 있을 수도/없을 수도)
      const pRes = await fetch(`${API_BASE}/api/my/profile`, {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const pJson = await safeJson(pRes);
      if (!pRes.ok) throw new Error(pJson?.message || "프로필 조회 실패");
      console.log("[/api/my/profile] raw:", pJson);

      // store_id 추출 시도 (스키마별 대응)
      const storeId = Number(
        pJson?.data?.store_id ??
        pJson?.data?.store?.store_id ??
        pJson?.data?.direct_store_id
      );

      // 2-A) store_id가 있으면: /api/store/:store_id (상품 포함)
      if (Number.isFinite(storeId)) {
        const res = await fetch(`${API_BASE}/api/store/${storeId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

        const json = await safeJson(res);
        if (!res.ok) throw new Error(json?.message || json?.error?.message || `요청 실패 (${res.status})`);

        const data = json?.data || {};
        console.log("[/api/store/:id] raw:", json);

        setStoreName(data?.store?.name || data?.name || "내 스토어");

        const src = Array.isArray(data?.products) ? data.products : [];
        const mapped = src.map(toUiProduct);
        console.log("[/api/store/:id] mapped:", mapped);
        setProducts(mapped);
        return;
      }

      // 2-B) store_id가 없으면: /api/store(이름/주소용) + /api/products(상품목록)
      // (백엔드가 이렇게 분리되어 있어도 프론트에서 대응 가능)
      const sRes = await fetch(`${API_BASE}/api/store`, {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const sJson = await safeJson(sRes);
      if (sRes.ok) {
        const sd = sJson?.data || {};
        setStoreName(sd?.name || sd?.store?.name || "내 스토어");
      } else {
        // store 호출 실패해도 상품만이라도 보여줄 수 있도록 진행
        console.warn("/api/store 실패:", sJson);
      }

      const prodRes = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const prodJson = await safeJson(prodRes);

      // /api/products가 404(상품 없음)를 줄 수도 있으니, 실패도 빈 배열로 처리
      if (!prodRes.ok && prodRes.status !== 404) {
        throw new Error(prodJson?.message || `상품 조회 실패 (${prodRes.status})`);
      }

      const prodSrc =
        prodJson?.products ??
        prodJson?.data?.products ??
        (Array.isArray(prodJson?.data) ? prodJson.data : []) ??
        [];

      const mapped = Array.isArray(prodSrc) ? prodSrc.map(toUiProduct) : [];
      console.log("[/api/products] mapped:", mapped);
      setProducts(mapped);

    } catch (e) {
      console.error(e);
      setErr(e.message || "요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  function toUiProduct(p = {}) {
    const id = p.product_id ?? p.id;
    const title = String(p.name ?? p.title ?? "").trim();
    return {
      id,
      name: title,
      description: String(p.intro ?? "").trim(),
      price: formatKRW(p.price),
      imageUrl: toAbsUrl(p.image_url) || PLACEHOLDER_IMG,
    };
  }

  function toAbsUrl(u){
    const v = String(u || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (!API_BASE) return v.replace(/^\/+/, "");
    return `${API_BASE}/${v.replace(/^\/+/, "")}`;
  }

  function formatKRW(v) {
    const n = Number(v);
    if (!isFinite(n)) return String(v ?? "-");
    try {
      return n.toLocaleString("ko-KR") + "원";
    } catch {
      return `${n}원`;
    }
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  const handleProductClick = (id) => navigate(`/shop/product/${id}`);
  
  //삭제
  const handleDelete = async (id) => {
  if (!window.confirm("정말 삭제하시겠습니까?")) return;

  const token =
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) { setErr("로그인이 필요합니다."); return; }

  // UI: 삭제 중 표시
  setDeletingIds((s) => new Set(s).add(id));

  // 낙관적 제거 (실패 시 롤백)
  const prev = products;
  setProducts((p) => p.filter((x) => x.id !== id));

  try {
    const res = await fetch(`${API_BASE}/api/store/product-list/${id}`, {
      method: "DELETE",                // ← 명세서 준수
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    const json = await safeJson(res);

    if (!res.ok) {
      // 404 등 에러 메시지 노출 + 롤백
      const msg =
        json?.message || json?.error?.message || `삭제 실패 (${res.status})`;
      throw new Error(msg);
    }

    // (성공) 서버 메시지가 있으면 콘솔/토스트
    console.log("삭제 성공:", json);

  } catch (e) {
    console.error(e);
    setErr(e.message || "삭제 중 오류가 발생했습니다.");
    // 롤백
    setProducts(prev);
  } finally {
    setDeletingIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }
};

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>‘{storeName}’ </h2>
          <button type="button" style={styles.edit}>✎ 스토어 이름 편집</button>
        </div>

        {loading && <p>불러오는 중…</p>}
        {!loading && err && <p style={{ color: "crimson" }}>{err}</p>}
        {!loading && !err && products.length === 0 && <p>등록된 상품이 없습니다.</p>}

        {!loading && !err && products.length > 0 && (
          <div style={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} style={styles.cardWrapper}>
                <div
                  style={styles.productCard}
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={product.imageUrl || PLACEHOLDER_IMG}
                    alt={product.name}
                    style={styles.image}
                  />
                </div>

                <div style={styles.nameRow}>
                  <div
                    style={styles.name}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </div>
                  <div style={styles.delete} onClick={() => handleDelete(product.id)}>
                    ✕ <span>삭제하기</span>
                  </div>
                </div>

                <p style={styles.description}>{product.description}</p>
                <p style={styles.price}>{product.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '30px',
    textAlign: 'left',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',   // 제목은 그대로
    margin: 0,
  },
  edit: {
    border: 'none',
    background: 'transparent',
    color: '#A8CFA3',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '32px',
    rowGap: '56px',
    justifyItems: 'stretch',
  },
  cardWrapper: {
    width: '100%',
  },
  productCard: {
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  name: {
    fontSize: '25px',    // 🔥 상품명 크게,
    cursor: 'pointer',
  },
  delete: {
    fontSize: '14px',
    color: '#A8CFA3',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  description: {
    whiteSpace: 'pre-line',
    fontSize: '16px',    // 🔥 설명 크게
    margin: '12px 0',
    color: '#444',
    lineHeight: 1.5,
  },
  price: {
    fontWeight: 'bold',
    fontSize: '17px',    // 🔥 가격도 크게
  },
};



export default MyStorePage;
