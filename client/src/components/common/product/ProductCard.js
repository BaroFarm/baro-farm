//만들고 -> 상품 추천 리스트 짜고 -> 카테고리별 페이지 이동 링크 설정
import React from 'react';

export default function ProductCard({ product }) {
    // 별점 수에 따라 ⭐ 반복
    const stars = '⭐'.repeat(Math.round(product.rating || 0));

    return (
        <div className="border rounded p-3"
        style={{
            width: "100%",
            height: 250,
            backgroundColor: "#eee",
            display: "flex", flexDirection: "column",
            justifyContent: "start",
            color: "#555",
            }}>
            {/* 이미지 */}
            <img src={product.image} alt={product.name} 
                style={{ width: "100%", height: 150, objectFit: "cover" }} />
            {/* 상품명 */}
            <h3 style={{ marginTop: 8, fontWeight: "600", fontSize: 15, textAlign: "left" }}>
                {product.name}</h3>
            {/* 가격 */}
            <div style={{ textAlign: "right", fontWeight: "bold", color: "#2e7d32", fontSize: 14 }}>
                {product.price.toLocaleString()}원
            </div>
            {/* 별점 */}
            <div style={{ marginTop: 4, color: "#fbc02d", fontSize: 14, textAlign: "left" }}>
                {stars}
            </div>
        </div>
    );
}