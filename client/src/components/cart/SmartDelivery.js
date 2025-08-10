import React, {useState} from 'react';
import CartItem from './CartItem';
import DeliveryFarmInfo from './DeliveryFarmInfo';

export default function SmartDelivery({
    cartItems,
    selectedItems,
    setSelectedItems,
    setCartItems,
    onDeleteSelected,
    onChangeDelivery,
    onQuantityChange     
}){
    const handleToggleSelect = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const handleDeleteSingle = (id) => {
        // 해당 아이템만 제외하고 갱신
        const updatedItems = cartItems.filter(item => item.cart_item_id !== id);
        setCartItems(updatedItems);
        setSelectedItems(prev => prev.filter(itemId => itemId !== id)); // 선택된 항목에서도 제거
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
                            onQuantityChange={onQuantityChange}
                        />
                    </li>
                ))}
            </ul>
            <DeliveryFarmInfo
                farmName="직매장(농가) 명"
                estimatedTime={40}
                arrivalTime="13시 51분"
                imageUrl="" // or 실제 이미지 URL
            />
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
                            onQuantityChange={onQuantityChange}
                        />
                    </li>
                ))}
            </ul>
    </div>
    );

}