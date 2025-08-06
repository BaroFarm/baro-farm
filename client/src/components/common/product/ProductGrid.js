import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], title = "" }) {
    const itemsPerPage = 40;
    const visibleProducts = products.slice(0, itemsPerPage);

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
                    gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
                    gap: '10px',
                }}
            >
                {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
