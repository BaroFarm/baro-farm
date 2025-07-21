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
    className = "",
}) {
    return (
        <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'  }}>
                {/* 라벨 */}
                <label
                    style={{
                        minWidth: '80px', // 라벨 고정 너비
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#111827',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {label}
                </label>

                {/* input + clear버튼 포함하는 래퍼 */}
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        readOnly={readOnly}
                        className={className}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            padding: '12px 40px 12px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#edf3e9',
                            fontSize: '14px',
                            border: 'none',
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
            </div>
        </div>
    );
}
