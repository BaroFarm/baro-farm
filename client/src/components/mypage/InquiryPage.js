import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CATEGORIES = [
  "회원/계정 문의",
  "주문/결제 문의",
  "배송 문의",
  "반품/교환/환불",
  "쿠폰/포인트 문의",
  "상품 문의",
  "이벤트/프로모션 문의",
  "기타 문의",
];

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function CustomSelect({ value, onChange, placeholder = "카테고리 선택" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} style={SS.wrap}>
      <button type="button" onClick={() => setOpen(!open)} style={SS.trigger}>
        <span>{value || placeholder}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div style={SS.menu}>
          {CATEGORIES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                ...SS.item,
                ...(value === opt ? SS.itemActive : null),
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InquiryPage() {
  const q = useQuery();
  const queryPid = q.get("product_id") || q.get("productId") || ""; // 상품 상세에서 진입 시 사용
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(queryPid);
  const cameFromProduct = !!queryPid;   

  const endpoint = `${API_BASE}/api/my/store-communication/inquiries`;

  useEffect(() => {
    if (queryPid) setCategory("상품 문의");
  }, [queryPid]);

  async function handleSubmit() {
    // ✅ 기본 검증
    if (!category || !CATEGORIES.includes(category)) {
      alert("카테고리를 선택하세요.");
      return;
    }
    const t = title.trim();
    const c = content.trim();
    if (!t) return alert("제목을 입력하세요.");
    if (!c) return alert("내용을 입력하세요.");
    if (t.length > 200) return alert("제목은 200자 이내로 입력하세요.");
    if (c.length > 1000) return alert("내용은 1000자 이내로 입력하세요.");

    const payload = {
      category,
      title: t,
      content: c,
      is_visible: isPublic ? "공개" : "비공개",
    };

    // ✅ '상품 문의'일 때만 product_id 포함 (있으면 숫자로)
    if (cameFromProduct) {
      const pidNum = Number(productId || queryPid);
      if (Number.isFinite(pidNum) && pidNum > 0) {
        payload.product_id = pidNum;
      }
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `요청 실패 (${res.status})`);
      }

      alert("문의가 등록되었습니다.");
      // 초기화
      setTitle("");
      setCategory("");
      setContent("");
      setIsPublic(true);
      // productId는 상품 상세 진입이면 유지
      if (!queryPid) setProductId("");
      // 필요하면 게시판/상세로 이동
      // window.location.href = "/inquiry/board";
    } catch (e) {
      console.error(e);
      alert(`오류: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <h2 style={S.channelTitle}>직매장 소통 채널</h2>
      <hr style={S.divider} />

      <div style={S.topRow}>
        <h3 style={S.formHeading}>문의 하기</h3>
        <button style={S.boardBtn} onClick={() => (window.location.href = "/inquiry/board")}>
          문의게시판 이동
        </button>
      </div>

      <div style={S.card}>
        {/* 제목 */}
        <label htmlFor="title" style={S.label}>제목</label>
        <input
          id="title"
          type="text"
          placeholder="제목을 작성하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={S.input}
          maxLength={200}
        />

        {/* 카테고리 */}
        <label style={S.label}>카테고리 선택</label>
        <CustomSelect value={category} onChange={setCategory} />
        {cameFromProduct && (
          <>
            <label htmlFor="productId" style={S.label}>
              상품 ID 
            </label>
            <input
              id="productId"
              type="number"
              value={productId}
              readOnly
              style={{ ...S.input, background: "#f7f7f7", cursor: "not-allowed" }}
            />
          </>
        )}

        {/* 내용 */}
        <label htmlFor="content" style={S.label}>내용 작성</label>
        <textarea id="content" rows={8} placeholder="내용을 입력하세요 (최대 1000자)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={S.textarea}
          maxLength={1000} />

        {/* 공개 여부 */}
<div style={S.checkboxRow} role="group" aria-label="공개 여부">
  <label style={S.checkLabel}>
    <input
      type="checkbox"
      checked={isPublic === true}
      onChange={() => setIsPublic(true)}   // 공개 강제 선택
    />
    <span style={S.checkboxText}>공개</span>
  </label>

  <label style={S.checkLabel}>
    <input
      type="checkbox"
      checked={isPublic === false}
      onChange={() => setIsPublic(false)}  // 비공개 강제 선택
    />
    <span style={S.checkboxText}>비공개</span>
  </label>
</div>
      </div>

      <button style={S.submitBtn} onClick={handleSubmit}>문의 등록</button>
    </div>
  );
}

/* ===== 유틸 ===== */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


/* ====== page styles ====== */
const S = {
  page: { maxWidth: 960, margin: "40px auto 120px", fontFamily: "Pretendard, Noto Sans KR, sans-serif" },
  channelTitle: { fontSize: 24, fontWeight: 700, margin: 0, textAlign: "left" },
  divider: { margin: "16px 0 28px", border: 0, height: 2, background: "#111" },

  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  formHeading: { margin: 0, fontSize: 20, fontWeight: 700 },
  boardBtn: { padding: "10px 16px", background: "#B9D6A3", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" },

  card: { border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, background: "#fff" },

  label: { display: "block", marginTop: 10, marginBottom: 6, fontWeight: 600, fontSize: 14, color: "#222", textAlign: "left" },

  /* ✅ 제목 인풋 폭 = 텍스트영역 폭 (boxSizing으로 정확히 맞춤) */
  input: {
    width: "100%",
    height: 44,
    padding: "0 12px",
    border: "1px solid #D9D9D9",
    borderRadius: 6,
    outline: "none",
    marginBottom: 6,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: 12,
    border: "1px solid #D9D9D9",
    borderRadius: 6,
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
  },

  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 10 },
  checkboxText: { fontSize: 13, color: "#555" },

  submitBtn: {
    width: "100%",
    height: 44,
    marginTop: 18,
    background: "#2F2F2F",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
  },
};

/* ====== custom select styles ====== */
const SS = {
  wrap: { position: "relative", width: "100%" },
  trigger: {
    width: "100%",
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    border: "1px solid #D9D9D9",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 20,
    maxHeight: 280,
    overflowY: "auto",
  },
  item: {
    width: "100%",
    textAlign: "left",
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
  },
  itemActive: {
    background: "#EEF5EA", // ✅ 선택/호버 시 연한 연두 느낌
  },
};
