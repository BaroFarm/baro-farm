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

// 결제 상태는 결제 승인 여부로 판별
const paymentStatusLabel = (paymentInfo) =>
  (paymentInfo?.approved_at || paymentInfo?.status === '성공') ? '결제 완료' : '결제 대기';

export default function OrderDetailPage({ order, focusProductId, focusOrderProductId }) {
  // 1) 훅은 항상 최상단에서 호출
  const orderItems = order?.orderItems ?? [];

  // 2) 클릭했던 상품(= hero) 우선 선택
  const heroItem = useMemo(() => {
    if (!orderItems.length) return null;

    if (focusOrderProductId != null) {
      const hit = orderItems.find(
        (i) => String(i.order_product_id) === String(focusOrderProductId)
      );
      if (hit) return hit;
    }

    if (focusProductId != null) {
      const hit = orderItems.find(
        (i) => String(i.product_id) === String(focusProductId)
      );
      if (hit) return hit;
    }

    return orderItems[0]; // 폴백
  }, [orderItems, focusProductId, focusOrderProductId]);

  // 3) 그 다음 조기 반환 (Hook 이후)
  if (!order) return null;

  // 4) 구조 분해는 이제 안전
  const {
    order_id,
    order_date,
    order_price,
    order_state,         // 필요 시 원문 표기
    deliveryInfo,
    paymentInfo,
    order_shipping_fee,
  } = order;

  const receiver = deliveryInfo?.receiver_name;
  const phone = deliveryInfo?.receiver_phone;

  // 주소(신/구 키 모두 대응)
  const address =
    deliveryInfo?.deliveryAddress ??
    deliveryInfo?.address ??
    null;

  const deliveryStatusText =
    DELIVERY_LABEL[deliveryInfo?.delivery_status] || '배송 상태 확인 중';

  const paymentStatusText = paymentStatusLabel(paymentInfo);

  const addrText =
    address?.full ||
    [address?.street, address?.detail].filter(Boolean).join(', ') ||
    '';

  const firstItem = heroItem || orderItems[0] || {};

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
        {/* 주문번호 + 결제 상태 + 직매장 문의 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontWeight: 'bold' }}>주문번호 {order_id}</div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
              }}
            >
              <span style={{ fontWeight: 'bold' }}>결제 상태</span>
              <span style={{ fontWeight: 'normal' }}>{paymentStatusText}</span>
            </div>
            <div style={{ fontSize: 13, whiteSpace: 'nowrap', marginTop: 4, color: '#555' }}>
              직매장(농가) 문의 &gt;
            </div>
          </div>
        </div>

        {/* 대표(클릭) 상품 블록 */}
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
          <div>할인 금액: -{Number(paymentInfo?.discountAmount || 0).toLocaleString()}원</div>
          <div>배송비: {Number(order_shipping_fee || 0).toLocaleString()}원</div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>
            결제 금액: {Number(order_price || 0).toLocaleString()}원
          </div>
          <div style={{ fontWeight: 'bold', marginTop: 8 }}>
            결제 수단: {METHOD_LABEL(paymentInfo?.method)}
          </div>
        </div>

        {/* (선택) 전체 품목 리스트 — 클릭한 상품은 하이라이트 */}
        {/* {orderItems.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>주문 상품 전체</div>
            {orderItems.map((it) => {
              const isHero =
                (heroItem && it.order_product_id === heroItem.order_product_id) ||
                (focusProductId != null && String(it.product_id) === String(focusProductId));
              return (
                <div
                  key={it.order_product_id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '8px 12px',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    marginBottom: 8,
                    background: isHero ? '#f9fff4' : '#fff',
                    outline: isHero ? '2px solid #3F7D20' : 'none',
                  }}
                >
                  <img
                    src={it.product_img || 'https://via.placeholder.com/60?text=상품'}
                    alt=""
                    style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.product_name}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      수량 {it.order_product_quantity}개 ・ {(it.order_product_price ?? 0).toLocaleString()}원
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )} */}

        {/* 포인트 혜택 (임시) */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>포인트 혜택</div>
          <div>구매 적립: ~~~원</div>
          <div>리뷰 적립: ~~~원</div>
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
