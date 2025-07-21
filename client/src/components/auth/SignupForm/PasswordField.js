import InputField from '../../form/InputField';

export default function PasswordField({ form, setForm, errors, setErrors }) {
    return (
    <>
        <InputField
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setErrors({ ...errors, password: '' });
            }}
            onClear={() => setForm({ ...form, password: '' })}
            placeholder="비밀번호를 입력해주세요"
        />
        <InputField
            label="비밀번호 확인"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                setErrors({ ...errors, password: '' });
            }}
            onClear={() => setForm({ ...form, confirmPassword: '' })}
            placeholder="다시 입력해주세요"
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
    </>
    );
}
