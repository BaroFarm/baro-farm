import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderCard({ order }) {
    const {
        //order_id,
        order_date,
        order_price,
        //order_state,
        delivery_status,
        //receiver_name,
        //street,
        itemsPreview,
    } = order;

    const firstItem = itemsPreview[0];
    const formattedDate = order_date
        ? new Date(order_date).toLocaleDateString('ko-KR')
        : '-';

      // 영문/한글 둘 다 수용
    const deliveryStatusText = {
        DELIVERED: '배송 조회',
        '배송완료': '배송 조회',
        IN_DELIVERY: '배송 조회',
        '배송중': '배송 조회',
        PREPARING: '배송 준비중',
        '배송 준비중': '배송 준비중',
        CANCELED: '취소됨',
        '취소': '취소됨',
    };

    const isDelivered = delivery_status === 'DELIVERED' || delivery_status === '배송완료';
    const showReviewButton = isDelivered;

    const navigate = useNavigate();

    // ✅ 상세에 넘길 ID: 숫자 PK 우선, 없으면 코드 사용
    const detailId =
        order.order_pk ??
        order.id ??
        (typeof order.order_id === 'number' ? order.order_id : order.order_id);

    const goDetail = () => {
        if (!detailId) return;
        // ✅ 스냅샷을 함께 넘겨 상세에서 곧바로 렌더 (API 실패/지연 대비)
        navigate(`/my/orders/${detailId}`, { state: { orderSnapshot: order } });
    };

    const fallbackImg =
        'https://placehold.co/100x100?text=' +
        encodeURIComponent(firstItem.product_name || '상품');

    return (
        <div
            style={{
                border: '1px solid #ddd',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                backgroundColor: '#fff',
                display: 'flex',
                gap: '20px',
            }}
        >
        {/* 썸네일 */}
            <div>
                <img
                    src={
                        firstItem.image_url ||
                        firstItem.product_img ||
                        fallbackImg
                    }
                    onError={(e) => { e.currentTarget.src = fallbackImg; }}
                    alt={firstItem.product_name || '상품명 없음'}
                    style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                    }}
                />
            </div>

            {/* 텍스트 영역 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* 날짜 */}
                <div style={{ fontSize: '13px', color: '#666', textAlign: 'left' }}>{formattedDate} 주문</div>

                {/* 상품명 */}
                <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>{firstItem.product_name || '-'}</div>

                {/* 가격 + 수량 + 문의 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#333',
                    }}
                >
                    <div>
                        {(order_price ?? 0).toLocaleString()} 원&nbsp;&nbsp;&nbsp;&nbsp;
                            수량: {firstItem?.quantity ?? firstItem?.order_product_quantity ?? '-'}
                    </div>
                    <div style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                        직매장(농가) 명 문의 &gt;
                    </div>
                </div>

                {/* 버튼들 */}
                <div style={{ display: 'flex',
                    gap: '20px',
                    marginTop: '20px',
                    flexWrap: 'wrap', // 줄바꿈 가능 
                    }}>
                    {showReviewButton ? (
                        <button
                            style={{
                                border: '1px solid #3F7D20',
                                color: '#3F7D20',
                                padding: '6px 18px',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                minWidth: '300px',
                                fontSize: '16px'
                            }}
                        >
                            리뷰 작성
                        </button>
                    ) : (
                        <button
                            style={{
                                border: '1px solid #ccc',
                                padding: '6px 18px',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                minWidth: '300px',
                                fontSize: '16px'

                            }}
                        >
                            {deliveryStatusText[delivery_status] || '배송 상태 미정'}
                        </button>
                    )}

                    <button
                        onClick={goDetail}
                        style={{
                            border: '1px solid #ccc',
                            padding: '6px 18px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            minWidth: '300px',
                            fontSize: '16px'
                        }}
                    >
                        주문 상세
                    </button>

                    <button
                        style={{
                            border: '1px solid #ccc',
                            padding: '6px 18px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            minWidth: '300px',
                            fontSize: '16px'
                        }}
                    >
                        교환 / 반품
                    </button>
                </div>
            </div>
        </div>
    );
}
