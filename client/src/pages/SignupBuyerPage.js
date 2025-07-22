import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm/SignupForm';
import SearchAddressModal from '../components/auth/SignupForm/SearchAddressModal';

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (form.password !== form.confirmPassword) {
            setErrors({ ...errors, password: '비밀번호가 일치하지 않습니다.' });
            return;
        }
        const payload = {
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            name: form.name,               // 필수!
            nickname: form.nickname,
            phone: form.phoneNumber,       // 필드명 확인
            zip_code: form.zipCode,        // 필드명 확인
            street: form.street,
            detail: form.detail,
            user_type: form.user_type,
            status: '활성',
        };
        

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, payload);
            console.log('회원가입 성공:', res.data);
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message;

            if (errorMessage?.includes('이메일')) {
                setErrors((prev) => ({ ...prev, email: errorMessage }));
            } else if (errorMessage?.includes('닉네임')) {
                setErrors((prev) => ({ ...prev, nickname: errorMessage }));
            } else if (errorMessage?.includes('비밀번호')) {
                setErrors((prev) => ({ ...prev, password: errorMessage }));
            } else {
                console.error('알 수 없는 에러:', err.response?.data || err.message);
            }
        }
    };

    const handleCompletePost = (data) => {
        const fullAddress = data.address;
        const zoneCode = data.zonecode;

        setForm(prev => ({
            ...prev,
            zipCode: zoneCode,
            street: fullAddress,
        }));
        setIsModalOpen(false); // 모달 닫기
    };


return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-6">
        <img src="/logo.svg" alt="로고" style={{ width: '100px', height: '100px', margin: '0 auto', display: 'block' }} />

        <SignupForm
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            onOpenAddressModal={() => setIsModalOpen(true)}
        />

        <SearchAddressModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCompletePost={handleCompletePost}
        />

        <div className="flex justify-center mt-4">
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
        </div>
    </div>
    );

}