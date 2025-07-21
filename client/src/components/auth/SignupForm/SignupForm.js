import React from 'react';
import InputField from '../../form/InputField';
import PasswordField from './PasswordField';


export default function SignupForm({ form, setForm, errors, setErrors, onOpenAddressModal }) {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-md space-y-3 px-4">
                {/* 이메일 */}
                <InputField
                    label="이메일"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        setErrors({ ...errors, email: '' });
                    }}
                    onClear={() => setForm({ ...form, email: '' })}
                    placeholder="example@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

                {/* 비밀번호 */}
                <PasswordField form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
                
                <InputField
                    label="이름"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="이름을 입력해주세요"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                
                {/* 닉네임 */}
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
                {errors.nickname && <p className="text-sm text-red-500 mt-1">{errors.nickname}</p>}

                {/* 전화번호 */}
                <InputField
                    label="전화번호"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="010-1234-5678"
                    onClear={() => setForm({ ...form, phoneNumber: '' })}
                />
            
                <div className="flex items-center gap-2">
                {/* 주소 필드 + 주소 찾기 버튼 수평 정렬 */}
                    <div className="w-full" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* 라벨 */}
                            <label
                                style={{
                                    minWidth: '64px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#111827',
                                    whiteSpace: 'nowrap',
                                    marginRight: '8px',
                                }}
                            >
                                주소
                            </label>

                {/* input + 버튼 */}
                            <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                                <input
                                    type="text"
                                    value={form.street}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        maxWidth: '300px',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        backgroundColor: '#edf3e9',
                                        fontSize: '14px',
                                        border: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={onOpenAddressModal}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        padding: '8px 12px',
                                        border: '1px solid #60a5fa', 
                                        color: '#2563eb',
                                        borderRadius: '9999px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        background: '#f0f9ff',
                                    }}
                                >
                                    주소 찾기
                                </button>
                            </div>
                        </div>
                    </div>
                {/* 상세 주소 입력 */}
                <InputField
                    label="상세 주소"
                    type="text"
                    value={form.detail}
                    onChange={(e) => setForm({ ...form, detail: e.target.value })}
                    placeholder="상세 주소를 입력해주세요"
                />
            </div>
        </div>
        </div>
    );
}