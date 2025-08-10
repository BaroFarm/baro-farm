import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductSlider({ products = [], title = "", onMoreClick, onItemClick }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < products.length) {
            setCurrentIndex(currentIndex + itemsPerPage);
        }
    };

    const prevSlide = () => {
        setCurrentIndex(Math.max(currentIndex - itemsPerPage, 0));
    };

    const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

    return (
        <div style={{ width: '100%', padding: '0', position: 'relative' }}>
            {/* 제목 + 버튼 한 줄 정렬 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{title}</h2>
                {onMoreClick && (
                    <button
                        onClick={onMoreClick}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        정기배송 상품 더보기 &gt;
                    </button>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                {/* 상품 카드 슬라이더 */}
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        overflow: 'hidden',
                        justifyContent: 'flex-start',
                    }}
                >
                    {visibleProducts.map((product) => {
                        const pid = String(product?.id ?? product?.product_id); // ✅ id/product_id 모두 지원
                        return (
                            <div
                                key={pid}
                                style={{ flexShrink: 0, flexGrow: 0, maxWidth: '233px', width: '233px' }}
                            >
                                <ProductCard product={product} onClick={onItemClick ? () => onItemClick(product) : undefined} />
                            </div>
                        );
                    })}
                </div>

                {/* 왼쪽 버튼 */}
                <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    style={{
                        position: 'absolute',
                        left: '-20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        zIndex: 10,
                        opacity: currentIndex === 0 ? 0.3 : 1,
                    }}
                >
                    ◀
                </button>

                {/* 오른쪽 버튼 */}
                <button
                    onClick={nextSlide}
                    disabled={currentIndex + itemsPerPage >= products.length}
                    style={{
                        position: 'absolute',
                        right: '-20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        zIndex: 10,
                        opacity: currentIndex + itemsPerPage >= products.length ? 0.3 : 1,
                    }}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
