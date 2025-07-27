import React, { useState } from 'react';

export default function CartItem({ item, isSelected, onToggleSelect, onDelete, onPurchase }) {
    const [quantity, setQuantity] = useState(item.quantity || 1);

    const handleIncrease = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div style={containerStyle}>
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(item.cart_item_id)}
            />
            <img src={item.image_url || '/default.png'} alt="상품 이미지" style={imageStyle} />
            
            <div style={infoStyle}>
                <div>{item.product_name}</div>
                <div>{item.price}원</div>
            </div>

            <div style={quantityStyle}>수량
                <button onClick={handleDecrease}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrease}>+</button>
            </div>

            <div>{item.delivery_type === 'smart' ? '스마트 배송' : '일반 배송'}</div>

            <button onClick={() => onDelete(item.cart_item_id)} style={buttonStyle}>삭제</button>
            <button onClick={() => onPurchase(item.cart_item_id)} style={buttonStyle}>구매</button>
        </div>
    );
}


// 스타일
const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #ddd',
    justifyContent: 'space-between',
};

const imageStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
};


const infoStyle = {
    display: 'flex',
    gap: '24px',
    fontWeight: '500',
};

const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};


const buttonStyle = {
    backgroundColor: '#d6e9c6',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 12px',
    cursor: 'pointer',
};
