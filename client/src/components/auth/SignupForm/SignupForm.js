import React from 'react';
import InputField from '../../form/InputField';
import PasswordField from './PasswordField';

export default function SignupForm({ form, setForm, errors, setErrors, onOpenAddressModal, user_type }) {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    
    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px'}} >
            <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 1rem' }}>
                {/* 이메일 */}
                <InputField
                    label="이메일"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                        const email = e.target.value;
                        setForm({ ...form, email });

                        setErrors((prev) => {
                            if (!isValidEmail(email)) {
                                return { ...prev, email: '유효한 이메일 형식이 아닙니다.' };
                            } else if (prev.email === '유효한 이메일 형식이 아닙니다.') {
                                return { ...prev, email: '' };
                            } else {
                                return prev; // 중복 메시지는 유지
                            }
                        });
                    }}

                    onClear={() => setForm({ ...form, email: '' })}
                    placeholder="example@example.com"
                />
                {errors.email && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors.email}</p>}

                {/* 비밀번호 */}
                <PasswordField form={form} setForm={setForm} errors={errors} setErrors={setErrors} />

                <InputField
                    label="이름"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="이름을 입력해주세요"
                />
                {errors.name && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors.name}</p>}

                {user_type !== 'seller' && (
                    <>
                        <InputField
                            label="닉네임"
                            type="text"
                            value={form.nickname}
                            onChange={(e) => {
                                setForm({ ...form, nickname: e.target.value });
                                setErrors({ ...errors, nickname: '' });
                            }}
                            placeholder="닉네임을 입력해주세요"
                            onClear={() => setForm({ ...form, nickname: '' })}
                        />
                        {errors.nickname && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors.nickname}</p>}
                    </>
                )}

                <InputField
                    label="전화번호"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="010-1234-5678"
                    onClear={() => setForm({ ...form, phoneNumber: '' })}
                />

                {user_type === 'seller' && (
                    <InputField
                        label="상호명"
                        type="text"
                        value={form.storeName}
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                        placeholder=""
                    />
                )}

                {/* 주소 */}
                <InputField
                    label="우편번호"
                    type="text"
                    value={form.zipCode} // ✅ 정확한 key로
                    readOnly
                    onClear={null} // 필요 시 제거 또는 유지
                    placeholder="우편번호"
                />
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
                    <label style={{ width: '100px', fontSize: '14px', fontWeight: 'bold', color: '#111827', marginRight: '8px', textAlign: 'right' }}>
                        {user_type === 'seller' ? '스토어 주소' : '주소'}
                    </label>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                        <input
                            type="text"
                            value={form.street}
                            readOnly
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#edf3e9',
                                fontSize: '14px',
                                border: '1px solid #ccc',
                                marginRight: '8px',
                            }}
                        />
                        <button
                            type="button"
                            onClick={onOpenAddressModal}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #60a5fa',
                                color: '#2563eb',
                                borderRadius: '9999px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                background: '#f0f9ff',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            주소 찾기
                        </button>
                    </div>
                </div>

                {/* 상세 주소 */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
                    <label style={{ width: '100px', fontSize: '14px', fontWeight: 'bold', color: '#111827', marginRight: '8px', textAlign: 'right' }}>
                        상세 주소
                    </label>
                    <input
                        type="text"
                        value={form.detail}
                        onChange={(e) => setForm({ ...form, detail: e.target.value })}
                        placeholder="상세 주소를 입력해주세요"
                        style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                        }}
                    />
                </div>

                {user_type === 'seller' && (
                    <>
                        <InputField
                            label="사업자등록번호"
                            type="text"
                            value={form.business_number}
                            onChange={(e) => setForm({ ...form, business_number: e.target.value })}
                            placeholder="예: 123-45-67890"
                        />

                        <InputField
                            label="통신판매업신고번호"
                            type="text"
                            value={form.license_number}
                            onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                            placeholder="예: 제2025-서울강남-0001호"
                        />

                        <InputField
                            label="고객 응대 연락처"
                            type="tel"
                            value={form.contact}
                            onChange={(e) => setForm({ ...form, contact: e.target.value })}
                            placeholder="070-0000-0000"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
