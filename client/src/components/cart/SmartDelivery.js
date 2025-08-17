import React, {useState} from 'react';
import CartItem from './CartItem';
import DeliveryFarmInfo from './DeliveryFarmInfo';

export default function SmartDelivery({
  cartItems,
  selectedItems,
  setSelectedItems,
  onDeleteSingle,     // ✅ 부모의 삭제 핸들러를 받는다
  onChangeDelivery,
  onQuantityChange
}) {
  const handleToggleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handlePurchaseSingle = (id) => {
    alert(`${id}번 상품 구매 (예시)`);
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h3>스마트 배송 상품</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cartItems.map(item => (
          <li key={item.cart_item_id}>
            <CartItem
              item={item}
              isSelected={selectedItems.includes(item.cart_item_id)}
              onToggleSelect={handleToggleSelect}
              onDelete={() => onDeleteSingle(item.cart_item_id)}  // ✅ 부모 호출
              onPurchase={handlePurchaseSingle}
              onQuantityChange={onQuantityChange}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
