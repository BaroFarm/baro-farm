import React, { useMemo } from 'react';

const DELIVERY_LABEL = {
  '배송준비': '배송 준비',
  '배송중': '배송 중',
  '배송완료': '배송 완료',
  IN_DELIVERY: '배송 중',
  DELIVERED: '배송 완료',
  READY: '배송 준비',
};

const METHOD_LABEL = (m) => {
  if (!m) return '';
  if (m === '카드') return '카드';
  if (m === 'CreditCard' || m === 'CARD') return '신용카드';
  return m;
};

// ── 포인트 계산용 상수/헬퍼(컴포넌트 바깥에 OK) ─────────────────────────
const PERCENT_RATE = 0.01;         // 1%
const ROUND_TO = 10;               // 10P 단위 내림
const REVIEW_POINT_PER_ITEM = 100; // 텍스트 리뷰 100P(예상)

const sumMerchandise = (items = []) =>
  items.reduce((t, i) => {
    const price = Number(i.order_product_price ?? i.price ?? 0);
    const qty   = Number(i.order_product_quantity ?? i.quantity ?? 1);
    return t + price * qty;
  }, 0);

const calcPurchasePoints = (items, discount = 0, rate = PERCENT_RATE, roundTo = ROUND_TO) => {
  const merch = sumMerchandise(items);
  const net = Math.max(0, merch - Number(discount || 0));
  if (!roundTo || roundTo <= 1) return Math.floor(net * rate);
  return Math.floor((net * rate) / roundTo) * roundTo;
};
// ─────────────────────────────────────────────────────────────────────────

export default function OrderDetailPage({ order, focusProductId, focusOrderProductId }) {
  // 훅은 항상 최상단
  const orderItems = order?.orderItems ?? [];

  // 클릭했던 상품 우선
  const heroItem = useMemo(() => {
    if (!orderItems.length) return null;

    if (focusOrderProductId != null) {
      const hit = orderItems.find(i => String(i.order_product_id) === String(focusOrderProductId));
      if (hit) return hit;
    }
    if (focusProductId != null) {
      const hit = orderItems.find(i => String(i.product_id) === String(focusProductId));
      if (hit) return hit;
    }
    return orderItems[0];
  }, [orderItems, focusProductId, focusOrderProductId]);

  // 여기서부터 조기 반환 OK (훅 이후)
  if (!order) return null;

  // order를 구조분해 한 "뒤"에 계산을 하세요
  const {
    order_id,
    order_date,
    order_price,
    order_state,
    deliveryInfo,
    paymentInfo,
    order_shipping_fee,
  } = order;

  const receiver = deliveryInfo?.receiver_name;
  const phone = deliveryInfo?.receiver_phone;

  const address =
    deliveryInfo?.deliveryAddress ??
    deliveryInfo?.address ??
    null;

  const deliveryStatusText =
    DELIVERY_LABEL[deliveryInfo?.delivery_status] || '배송 상태 확인 중';

  const paymentStatusText =
    (paymentInfo?.approved_at || paymentInfo?.status === '성공') ? '결제 완료' : '결제 대기';

  const addrText =
    address?.full ||
    [address?.zipCode, address?.street, address?.detail].filter(Boolean).join(' ') ||
    '';

  const firstItem = heroItem || orderItems[0] || {};

  // ✅ 계산값은 여기! (order/paymentInfo/orderItems가 정의된 이후)
  const discountAmt = Number(paymentInfo?.discountAmount || 0);
  const purchasePts =
    order.pointInfo?.earned_purchase ??
    calcPurchasePoints(orderItems, discountAmt);
  const reviewPts =
    order.pointInfo?.earned_review ??
    (orderItems.length * REVIEW_POINT_PER_ITEM);

  return (
    <>
      {/* 배송 상태 */}
      <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 24, textAlign: 'left' }}>
        {deliveryStatusText}
      </div>

      <div
        style={{
          marginTop: 32,
          border: '1px solid #ccc',
          borderRadius: 16,
          padding: 32,
          fontSize: 15,
          textAlign: 'left',
          background: '#fff',
        }}
      >
        {/* 주문번호 + 결제 상태 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontWeight: 'bold' }}>주문번호 {order_id}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <span style={{ fontWeight: 'bold' }}>결제 상태</span>
              <span style={{ fontWeight: 'normal' }}>{paymentStatusText}</span>
            </div>
          </div>
        </div>

        {/* 대표(클릭) 상품 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <img
            src={firstItem.product_img || 'https://via.placeholder.com/100'}
            alt="상품 썸네일"
            style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }}
          />
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 14, color: '#777', marginBottom: 10 }}>
              {order_date ? new Date(order_date).toLocaleDateString('ko-KR') : ''} 주문
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
              {firstItem.product_name || '-'}
            </div>
            <div style={{ fontSize: 14 }}>
              수량: {firstItem.order_product_quantity ?? 0}개
            </div>
          </div>
        </div>

        {/* 배송지 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>배송지</div>
          <div>{receiver}</div>
          <div>{phone}</div>
          <div>{addrText}</div>
        </div>

        {/* 결제 정보 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>결제 정보</div>
          <div>상품 가격: {Number(order_price || 0).toLocaleString()}원</div>
          <div>할인 금액: -{discountAmt.toLocaleString()}원</div>
          <div>배송비: {Number(order_shipping_fee || 0).toLocaleString()}원</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>
            결제 금액: {Number(order_price || 0).toLocaleString()}원
          </div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>
            결제 수단: {METHOD_LABEL(paymentInfo?.method)}
          </div>
        </div>

        {/* 포인트 혜택 */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>포인트 혜택</div>
          <div>구매 적립: {purchasePts.toLocaleString()}P</div>
          <div>리뷰 적립(예상): {reviewPts.toLocaleString()}P</div>
          {order.pointInfo?.expires_at && (
            <div style={{ color: '#666', fontSize: 13 }}>
              적립 소멸 예정일: {new Date(order.pointInfo.expires_at).toLocaleDateString('ko-KR')}
            </div>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
        <button
          style={{
            border: '1px solid #ccc',
            padding: '10px 32px',
            borderRadius: 8,
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          배송 조회
        </button>
        <button
          style={{
            border: '1px solid #ccc',
            padding: '10px 32px',
            borderRadius: 8,
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          교환 / 반품
        </button>
      </div>
    </>
  );
}
