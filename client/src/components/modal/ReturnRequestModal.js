// src/components/modal/ReturnRequestModal.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export default function ReturnRequestModal({
  open,
  onClose,
  orderId,          // 주문 식별자
  orderProductId,   // (선택) 특정 주문상품 식별자
  defaultType = "RETURN", // RETURN | EXCHANGE
  onSubmitted,      // 성공 후 상위 알림 콜백
  getToken = () => localStorage.getItem("accessToken") || "",
}) {
  const [type, setType] = useState(defaultType);     // RETURN | EXCHANGE
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (!sheetRef.current) return;
    if (!sheetRef.current.contains(e.target)) onClose?.();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!orderId) return alert("orderId가 없습니다.");
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!reason.trim()) return alert("사유를 입력해주세요.");

    try {
      setLoading(true);

      // (옵션) 파일 업로드가 별도 엔드포인트라면 여기서 먼저 업로드 후 URL 수집
      // 지금은 서버에 멀티파트로 바로 전송하는 예시
      const fd = new FormData();
      //fd.append("type", type); // RETURN | EXCHANGE
      fd.append("title", title);
      fd.append("reason", reason);
      if (orderProductId) fd.append("order_product_id", orderProductId);
      for (const f of files) fd.append("images", f);

      const { data } = await axios.post(
        `${API_BASE}/api/orders/${orderId}/refunds`, // 서버 경로 맞게 변경 예: /returns or /exchange-requests
        fd,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("신청이 접수되었습니다.");
      onSubmitted?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        err.message ||
        "신청 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.backdrop} onMouseDown={handleBackdrop} role="dialog" aria-modal="true">
      <form ref={sheetRef} style={S.sheet} onSubmit={handleSubmit} onMouseDown={(e)=>e.stopPropagation()}>
        <div style={S.header}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>교환/반품 신청</div>
          <button type="button" aria-label="닫기" onClick={onClose} style={S.xbtn}>✕</button>
        </div>

        {/* 타입 선택 */}
        {/* <div style={S.group}>
          <label style={S.label}>신청 유형</label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={S.radioLabel}>
              <input
                type="radio"
                name="type"
                value="RETURN"
                checked={type === "RETURN"}
                onChange={() => setType("RETURN")}
              />
              <span>반품</span>
            </label>
            <label style={S.radioLabel}>
              <input
                type="radio"
                name="type"
                value="EXCHANGE"
                checked={type === "EXCHANGE"}
                onChange={() => setType("EXCHANGE")}
              />
              <span>교환</span>
            </label>
          </div>
        </div> */}

        {/* 제목 */}
        <div style={S.group}>
          <label style={S.label}>제목</label>
          <input
            style={S.input}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 이미지 첨부 */}
        <div style={S.group}>
          <label style={S.label}>이미지 첨부</label>
          <input
            style={S.input}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          {files?.length > 0 && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              {files.length}개 선택됨
            </div>
          )}
        </div>

        {/* 사유 */}
        <div style={S.group}>
          <label style={S.label}>사유</label>
          <textarea
            style={{ ...S.input, height: 120, resize: "vertical" }}
            placeholder="신청 사유를 입력하세요"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} style={S.submit}>
          {loading ? "처리 중..." : "신청하기"}
        </button>
      </form>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 10000,
  },
  sheet: {
    width: 420, maxWidth: "100%", background: "#fff", borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)", padding: 20,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  xbtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18 },

  group: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label: { fontSize: 14, fontWeight: 700, color: "#222", textAlign: "left" },
  radioLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#333" },
  input: {
    border: "1px solid #ddd", borderRadius: 10, padding: "12px 14px",
    fontSize: 14, outline: "none",
  },

  submit: {
    width: "100%", marginTop: 6,
    padding: "12px 0", borderRadius: 12, border: "1px solid #1f1f1f",
    background: "#1f1f1f", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
  },
};
