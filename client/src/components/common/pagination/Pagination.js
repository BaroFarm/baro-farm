import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = [];

    // 기본적으로 항상 1은 보이게 함
    if (totalPages <= 1) {
        pages.push(1);  // 페이지 1은 항상 표시
    } else {
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
            pages.push(i);
        }

        if (totalPages > 5) {
            pages.push("...");
            pages.push(totalPages - 1);
            pages.push(totalPages);
        }
    }

    return (
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
            {/* 이전 버튼 */}
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                ← 이전
            </button>

            {/* 페이지 숫자들 */}
            {pages.map((p, idx) => (
                <button
                    key={idx}
                    disabled={p === "..." || totalPages <= 1}  // 페이지 1개일 땐 숫자 클릭도 비활성화
                    onClick={() => typeof p === "number" && onPageChange(p)}
                    style={{
                        fontWeight: p === currentPage ? "bold" : "normal",
                        backgroundColor: p === currentPage ? "#222" : "#fff",
                        color: p === currentPage ? "#fff" : "#888",
                        padding: "4px 10px",
                        borderRadius: "5px",
                        cursor: p === "..." || totalPages <= 1 ? "default" : "pointer"
                    }}
                >
                    {p}
                </button>
            ))}

            {/* 다음 버튼 */}
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                다음 →
            </button>
        </div>
    );
}
