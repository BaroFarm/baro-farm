import React from 'react';

export default function OrderDetailPage({order}) {

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
    <div style={{ marginTop: '32px', border: '1px solid #ddd', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>주문번호 {order_id}</div>
            <div>결제 상태 {order_state === 'DELIVERED' ? '결제 완료' : '결제 대기'}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img
                src="https://www.outdoornews.co.kr/news/photo/202009/32077_90504_551.jpg"
                alt="상품 썸네일"
                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
                <div style={{ fontSize: '14px', color: '#777' }}>{new Date(order_date).toLocaleDateString('ko-KR')} 주문</div>
                    <div style={{ fontWeight: 'bold' }}>{orderItems[0]?.product_name}</div>
                    <div style={{ fontSize: '14px' }}>수량 {orderItems[0]?.order_product_quantity}개</div>
                </div>
            </div>

            <div style={{ fontSize: '15px', marginBottom: '12px' }}>
                <strong>배송지</strong><br />
                {receiver} <br />
                {phone} <br />
                {address?.street}, {address?.detail}
            </div>

            <div style={{ fontSize: '15px', marginBottom: '12px' }}>
                <strong>결제 정보</strong><br />
                총 결제 금액: {order_price.toLocaleString()}원<br />
                할인 금액: -{paymentInfo?.discountAmount.toLocaleString()}원<br />
                결제 수단: {paymentInfo?.method === 'CreditCard' ? '신용카드' : paymentInfo?.method}<br />
                승인 시간: {new Date(paymentInfo?.approved_at).toLocaleString('ko-KR')}
            </div>

            <div style={{ fontSize: '15px', marginBottom: '16px' }}>
                <strong>포인트 혜택</strong><br />
                구매 적립: ~~~원<br />
                리뷰 적립: ~~~원
            </div>

        {/* 버튼들 */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button style={{ border: '1px solid #ccc', padding: '10px 30px', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>배송 조회</button>
                <button style={{ border: '1px solid #ccc', padding: '10px 30px', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>교환 / 반품</button>
            </div>
        </div>
    );
}
