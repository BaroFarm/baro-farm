import React from 'react';

export default function SelectAllCheckbox({ isChecked, onChange, label = '전체 선택' }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                style={{ marginRight: '8px' }}
            />
                {label}
        </label>
    );
}
