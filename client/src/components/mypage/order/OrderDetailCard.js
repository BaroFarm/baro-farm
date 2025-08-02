import React from 'react';

export default function OrderDetailPage({ order }) {
    if (!order) return null;

    const {
        order_id,
        order_date,
        order_price,
        order_state,
        deliveryInfo,
        orderItems,
        paymentInfo,
    } = order;

    const receiver = deliveryInfo?.reciever_name;
    const phone = deliveryInfo?.receiver_phone;
    const address = deliveryInfo?.deliveryAddress;

    return (
        <>
        {/* 배송 상태 표시 */}
        <div style={{
            fontWeight: 'bold',
            fontSize: '20px',
            marginBottom: '24px',
            textAlign: 'left'
        }}>
            {deliveryInfo?.delivery_status === 'DELIVERED' ? '배송 완료' : '배송 중'}
        </div>
        <div style={{
            marginTop: '32px',
            border: '1px solid #ccc',
            borderRadius: '16px',
            padding: '32px',
            fontSize: '15px',
            textAlign: 'left'
        }}>
            
        {/* 주문번호 + 결제 상태 + 직매장 문의 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontWeight: 'bold' }}>주문번호 {order_id}</div>

            {/* 오른쪽 영역 */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span style={{ fontWeight: 'bold' }}>결제 상태</span>
                        <span style={{ fontWeight: 'normal' }}>
                            {order_state === 'DELIVERED' ? '결제 완료' : '결제 대기'}
                        </span>
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'nowrap', marginTop: '4px', color: '#555' }}>
                        직매장(농가) 명 문의 &gt;
                    </div>
                </div>
            </div>

            {/* 상품 썸네일 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <img
                    src="https://www.outdoornews.co.kr/news/photo/202009/32077_90504_551.jpg"
                    alt="상품 썸네일"
                    style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{marginBottom: '10px'}}>
                    <div style={{ fontSize: '14px', color: '#777', marginBottom: '10px' }}>{new Date(order_date).toLocaleDateString('ko-KR')} 주문</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>{orderItems[0]?.product_name}</div>
                    <div style={{ fontSize: '14px' }}>수량: {orderItems[0]?.order_product_quantity}개</div>
                </div>
            </div>

            {/* 배송지 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>배송지</div>
                <div>{receiver}</div>
                <div>{phone}</div>
                <div>{address?.street}, {address?.detail}</div>
            </div>

            {/* 결제 정보 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>결제 정보</div>
                <div>상품 가격: {order_price.toLocaleString()}원</div>
                <div>할인 금액: -{paymentInfo?.discountAmount.toLocaleString()}원</div>
                <div>배송비: ~~~원</div> {/* 배송비가 없으므로 일단 하드코딩 */}
                <div style={{ fontWeight: 'bold', marginTop: '8px' }}>결제 금액: {order_price.toLocaleString()}원</div>
                <div style={{ fontWeight: 'bold', marginTop: '8px' }}>결제 수단: {paymentInfo?.method === 'CreditCard' ? '신용카드' : paymentInfo?.method}</div>
            </div>

            {/* 포인트 혜택 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>포인트 혜택</div>
                <div>구매 적립: ~~~원</div>
                <div>리뷰 적립: ~~~원</div>
            </div>
        </div>
        {/* 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px' }}>
                <button style={{
                    border: '1px solid #ccc',
                    padding: '10px 32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                }}>
                    배송 조회
                </button>
                <button style={{
                    border: '1px solid #ccc',
                    padding: '10px 32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                }}>
                    교환 / 반품
                </button>
            </div>
            </>
    );
}
