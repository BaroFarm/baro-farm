import React from 'react';
import axios from 'axios';

export default function CartSummary({
    totalItems = 0,
    totalPrice = 0,
    discount = 0,
    shippingFee = 0,
    productId,
    pickupDate,
    pickupTime,
    pickupLocationId,
    onOrderClick
}) {
    const finalPrice = totalPrice - discount + shippingFee;
    
    const handleOrder = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/reservations`,
            {
                product_id: 101,           // 예시 상품 ID
                quantity: totalItems || 1, // 0이면 1개로 보정
                pickup_date: pickupDate,
                pickup_time: pickupTime,
                pickup_location_id: pickupLocationId      // 예시 직매장 ID
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        );

        // 백엔드 응답 확인
        console.log("예약 성공:", response.data);
        alert(response.data.message || "예약이 완료되었습니다!");

        onOrderClick?.(); // 주문 완료 후 추가 동작 (예: 페이지 이동)
    } catch (err) {
        console.error("예약 실패:", err);
        alert("예약에 실패했습니다. 다시 시도해주세요.");
    }
};

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

