import React, { useState } from "react";

export default function ChatbotModal({ open, onClose, onSend, role = "buyer" }) {
  const [msg, setMsg] = useState("");

  // role에 따라 분기 (hook 아님)
  const isSeller = role === "seller";
  const title = isSeller ? "바로팜 판매자 도우미" : "바로팜 구매자 도우미";
  const subtitle = "무엇을 도와드릴까요?";
  const quickItems = isSeller
    ? ["서비스 사용 안내", "판매 데이터 확인", "상품 등록 도움", "재고/배송 설정", "고객 문의 응대"]
    : ["상품 문의", "배송 문의", "환불 문의", "주문 및 결제", "배송 전 변경"];

  if (!open) return null;

  const handleSend = (text) => {
    const payload = (text ?? msg).trim();
    if (!payload) return;
    onSend?.(payload);
    setMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={styles.iconBox}>💬</span>
            <span style={{ fontWeight: 700 }}>AI 챗봇</span>
            <span style={styles.roleBadge}>{isSeller ? "판매자" : "구매자"}</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="닫기">✕</button>
        </div>

        <div style={styles.body}>
          <div style={styles.greeting}>
            <div>{title}</div>
            <div style={{ marginTop: 4, color: "#4b5563" }}>{subtitle}</div>
          </div>

          <div style={styles.quickCol}>
            {quickItems.map((label) => (
              <button key={label} style={styles.quickPill} onClick={() => handleSend(label)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.inputBar}>
          <div style={styles.inputWrapper}>
            <button type="button" style={styles.leftIcon} aria-label="보내기" onClick={() => handleSend()} title="보내기">📨</button>
            <input
              style={styles.input}
              placeholder="메시지를 입력해주세요!"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="button" style={styles.rightIcon} aria-label="음성 입력" title="음성 입력"
              onClick={() => alert("음성 입력은 추후 제공됩니다.")}>🎤</button>
          </div>
        </div>
      </div>
    </div>
  );
}


const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: 420,
    maxWidth: "92vw",
    height: 620,
    maxHeight: "92vh",
    background: "#e6efdc",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    overflow: "hidden",
    border: "1px solid #cdd7c6",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#dae7cf",
    borderBottom: "1px solid #cdd7c6",
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #cdd7c6",
    fontSize: 12,
  },
  roleBadge: {
    marginLeft: 6,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #cdd7c6",
    fontSize: 12,
    color: "#4b5563",
  },
  closeBtn: {
    border: "1px solid #cdd7c6",
    background: "#fff",
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer",
  },

  body: { padding: 16, display: "grid", alignItems: "start", gap: 16 },
  greeting: { textAlign: "center", fontWeight: 700, marginTop: 8 },

  // 세로로 꽉 찬 알약 버튼 (구매자 스샷 느낌)
  quickCol: {
    display: "grid",
    gap: 12,
    alignContent: "start",
    justifyItems: "center",
  },
  quickPill: {
    width: "70%",
    maxWidth: 340,
    minWidth: 220,
    background: "#b7ca9f",
    color: "#0f172a",
    border: "none",
    padding: "14px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "0.02em",
  },

  inputBar: {
    padding: 10,
    background: "#dae7cf",
    borderTop: "1px solid #cdd7c6",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    background: "#eef4ea",
    border: "1px solid #cdd7c6",
    borderRadius: 12,
    height: 44,
    padding: "0 8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
  },
  leftIcon: {
    border: "none",
    background: "transparent",
    padding: "0 6px",
    cursor: "pointer",
    fontSize: 18,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    height: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 14,
  },
  rightIcon: {
    border: "none",
    background: "transparent",
    padding: "0 6px",
    cursor: "pointer",
    fontSize: 18,
    opacity: 0.9,
  },
};
