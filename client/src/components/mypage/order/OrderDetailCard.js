import React from 'react';

const DELIVERY_LABEL = {
  '배송준비': '배송 준비',
  '배송중': '배송 중',
  '배송완료': '배송 완료',
  // 혹시 영문이 섞여 들어올 때 대비
  'IN_DELIVERY': '배송 중',
  'DELIVERED': '배송 완료',
  'READY': '배송 준비',
};

const METHOD_LABEL = (m) => {
  if (!m) return '';
  if (m === '카드') return '카드';
  if (m === 'CreditCard' || m === 'CARD') return '신용카드';
  return m;
};

// 결제 상태는 결제 승인 여부로 판단하는 게 안전함
const paymentStatusLabel = (paymentInfo) =>
  (paymentInfo?.approved_at || paymentInfo?.status === '성공') ? '결제 완료' : '결제 대기';

export default function OrderDetailPage({ order }) {
  if (!order) return null;

  const {
    order_id,
    order_date,
    order_price,
    order_state, // 필요하면 화면 어딘가에 원문 표시
    deliveryInfo,
    orderItems = [],
    paymentInfo,
    order_shipping_fee, // 있으면 사용
  } = order;

  const receiver = deliveryInfo?.receiver_name; // ✅ 오타 수정
  const phone = deliveryInfo?.receiver_phone;
  const address = deliveryInfo?.deliveryAddress;
  const deliveryStatusText = DELIVERY_LABEL[deliveryInfo?.delivery_status] || '배송 상태 확인 중';
  const paymentStatusText = paymentStatusLabel(paymentInfo);

  const firstItem = orderItems[0];

  return (
    <>
      {/* 배송 상태 표시 */}
      <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '24px', textAlign: 'left' }}>
        {deliveryStatusText}
      </div>

      <div style={{ marginTop: '32px', border: '1px solid #ccc', borderRadius: '16px', padding: '32px', fontSize: '15px', textAlign: 'left' }}>
        {/* 주문번호 + 결제 상태 + 직매장 문의 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold' }}>주문번호 {order_id}</div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>결제 상태</span>
              <span style={{ fontWeight: 'normal' }}>{paymentStatusText}</span>
            </div>
            <div style={{ fontSize: '13px', whiteSpace: 'nowrap', marginTop: '4px', color: '#555' }}>
              직매장(농가) 문의 &gt;
            </div>
          </div>
        </div>

        {/* 상품 썸네일 */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <img
            src={firstItem?.product_img || 'https://via.placeholder.com/100'}
            alt="상품 썸네일"
            style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', color: '#777', marginBottom: '10px' }}>
              {order_date ? new Date(order_date).toLocaleDateString('ko-KR') : ''}
              {' '}주문
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
              {firstItem?.product_name || '-'}
            </div>
            <div style={{ fontSize: '14px' }}>
              수량: {firstItem?.order_product_quantity ?? 0}개
            </div>
          </div>
        </div>

        {/* 배송지 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>배송지</div>
          <div>{receiver}</div>
          <div>{phone}</div>
          <div>{address ? `${address.street || ''}${address.detail ? `, ${address.detail}` : ''}` : ''}</div>
        </div>

        {/* 결제 정보 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>결제 정보</div>
          <div>상품 가격: {Number(order_price || 0).toLocaleString()}원</div>
          <div>할인 금액: -{Number(paymentInfo?.discountAmount || 0).toLocaleString()}원</div>
          <div>배송비: {Number(order_shipping_fee || 0).toLocaleString()}원</div>
          <div style={{ fontWeight: 'bold', marginTop: '8px' }}>
            결제 금액: {Number(order_price || 0).toLocaleString()}원
          </div>
          <div style={{ fontWeight: 'bold', marginTop: '8px' }}>
            결제 수단: {METHOD_LABEL(paymentInfo?.method)}
          </div>
        </div>

        {/* 포인트 혜택 (임시) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>포인트 혜택</div>
          <div>구매 적립: ~~~원</div>
          <div>리뷰 적립: ~~~원</div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px' }}>
        <button style={{ border: '1px solid #ccc', padding: '10px 32px', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
          배송 조회
        </button>
        <button style={{ border: '1px solid #ccc', padding: '10px 32px', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
          교환 / 반품
        </button>
      </div>
    </>
  );
}
