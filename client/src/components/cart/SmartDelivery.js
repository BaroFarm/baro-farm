import React, {useState} from 'react';
import CartItem from './CartItem';

export default function SmartDelivery({
    cartItems,
    selectedItems,
    setSelectedItems,
    onDeleteSelected,
    onChangeDelivery     
}){
    const handleToggleSelect = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const handleDeleteSingle = (id) => {
        // TODO: 백엔드 연동 시 단일 삭제 API 호출
        alert(`${id}번 상품 삭제 (예시)`);
    };

    const handlePurchaseSingle = (id) => {
        // TODO: 구매 처리
        alert(`${id}번 상품 구매 (예시)`);
    };

    return (
    <div style={{ textAlign: 'left' }}>
            <h3>바로 배송 상품</h3>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {cartItems.map(item => (
                    <li key={item.cart_item_id}>
                        <CartItem
                            item={item}
                            isSelected={selectedItems.includes(item.cart_item_id)}
                            onToggleSelect={handleToggleSelect}
                            onDelete={handleDeleteSingle}
                            onPurchase={handlePurchaseSingle}
                        />
                    </li>
                ))}
            </ul>
(나중에 백엔드 API 명세서 확인 후 다시 수정...가격도 추가)
            
            <h3>일반 배송 상품</h3>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {cartItems.map(item => (
                    <li key={item.cart_item_id}>
                        <CartItem
                            item={item}
                            isSelected={selectedItems.includes(item.cart_item_id)}
                            onToggleSelect={handleToggleSelect}
                            onDelete={handleDeleteSingle}
                            onPurchase={handlePurchaseSingle}
                        />
                    </li>
                ))}
            </ul>
    </div>
    );

}