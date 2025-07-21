import React, {useState} from 'react';
import axios from 'axios';
import SignupForm from '../components/auth/SignupForm/SignupForm';


export default function SignupBuyerPage() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        nickname: '',
        phoneNumber: '',
        zipCode: '',
        street: '',
        detail: '',
        user_type: 'buyer',
    }); 
    const [errors, setErrors] = useState({
        email: '', password: '', nickname:'', });

    const handleSignup = async () => {
        if (form.password !== form.confirmPassword) {
            setErrors({ ...errors, password: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, form);
            console.log('회원가입 성공:', res.data);
        } catch (err) {
            const error = err.response?.data?.error;
            if (error?.code === 'DUPLICATE_EMAIL_OR_NICKNAME') {
                if (error.message.includes('닉네임')) {
                    setErrors({ ...errors, nickname: error.message });
                } else {
                    setErrors({ ...errors, email: error.message });
                }
            }
        }
    };


    return(
        <div>
            <h2>구매 회원가입</h2>
                <SignupForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />


             {/* 가입하기 버튼 */}
            <button
                onClick={handleSignup}
                style={{
                    backgroundColor: '#B6D19B',
                    color: 'black',
                    borderRadius: '9999px',
                    padding: '10px 30px',
                    fontWeight: '500',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',

                }}
            >
                등록
            </button>
            </div>

    );
}