import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1) 배송상태 정규화 + 버튼 라벨 매핑
const normalizeStatus = (s) => {
  switch (s) {
    case '배송준비':
    case 'READY':
      return 'READY';
    case '배송중':
    case 'IN_DELIVERY':
      return 'IN_DELIVERY';
    case '배송완료':
    case 'DELIVERED':
      return 'DELIVERED';
    case '취소':
    case 'CANCELED':
      return 'CANCELED';
    default:
      return 'UNKNOWN';
  }
};

const STATUS_BTN_TEXT = {
  READY: '배송 준비중',
  IN_DELIVERY: '배송 조회',
  DELIVERED: '배송 조회',
  CANCELED: '취소됨',
  UNKNOWN: '배송 상태 미정',
};

export default function OrderCard({ order }) {
  const {
    order_id,
    order_date,
    order_price,
    delivery_status,
    itemsPreview = [],
  } = order || {};

  const firstItem = itemsPreview[0] || {};
  const formattedDate = order_date
    ? new Date(order_date).toLocaleDateString('ko-KR')
    : '-';

  const norm = normalizeStatus(delivery_status);
  const btnLabel = STATUS_BTN_TEXT[norm];
  const isDelivered = norm === 'DELIVERED';

  const navigate = useNavigate();

  // 상세 이동에 쓸 ID
  const detailId = order?.order_pk ?? order?.id ?? order_id;

  const goDetail = () => {
    if (!detailId) return;

    const focusPid = firstItem?.product_id ?? firstItem?.productId;
    const focusOpid = firstItem?.order_product_id;

    const params = new URLSearchParams();
    if (focusPid != null && focusPid !== '') params.set('pid', String(focusPid));
    if (focusOpid != null && focusOpid !== '') params.set('opid', String(focusOpid));
    const qs = params.toString();

    navigate(`/my/orders/${detailId}${qs ? `?${qs}` : ''}`, {
      state: {
        orderSnapshot: order,
        focusProductId: focusPid ?? null,
        focusOrderProductId: focusOpid ?? null,
      },
    });
  };

  const fallbackText = encodeURIComponent(firstItem?.product_name || '상품');
  const fallbackImg = `https://placehold.co/100x100?text=${fallbackText}`;

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
          src={firstItem?.image_url || firstItem?.product_img || fallbackImg}
          onError={(e) => { e.currentTarget.src = fallbackImg; }}
          alt={firstItem?.product_name || '상품명 없음'}
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
        <div style={{ fontSize: '13px', color: '#666', textAlign: 'left' }}>
          {formattedDate} 주문
        </div>

        <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>
          {firstItem?.product_name || '-'}
        </div>

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
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          {isDelivered ? (
            <button
              type="button"
              style={{
                border: '1px solid #3F7D20',
                color: '#3F7D20',
                padding: '6px 18px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '300px',
                fontSize: '16px',
              }}
            >
              리뷰 작성
            </button>
          ) : (
            <button
              type="button"
              style={{
                border: '1px solid #ccc',
                padding: '6px 18px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '300px',
                fontSize: '16px',
              }}
            >
              {btnLabel}
            </button>
          )}

          <button
            type="button"
            onClick={goDetail}
            style={{
              border: '1px solid #ccc',
              padding: '6px 18px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '300px',
              fontSize: '16px',
            }}
          >
            주문 상세
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #ccc',
              padding: '6px 18px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '300px',
              fontSize: '16px',
            }}
          >
            교환 / 반품
          </button>
        </div>
      </div>
    </div>
  );
}
