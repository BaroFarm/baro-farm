import React, { useState } from "react";

export default function ChatbotModal({ open, onClose, onSend }) {
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const handleSend = () => {
    const text = msg.trim();
    if (!text) return;
    onSend?.(text);
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
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={styles.iconBox}>💬</span>
            <span style={{ fontWeight: 700 }}>AI 챗봇</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div style={styles.body}>
          <div style={styles.greeting}>
            <div>바로팜에 오신 것을 환영합니다!</div>
            <div style={{ marginTop: 4, color: "#4b5563" }}>
              무엇을 도와드릴까요?
            </div>
          </div>

          <div style={styles.quickRow}>
            <button style={styles.quickBtn}>서비스 사용 안내</button>
            <button style={styles.quickBtn}>판매 데이터 확인</button>
            <button style={styles.quickBtn}>납품 업체 / 판매자 전화 연결</button>
          </div>
        </div>

        {/* 하단 입력 바 (아이콘이 한 박스 안에) */}
        <div style={styles.inputBar}>
          <div style={styles.inputWrapper}>
            <button
              type="button"
              style={styles.leftIcon}
              aria-label="보내기"
              onClick={handleSend}
              title="보내기"
            >
              📨
            </button>

            <input
              style={styles.input}
              placeholder="메시지를 입력해주세요!"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              style={styles.rightIcon}
              aria-label="음성 입력"
              title="음성 입력"
              onClick={() => alert("음성 입력은 추후 제공됩니다.")}
            >
              🎤
            </button>
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
    height: 520,
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
  closeBtn: {
    border: "1px solid #cdd7c6",
    background: "#fff",
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer",
  },

  body: { padding: 16, display: "grid", alignItems: "start", gap: 16 },
  greeting: { textAlign: "center", fontWeight: 700, marginTop: 8 },
  quickRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  quickBtn: {
    background: "#9CC285",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },

  /* ── 하단 입력 영역 (첫 번째 스샷 느낌) ── */
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
    background: "#eef4ea", // 연한 그린 톤
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
