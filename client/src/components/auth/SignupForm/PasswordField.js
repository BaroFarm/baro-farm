import InputField from '../../form/InputField';

export default function PasswordField({ form, setForm, errors, setErrors }) {
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setForm({ ...form, password });

        // 비밀번호 유효성 검사 등 추가 가능
        setErrors({ ...errors, password: '' });
    };

    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        setForm({ ...form, confirmPassword });

        if (form.password && confirmPassword !== form.password) {
            setErrors({ ...errors, confirmPassword: '비밀번호가 일치하지 않습니다.' });
        } else {
            setErrors({ ...errors, confirmPassword: '' });
        }
    };
    
    return (
    <>
        <InputField
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={handlePasswordChange}
            onClear={() => setForm({ ...form, password: '' })}
            placeholder="비밀번호를 입력해주세요"
        />
        {errors.password && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors.password}</p>}

        <InputField
            label="비밀번호 확인"
            type="password"
            value={form.confirmPassword}
            onChange={handleConfirmPasswordChange}
            onClear={() => setForm({ ...form, confirmPassword: '' })}
            placeholder=""
        />
        {errors.confirmPassword && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors.confirmPassword}</p>}
    </>
    );
}
