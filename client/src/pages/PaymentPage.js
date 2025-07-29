import React from 'react';
import OrdererInfo from '../components/payment/OrdererInfo';
import OrderItemList from '../components/payment/OrderItemList';
import CouponDiscount from '../components/payment/CouponDiscount';
import PaymentSummary from '../components/payment/PaymentSummary';

//임시 예시 데이터
const cartItems = [
    { id: 1, name: '사과', price: 3000, quantity: 2, delivery: '바로 배송' },
    { id: 2, name: '배', price: 5000, quantity: 1, delivery: '일반 배송' }
];

export default function PaymentPage(){
    return(
        <div style={{padding: '24px'}}>
            <div style={{textAlign:'left', fontWeight:'bold', fontSize:'20px', marginBottom: '20px' }}>주문/결제</div>
            <OrdererInfo />
            {/* React Router의 location.state 사용해서 장바구니에서 선택한 상품 불러오가 */}
            <OrderItemList 
                items={[
                    { id: 1, image: '사과이미지URL', name: '사과', price: 3000, quantity: 2, delivery: '바로 배송' },
                    { id: 2, image: '사과이미지URL', name: '사과', price: 3000, quantity: 1, delivery: '일반 배송' }
                ]}
            />
            <CouponDiscount />
            <PaymentSummary 
                cartItems={cartItems}
                couponDiscount={0}
                pointDiscount={0} 
            />
        </div>
    );
}