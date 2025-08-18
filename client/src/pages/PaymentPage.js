import React from 'react';
import { useLocation } from 'react-router-dom';
import OrdererInfo from '../components/payment/OrdererInfo';
import OrderItemList from '../components/payment/OrderItemList';
import CouponDiscount from '../components/payment/CouponDiscount';
import PaymentSummary from '../components/payment/PaymentSummary';

export default function PaymentPage(){
const { state } = useLocation() || {};
  const {
    selectedLines = [],
    calcTotalPrice = 0,
    calcTotalQty = 0,
    discount = 0,
    shipping = 0,
    finalPrice = 0,
  } = state || {};

  // 이미지 URL 안전 처리 함수(상대경로 → 절대경로 변환 + null 처리)
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  const toImg = (raw) => {
    if (!raw) return null;                      // ← 빈 문자열/undefined → null
    if (/^https?:\/\//i.test(raw)) return raw;  // 절대 URL
    return API_BASE ? `${API_BASE}${raw}` : raw; // 상대 URL이면 BASE 붙이기(있으면)
  };

  const items = selectedLines.map(it => ({
    id: it.product_id,
    image: toImg(it.image_url || it.thumbnail || it.image || null), // ← null 보장
    name: it.product_name || it.name || '상품명',
    price: it.price,
    quantity: it.quantity,
    delivery: it.delivery_type === 'pickup' ? '바로 찾음' : '스마트 배송',
  }));

  return (
    <div style={{padding: '24px'}}>
      <div style={{textAlign:'left', fontWeight:'bold', fontSize:'20px', marginBottom: '20px' }}>
        주문/결제
      </div>

      <OrdererInfo />

      {/* 장바구니에서 선택한 상품들 표시 */}
      <OrderItemList 
        items={items}
      />

      <CouponDiscount />

      <PaymentSummary 
        cartItems={selectedLines}
        couponDiscount={discount}
        pointDiscount={0}
        shippingFee={shipping}
        finalPrice={finalPrice}
      />
    </div>
  );
}
