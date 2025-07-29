import React from 'react';
import OrdererInfo from '../components/payment/OrdererInfo';
import OrderItemList from '../components/payment/OrderItemList';
import CouponDiscount from '../components/payment/CouponDiscount';

export default function PaymentPage(){
    return(
        <div style={{padding: '24px'}}>
            <div style={{textAlign:'left', fontWeight:'bold', fontSize:'20px', marginBottom: '20px' }}>주문/결제</div>
            <OrdererInfo />
            <OrderItemList 
                items={[
                    { id: 1, image: '사과이미지URL', name: '사과', price: 3000, quantity: 2, delivery: '바로 배송' },
                    { id: 2, image: '사과이미지URL', name: '사과', price: 3000, quantity: 1, delivery: '일반 배송' }
                ]}
            />
            <CouponDiscount />
        </div>
    );
}