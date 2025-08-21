import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartSummary({
  selectedLines,
  deliveryType = 'smart',
  totalItems = 0,
  totalPrice = 0,
  discount = 0,
  shippingFee,
  onOrderClick,
}) {
  const navigate = useNavigate();
  const hasSelected = Array.isArray(selectedLines) && selectedLines.length > 0;

  // 합계/수량 자동 계산
  const calcTotalPrice = hasSelected
    ? selectedLines.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0)
    : Number(totalPrice || 0);

  const calcTotalQty = hasSelected
    ? selectedLines.reduce((sum, it) => sum + (it.quantity || 0), 0)
    : Number(totalItems || 0);

  // 배송비
  const shipping = typeof shippingFee === 'number'
    ? shippingFee
    : (deliveryType === 'smart'
        ? (calcTotalPrice >= 40000 ? 0 : (calcTotalPrice > 0 ? 3000 : 0))
        : 0);

  const finalPrice = Math.max(0, calcTotalPrice - Number(discount || 0) + shipping);

  // 주문 버튼 클릭 → 결제 페이지로 이동
  const handleOrder = () => {
    if (!hasSelected) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    // 결제 페이지로 데이터 전달
    navigate('/payments', {
      state: {
        selectedLines,
        calcTotalPrice,
        calcTotalQty,
        discount,
        shipping,
        finalPrice,
      },
    });

    onOrderClick?.();
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
