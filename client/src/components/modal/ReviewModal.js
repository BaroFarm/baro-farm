import React, { useEffect, useState } from "react";

export default function ReviewModal({
    open,
    onClose,
    productImage,
    sellerName,
    productName,
    onSubmit,
}) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (!open) {
            setRating(0);
            setHover(0);
            setContent("");
            setFiles([]);
        }
    }, [open]);

  // esc 로 닫기
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose?.();
            if (open) window.addEventListener("keydown", onKey);
            return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const canSubmit = rating > 0 && content.trim().length >= 10;

    const MAX = 1000;
    const count = content.length;

    const handleFiles = (e) => {
        const f = Array.from(e.target.files || []);
        setFiles(f.slice(0, 10)); // 최대 10개 가정
    };

    const fallbackText = encodeURIComponent(productName || "상품");
    const fallbackImg = `https://placehold.co/80x80?text=${fallbackText}`;

    return (
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
        <div
            style={styles.sheet}
            onClick={(e) => e.stopPropagation()}
        >
        {/* 헤더 */}
        <div style={styles.header}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>리뷰 쓰기</div>
            <button
                aria-label="닫기"
                onClick={onClose}
                style={styles.iconBtn}
            >
            ✕
            </button>
        </div>

        {/* 상단 상품 정보 */}
        <div style={styles.topRow}>
            <img
                src={productImage || fallbackImg}
                onError={(e) => (e.currentTarget.src = fallbackImg)}
                alt={productName || "상품"}
                style={styles.thumb}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, color: "#666" }}>
                    {sellerName || "직매장(농가) 명"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {productName || "상품명"}
                </div>
                </div>
            </div>

            {/* 구분선 */}
            <div style={styles.hr} />

            {/* 별점 */}
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{ fontSize: 15, marginBottom: 10 }}>상품에 만족하셨나요?</div>
                <div style={{ display: "inline-flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((i) => {
                        const filled = (hover || rating) >= i;
                        return (
                            <button
                                key={i}
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(i)}
                                style={styles.starBtn}
                                aria-label={`${i}점`}
                            >
                            {/* SVG 별 아이콘 (filled/outline) */}
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill={filled ? "#3F7D20" : "none"}
                                    stroke={filled ? "#3F7D20" : "#bbb"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
                                </svg>
                            </button>
                        );
                    })}
                    </div>
                </div>

                {/* 구분선 */}
                <div style={{ ...styles.hr, marginTop: 12 }} />

                {/* 텍스트 입력 */}
                <div style={{ padding: "12px 0" }}>
                    <div style={{ fontSize: 15, marginBottom: 8 }}>어떤 점이 좋았나요?</div>
                        <div style={styles.textareaWrap}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value.slice(0, MAX))}
                                placeholder="최소 10자 이상 입력해주세요."
                                style={styles.textarea}
                                rows={6}
                            />
                            <div style={styles.counter}>
                                {count.toLocaleString()}/{MAX.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* 첨부 */}
                    <div style={styles.attachBox}>
                        <label htmlFor="review-files" style={styles.attachBtn}>
                            <span style={{ marginRight: 6, fontSize: 18 }}>📷</span>
                                사진/동영상 첨부하기
                        </label>
                        <input
                            id="review-files"
                            type="file"
                            accept="image/*"
                            multiple={false}
                            onChange={handleFiles}
                            style={{ display: "none" }}
                        />
                        {files.length > 0 && (
                            <div style={styles.fileInfo}>
                                {files.length}개 선택됨
                            </div>
                        )}
                    </div>

                    {/* 하단 버튼 */}
                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>
                            취소
                        </button>
                        <button
                            type="button"
                            disabled={!canSubmit}
                            onClick={() => onSubmit?.({ rating, content: content.trim(), files })}
                            style={{
                                ...styles.submitBtn,
                                opacity: canSubmit ? 1 : 0.6,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                            }}
                        >
                            등록
                        </button>
                    </div>
                </div>
            </div>
        );
    }

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  sheet: {
    width: 420,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    padding: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
  },
  topRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: "cover",
    flexShrink: 0,
  },
  hr: {
    height: 10,
    background: "#F4F5F3",
    borderRadius: 12,
    margin: "16px -20px",
  },
  starBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  },
  textareaWrap: {
    position: "relative",
    background: "#fff",
    border: "1px solid #E2E2E2",
    borderRadius: 12,
    padding: 8,
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    border: "none",
    outline: "none",
    fontSize: 14,
    lineHeight: 1.6,
    minHeight: 120,
  },
  counter: {
    position: "absolute",
    right: 12,
    bottom: 8,
    fontSize: 12,
    color: "#999",
  },
  attachBox: {
    border: "1px solid #E2E2E2",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  attachBtn: {
    display: "inline-flex",
    alignItems: "center",
    border: "none",
    background: "transparent",
    fontSize: 14,
    cursor: "pointer",
  },
  fileInfo: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: 12,
    border: "1px solid #CFCFCF",
    background: "#fff",
    cursor: "pointer",
    fontSize: 15,
  },
  submitBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: 12,
    border: "1px solid #B6D19B",
    background: "#B6D19B", // 이미지 느낌의 연두색계열
    cursor: "pointer",
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: 600,
  },
};
