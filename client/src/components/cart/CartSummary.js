import React from 'react';

export default function CartSummary({
    totalItems = 0,
    totalPrice = 0,
    discount = 0,
    shippingFee = 0,
    onOrderClick
}) {
    const finalPrice = totalPrice - discount + shippingFee;

    return (
        <div style={containerStyle}>
            <div style={rowStyle}>
                <span>총 상품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div style={rowStyle}>
                <span>총 할인 금액</span>
                <span>{discount.toLocaleString()}원</span>
            </div>
            <div style={rowStyle}>
                <span>총 배송비</span>
                <span>{shippingFee.toLocaleString()}원</span>
            </div>
            <div style={rowStyleBold}>
                <span>최종 결제 금액</span>
                <span>{finalPrice.toLocaleString()}원</span>
            </div>

            <div style={{ marginTop: '16px', fontWeight: 'bold' }}>
                총 {totalItems}건 { (totalPrice - discount).toLocaleString() }원 + 배송비 {shippingFee.toLocaleString()}원 = 총 {finalPrice.toLocaleString()}원            </div>

            <button onClick={onOrderClick} style={buttonStyle}>주문하기</button>
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

const rowStyleBold = {
    ...rowStyle,
    fontWeight: 'bold',
};

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

