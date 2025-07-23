import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], title = "" }) {
    const itemsPerPage = 40;

    const visibleProducts = products.slice(0, itemsPerPage);

    return (
        <div className="w-full px-4">
            <h2 className="text-xl font-bold mb-4" style={{ textAlign: "left" }}>
                {title}
            </h2>
            <div
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(220px, 1fr))",
                gap: "20px",
                }}
            >
                {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
