import React, {useState} from 'react';
import SelectAllCheckbox from '../common/checkbox/SelectAllCheckbox';

export default function SmartDelivery({
    cartItems,
    selectedItems,
    setSelectedItems,
    onDeleteSelected,
    onChangeDelivery     
}){

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(cartItems.map(item => item.cart_item_id)); // 전체 체크
        } else {
            setSelectedItems([]);
        }
    };
    const btnStyle = {
        marginLeft: '12px',
        backgroundColor: '#fff',
        color: '#333',
        border: 'none',
        fontSize: '14px',
        cursor: 'pointer'
    };

    return (
    <div>
        {/* 액션 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <SelectAllCheckbox
                    isChecked={selectedItems.length === cartItems.length}
                    onChange={(e) => handleSelectAll(e.target.checked, cartItems)}
                    label="전체"
                />
                <button onClick={onChangeDelivery} style={btnStyle}>
                    배송 방법 변경
                </button>
            </div>

            <button onClick={onDeleteSelected} style={btnStyle}>
                선택 삭제
            </button>
        </div>

        {/* 스마트 배송 상품 목록 */}
        <ul>
            {cartItems.map(item => (
                <li key={item.cart_item_id}>
                    <input
                        type="checkbox"
                        checked={selectedItems.includes(item.cart_item_id)}
                        onChange={() => {
                            if (selectedItems.includes(item.cart_item_id)) {
                                setSelectedItems(prev => prev.filter(id => id !== item.cart_item_id));
                            } else {
                                setSelectedItems(prev => [...prev, item.cart_item_id]);
                            }
                        }}
                    />
                    <span>{item.product_name} - {item.quantity}개</span>
                </li>
            ))}
        </ul>
    </div>
    );

}