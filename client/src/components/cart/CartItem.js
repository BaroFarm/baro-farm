import React, { useState } from 'react';

export default function CartItem({ item, isSelected, onToggleSelect, onDelete, onPurchase, onQuantityChange }) {
    //const [quantity, setQuantity] = useState(item.quantity || 1);

    // const handleIncrease = () => setQuantity(prev => prev + 1);
    // const handleDecrease = () => {
    //     if (quantity > 1) {
    //         setQuantity(prev => prev - 1);
    //     }
    // };
    const handleIncrease = () => {
        const newQty = item.quantity + 1;
        onQuantityChange(item.cart_item_id, newQty);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            const newQty = item.quantity - 1;
            onQuantityChange(item.cart_item_id, newQty);
        }
    };


    return (
        <div style={{ ...tableGrid, padding: '12px 0', borderBottom: '1px solid #ddd' }}>
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(item.cart_item_id)}
            />
            <img src={item.image_url || '/default.png'} alt="상품 이미지" style={imageStyle} />
            
            <div style={infoStyle}>
                <div>{item.product_name}</div>
                <div>{(item.price * item.quantity).toLocaleString()}원</div>
            </div>
            <div style={quantityStyle}>수량
                <button onClick={handleDecrease}>-</button>
                <span>{item.quantity}</span>
                <button onClick={handleIncrease}>+</button>
            </div>

            <div>{item.delivery_type === 'smart' ? '스마트 배송' : '일반 배송'}</div>
            
            <div style={buttonGroupStyle}>
                <button onClick={() => onDelete(item.cart_item_id)} style={buttonStyle}>삭제</button>
                <button onClick={() => onPurchase(item.cart_item_id)} style={buttonStyle}>구매</button>
            </div>
        </div>
    );
}

const tableGrid = {
    display: 'grid',
    gridTemplateColumns: '40px 80px 1fr 120px 120px 140px',
    /* 체크박스 | 이미지 | 상품명 | 수량 | 배송타입 | 버튼그룹 */
    alignItems: 'center',
    gap: '16px',
};
function CartHeader() {
    return (
        <div style={{ ...tableGrid, padding: '8px 0', color: '#666', fontSize: 14 }}>
        <div></div>
        <div></div>
        <div>상품명</div>
        <div>수량</div>
        <div>배송</div>
        <div style={{ justifySelf: 'end' }}>관리</div>
        </div>
    );
}

const imageStyle = {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    border: '1px solid green',
};


const infoStyle = {
    display: 'flex',
    gap: '44px',
    fontWeight: '500',
    flexDirection: 'row',
};

const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '120px',
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '6px', // 삭제/구매 버튼 간격만 조정
    marginLeft: 'end', // 버튼 그룹을 오른쪽 끝으로 밀기
};

const buttonStyle = {
    backgroundColor: '#d6e9c6',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 12px',
    cursor: 'pointer',
};
