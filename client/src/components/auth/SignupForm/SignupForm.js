import React from 'react';
import InputField from '../../form/InputField';
import PasswordField from './PasswordField';


export default function SignupForm({ form, setForm, errors, setErrors }) {
    return (
    <>
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

        <PasswordField form={form} setForm={setForm} errors={errors} setErrors={setErrors} />

        <InputField
            label="닉네임"
            type="text"
            value={form.nickname}
            onChange={(e) => {
                setForm({ ...form, nickname: e.target.value });
                setErrors({ ...errors, nickname: '' }); // 필요 시 에러 초기화
            }}
            placeholder="닉네임을 입력해주세요"
            onClear={() => setForm({ ...form, nickname: '' })}
        />
        {errors.nickname && (
            <p className="text-sm text-red-500 mt-1">{errors.nickname}</p>
        )}

        <InputField
            label="전화번호"
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            placeholder="010-1234-5678"
            onClear={() => setForm({ ...form, phoneNumber: '' })}
        />
      {/* 닉네임, 전화번호, 이름, 주소 등도 여기서 추가 */}
    {/*<AddressFields form={form} setForm={setForm} /> */}
    </>
    );
}