import React from 'react';
import SelectAllCheckbox from '../common/checkbox/SelectAllCheckbox';

export default function CartActionBar({
    allSelected,
    onSelectAll,
    onDelete,
    onChangeDelivery
}) {
    const btnStyle = {
        marginLeft: '12px',
        backgroundColor: '#d5e8c7',
        color: '#333',
        border: 'none',
        fontSize: '14px',
        padding: '6px 12px',
        cursor: 'pointer',
        borderRadius: '8px'
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <SelectAllCheckbox
                    isChecked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    label="전체"
                />
                <button onClick={onChangeDelivery} style={btnStyle}>
                    배송 방법 변경
                </button>
            </div>

            <button onClick={onDelete} style={btnStyle}>
                선택 삭제
            </button>
        </div>
    );
}
