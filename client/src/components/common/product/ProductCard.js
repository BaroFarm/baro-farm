import React from 'react';
import {useNavigate} from 'react-router-dom';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    // 별점 수에 따라 ⭐ 반복
    const stars = '⭐'.repeat(Math.round(product.rating || 0));

    const handleClick = () => {
        navigate(`/shop/product/${product.id}`); // ← 백엔드와 일치하는 ID 경로
    };

    return (
        <div className="border rounded p-3"
        onClick={handleClick}
        style={{
            width: "100%",
            height: 250,
            backgroundColor: "#eee",
            display: "flex", flexDirection: "column",
            justifyContent: "start",
            color: "#555",
            cursor: 'pointer',
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