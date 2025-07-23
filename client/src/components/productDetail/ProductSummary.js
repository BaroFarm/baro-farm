import React from 'react';

export default function ProductSummary({ product }) {
    return (
        <section style={{ display: 'flex', gap: '40px', alignItems: 'start', padding: '24px' }}>
            {/* 왼쪽 영역 */}
            <div style={{ width: '450px', display: 'flex', flexDirection: 'column'}}>
            {/* 상품 상세 - 상단 한 줄 */}
                <h3 style={{ margin: '10px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>상품 상세</h3>
            {/* 아래 줄: 판매자명 + 즐겨찾기 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{product.seller.name}</h2>
                    <button style={{ ...roundStyle, cursor: 'pointer' }}>즐겨찾기</button>
                </div>
            {/* 이미지 및 반품 뱃지 */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={product.image_url}
                        alt={product.title}
                        style={{ width: 450, height: 300, objectFit: 'cover' }}
                    />
                    <p
                        style={{
                            ...roundStyle,
                            backgroundColor: product.is_returnable ? '#B6D19B' : '#D9D9D9',
                            position: 'relative',
                            margin: '20px 10px',
                            width: 'fit-content',
                            fontSize: '16px',
                        }}
                    >
                        {product.is_returnable ? '반품 가능' : '반품 불가'}
                    </p>
                </div>
            </div>

            {/* 오른쪽 영역 */}
            <div style={{ flex: 1, }}>
                <h2 style={{ marginTop: 120, textAlign: 'left'}}>{product.title} ({product.weight})</h2>
                <p style={{textAlign: 'left'}}>{product.description}</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'left' }}>
                    {product.price.toLocaleString()}원
                </p>
                <p style={{ fontSize: '18px', color: '#fbc02d', textAlign: 'right' }}>
                    {'⭐'.repeat(Math.round(product.rating))} ({product.rating})
                </p>
                {/* 쿠폰 영역 (나중에 추가) */}
                <div style={{border: '1px solid gray', height: '100px'}}>쿠폰 영역 (나중에 추가)</div>

                {/* 버튼들 */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '20px' 
                }}>
                {/* 왼쪽: 찜하기 */}
                <button style={{ ...roundStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="/logoWithoutText.svg" alt="찜" style={{ width: '20px', height: '20px' }} />
                        찜하기
                </button>

                {/* 오른쪽: 장바구니 + 구매하기 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ ...roundStyle, width: '100px' }}>장바구니</button>
                    <button style={{ ...roundStyle, width: '100px' }}>구매하기</button>
                </div>
            </div>
        </div>
    </section>
    );
}

const roundStyle = {
    fontSize: '16px',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#B6D19B',
    border: 'none',
    cursor: 'pointer',
    height: 'fit-content',
};
