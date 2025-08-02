import React from 'react';

export default function RefundItemCard({ refunds }) {
    // 상태별로 그룹핑
    const grouped = {
        PROCESSING: [],
        COMPLETED: [],
    };

    refunds.forEach((item) => {
        if (grouped[item.status]) {
            grouped[item.status].push(item);
        }
    });

    const renderCard = (refund) => {
        return (
            <div key={refund.refund_id} style={{
                border: '1px solid #ccc',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                display: 'flex',
                gap: '16px',
            }}>
                <img
                    src="https://www.outdoornews.co.kr/news/photo/202009/32077_90504_551.jpg"
                    alt="상품 이미지"
                    style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                />

                <div style={{ textAlign: 'left', fontSize: '14px', flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>
                        {new Date(refund.created_at).toLocaleDateString('ko-KR')} 주문
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{refund.product_name}</div>
                    <div style={{ marginBottom: '4px' }}>수량: {refund.quantity}개</div>
                    <div style={{ marginBottom: '4px' }}>상품 가격: ~~~원</div>
                    <div style={{ marginBottom: '4px' }}>할인 금액: -~~~원</div>
                    <div style={{ marginBottom: '4px' }}>배송비: ~~~원</div>
                    <div style={{ margin: '8px 0', fontWeight: 'bold' }}>환불 금액: {refund.amount.toLocaleString()}원</div>
                    <div>환불 계좌: {refund.paymentInfo.method}</div>
                </div>
            </div>
        );
    };

    const sectionTitleStyle = {
        fontWeight: 'bold',
        fontSize: '18px',
        textAlign: 'left',
        margin: '32px 0 16px 0',
    };

    return (
        <div style={{ marginTop: '32px' }}>
            {grouped.PROCESSING.length > 0 && (
                <>
                    <div style={sectionTitleStyle}>결제 취소</div>
                    {grouped.PROCESSING.map(renderCard)}
                </>
            )}

            {grouped.COMPLETED.length > 0 && (
                <>
                    <div style={sectionTitleStyle}>환불 완료</div>
                    {grouped.COMPLETED.map(renderCard)}
                </>
            )}
        </div>
    );
}
