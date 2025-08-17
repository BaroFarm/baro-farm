import React from 'react';
import axios from 'axios';

export default function CartSummary({
  // 선택된 장바구니 라인(권장): [{ product_id, price, quantity }, ...]
  selectedLines,
  // smart | pickup (배송비 계산 규칙에 사용)
  deliveryType = 'smart',

  // ↓ fallback 용(선택)
  totalItems = 0,
  totalPrice = 0,

  discount = 0,
  shippingFee, // 넘기지 않으면 규칙으로 자동 계산
  pickupDate,
  pickupTime,
  pickupLocationId,
  onOrderClick,
}) {
  const hasSelected = Array.isArray(selectedLines) && selectedLines.length > 0;

  // 합계/수량 자동 계산 (selectedLines 우선)
  const calcTotalPrice = hasSelected
    ? selectedLines.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0)
    : Number(totalPrice || 0);

  const calcTotalQty = hasSelected
    ? selectedLines.reduce((sum, it) => sum + Number(it.quantity || 0), 0)
    : Number(totalItems || 0);

  // 배송비: prop이 숫자로 오면 그대로, 아니면 규칙으로 자동 결정
  const shipping = typeof shippingFee === 'number'
    ? shippingFee
    : (deliveryType === 'smart'
        ? (calcTotalPrice >= 40000 ? 0 : (calcTotalPrice > 0 ? 3000 : 0))
        : 0);

  const finalPrice = Math.max(0, calcTotalPrice - Number(discount || 0) + shipping);

  // (선택) 예약 API 호출 예시 — 단일 상품만 처리
  const handleOrder = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 단일 상품만 처리하는 경우: 첫 상품만 사용
      const first = hasSelected ? selectedLines[0] : null;
      const productId = first?.product_id;
      const quantity  = first?.quantity || (calcTotalQty || 1);

      if (!productId) {
        alert('주문할 상품을 선택해주세요.');
        return;
      }

      const BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
      const url  = BASE ? `${BASE}/api/reservations` : '/api/reservations';

      const res = await axios.post(
        url,
        {
          product_id: Number(productId),
          quantity: Number(quantity),
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          pickup_location_id: pickupLocationId,
        },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` } }
      );

      alert(res?.data?.message || '예약이 완료되었습니다!');
      onOrderClick?.();
    } catch (err) {
      console.error('예약 실패:', err);
      alert('예약에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <span>총 상품 금액</span>
        <span>{calcTotalPrice.toLocaleString()}원</span>
      </div>
      <div style={rowStyle}>
        <span>총 할인 금액</span>
        <span>{Number(discount).toLocaleString()}원</span>
      </div>
      <div style={rowStyle}>
        <span>총 배송비</span>
        <span>{shipping.toLocaleString()}원</span>
      </div>
      <div style={rowStyleBold}>
        <span>최종 결제 금액</span>
        <span>{finalPrice.toLocaleString()}원</span>
      </div>

      <div style={{ marginTop: 16, fontWeight: 'bold' }}>
        총 {calcTotalQty}개 {(calcTotalPrice - Number(discount)).toLocaleString()}원 + 배송비 {shipping.toLocaleString()}원 = 총 {finalPrice.toLocaleString()}원
      </div>

      <button onClick={handleOrder} style={buttonStyle}>주문하기</button>
    </div>
  );
}

const containerStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  width: '300px',
  backgroundColor: '#fff',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const rowStyleBold = { ...rowStyle, fontWeight: 'bold' };

const buttonStyle = {
  marginTop: '16px',
  backgroundColor: '#d6e9c6',
  border: 'none',
  borderRadius: '12px',
  padding: '10px',
  width: '100%',
  fontSize: '16px',
  cursor: 'pointer',
};
