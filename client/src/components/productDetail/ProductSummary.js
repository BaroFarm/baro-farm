import React from 'react';

export default function ProductSummary({ product }) {
    return (
        <section style={{ display: 'flex', gap: '24px' }}>
            <img src={product.image_url} alt={product.title} style={{ width: 300, height: 300, objectFit: 'cover' }} />
            <div>
                <h2>{product.seller.name}</h2>
                <h2>{product.title}</h2>
                <h2>{product.weight}</h2>
                <p>{product.description}</p>
                <p><strong>{product.price.toLocaleString()}원</strong></p>
                <p>{'⭐'.repeat(Math.round(product.rating))}</p>
                <div style={{ marginTop: '12px' }}>
                    {/* 반품 가능 여부 표시 */}
                    <p style={{ marginTop: '8px', fontSize: '14px', color: product.is_returnable ? 'green' : 'gray' }}>
                        {product.is_returnable ? '반품 가능' : '반품 불가'}
                    </p>
                    <button>찜하기</button>
                    <button>장바구니</button>
                    <button>구매하기</button>
                </div>
            </div>
        </section>
    );
}
