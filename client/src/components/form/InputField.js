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
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                width: '100%',
            }}
        >
            {/* 라벨 왼쪽 */}
            <label
                style={{
                    width: '100px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginRight: '8px',
                    textAlign: 'right',
                }}
            >
                {label}
            </label>

            {/* 인풋 오른쪽 */}
            <div style={{ position: 'relative', flex: 1 }}>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    readOnly={readOnly}
                    style={{
                        width: '100%',
                        padding: '10px 36px 10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        backgroundColor: '#edf3e9',
                        fontSize: '14px',
                    }}
                />
                {onClear && value && (
                    <button
                        type="button"
                        onClick={onClear}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            color: '#999',
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
