import React from 'react';

export default function RefundItemCard({ refunds, onSelect }) {
  // 백엔드 상태 → 프런트 상태 맵 (리스트 분류용)
  const statusMap = {
    '요청됨': 'PROCESSING',
    '승인됨': 'PROCESSING',
    '완료': 'COMPLETED',
    '거절': 'REJECTED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
  };

  const grouped = { PROCESSING: [], COMPLETED: [], REJECTED: [] };
  (refunds || []).forEach((item) => {
    const key = statusMap[item.status] || 'REJECTED';
    grouped[key].push(item);
  });

  const renderCard = (refund) => (
    <button type="button"
      key={refund.refund_id}
      onClick={() => onSelect?.(refund)}
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid #ccc',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        display: 'flex',
        gap: 16,
        background: 'white',
        cursor: 'pointer',
      }}
    >
      <img
        src={refund.product_img || 'https://www.outdoornews.co.kr/news/photo/202009/32077_90504_551.jpg'}
        alt="상품 이미지"
        style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }}
      />

      <div style={{ fontSize: 14, flex: 1 }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
          {refund.created_at ? new Date(refund.created_at).toLocaleDateString('ko-KR') : ''} 주문
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{refund.product_name}</div>
        <div style={{ marginBottom: 4 }}>수량: {refund.quantity}개</div>
        <div style={{ marginBottom: 4 }}>
          상품 가격: {(refund.paymentInfo?.amount ?? 0).toLocaleString()}원
        </div>
        <div style={{ marginBottom: 4 }}>
          배송비: {(refund.shipping_fee ?? 0).toLocaleString()}원
        </div>
        <div style={{ margin: '8px 0', fontWeight: 'bold' }}>
          환불 금액: {(refund.refund_amount ?? 0).toLocaleString()}원
        </div>
        <div>결제 수단: {refund.paymentInfo?.method ?? '-'}</div>
      </div>
    </button>
  );

  const Section = ({ title, list }) =>
    list.length > 0 && (
      <>
        <div style={{ fontWeight: 'bold', fontSize: 18, margin: '32px 0 16px' }}>{title}</div>
        {list.map(renderCard)}
      </>
    );

  const allEmpty = !grouped.PROCESSING.length && !grouped.COMPLETED.length && !grouped.REJECTED.length;

  return (
    <div style={{ marginTop: 32 , textAlign: 'left'}}>
      <Section title="진행 중" list={grouped.PROCESSING} />
      <Section title="환불 완료" list={grouped.COMPLETED} />
      <Section title="환불 거절" list={grouped.REJECTED} />
      {allEmpty && (refunds || []).map(renderCard)}
    </div>
  );
}
