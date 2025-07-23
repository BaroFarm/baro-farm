import React from 'react';

export default function ProductSummary({ product }) {
    return (
        <>
        <h3>상품 상세</h3>
        <section style={{ display: 'flex', gap: '24px' }}>
            <h2>{product.seller.name}</h2>
            <button style={{...roundStyle, cursor: 'pointer'}}>즐겨찾기</button>

            <div>
                <img src={product.image_url} alt={product.title} style={{ width: 300, height: 300, objectFit: 'cover' }} />
                <h2>{product.title}</h2>
                <h2>{product.weight}</h2>
                <p>{product.description}</p>
                <p><strong>{product.price.toLocaleString()}원</strong></p>
                <p>{'⭐'.repeat(Math.round(product.rating))}</p>
                <div style={{ marginTop: '12px' }}>
                    {/* 반품 가능 여부 표시 */}
                    <p
                        style={{
                            ...roundStyle,
                            fontSize: '14px',
                            backgroundColor: product.is_returnable ? '#B6D19B' : '#D9D9D9',
                        }}
                    >
                        {product.is_returnable ? '반품 가능' : '반품 불가'}
                    </p>
                    <button style={{...roundStyle, cursor: 'pointer'}}>
                        <img src="/logoWithoutText.svg" alt="찜" style={{ width: '20px', height: '20px' }} />
                        찜하기
                    </button>
                    <button style={{...roundStyle, cursor: 'pointer'}}>장바구니</button>
                    <button style={{...roundStyle, cursor: 'pointer'}}>구매하기</button>
                </div>
            </div>
        </section>
    </>
    );
}

const roundStyle={
    marginTop: '8px',
    fontSize: '16px',
    padding: '6px 10px',
    borderRadius: '999px',
    display: 'inline-block',
    width: 'fit-content',
    backgroundColor: '#B6D19B',
    border: 'none',
};
