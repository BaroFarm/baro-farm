import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], title = "", forceFrom}) {
    const itemsPerPage = 40;
    const visibleProducts = products.slice(0, itemsPerPage);
    const navigate = useNavigate();

    const goDetail = (p) => {
    const pid = String(p.id ?? p.product_id);
    if (!pid) return;
    if (forceFrom === 'sub') {
        navigate(`/shop/product/${pid}?from=sub`, { state: { from: 'subscription' } });
    } else {
      navigate(`/shop/product/${pid}`); // ✅ 메인은 쿼리/state 안 붙임
    }
    };

    return (
        <div style={{ width: '100%', padding: '0' }}>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    textAlign: 'left',
                }}
            >
                {title}
            </h2>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 233px)',
                    gap: '10px',
                }}
            >
                {visibleProducts.map((p) => (
                    <div key={p.id ?? p.product_id} onClick={() => goDetail(p)} style={{ cursor: 'pointer' }}>
                    <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </div>
    );
}
