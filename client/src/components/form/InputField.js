import React from 'react';

export default function InputField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    onClear,
    required = false,
    readOnly = false,
}) {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <label
                style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '10px',
                    color: '#4B5563', // text-gray-700
                    zIndex: 10,
                }}
            >
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                style={{
                    width: '80%',
                    padding: '12px 40px 12px 40px', // 오른쪽에 X버튼 여유 포함
                    borderRadius: '6px',
                    backgroundColor: '#edf3e9',
                    fontSize: '14px',
                    border: 'none',
                    margin: '20px 0px 5px 0px',
                }}
            />

            {value && onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#4B5563',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: 0,
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}
