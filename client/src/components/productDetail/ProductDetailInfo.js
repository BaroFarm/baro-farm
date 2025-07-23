import React, {useState} from 'react';

export default function ProductDetailInfo({ product }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(prev => !prev);

    return (
        <>
            <section style={{ display: 'flex', gap: '40px', alignItems: 'start', padding: '24px' }}>
                <h3 style={{ margin: '10px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>상품 상세 정보</h3>
            </section>

            {/* 상품 상세 정보 iframe */}
            {product.is_video && product.video_url && (
                <div style={{ marginTop: '0px', padding: '0px 24px' }}>
                    <iframe
                        width="100%"
                        height="400"
                        src={product.video_url.replace("watch?v=", "embed/")}
                        title="제품 영상"
                        allowFullScreen
                    />
                </div>
                )}
            {product.detail_page?.figma_export_url && (
                <div style={{ marginTop: '0px', padding: '0px 24px' }}>
                    <iframe
                        src={product.detail_page.figma_export_url}
                        width="100%"
                        height="800"
                        style={{ border: 'none' }}
                        title="상세정보 보기"
                    />
                </div>
            )}

            {/* 플로팅 버튼 */}
            <div
                style={{
                    position: 'relative',
                    // bottom: 20,
                    left: '50%',
                    width: '500px',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    border: '1px solid #ccc',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    cursor: 'pointer',
                }}
                onClick={toggleOpen}
            >
                <span style={{ fontWeight: 'bold' }}>
                    상세정보 {isOpen ? '접기 ▲' : '펼쳐보기 ▼'}
                </span>
            </div>
        </>
    );
}
