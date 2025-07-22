import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm/SignupForm';
import SearchAddressModal from '../components/auth/SignupForm/SearchAddressModal';

export default function SignupSellerPage() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phoneNumber: '',
        zipCode: '',
        store_name: '',
        street: '',
        detail: '',
        business_number: '',
        license_number: '',
        contact: '',
        user_type: 'seller',
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
            phone: form.phoneNumber,       // 필드명 확인
            zip_code: form.zipCode,        // 필드명 확인
            street: form.street,
            detail: form.detail,
            store_name: form.store_name,
            business_number: form.business_number,
            license_number: form.license_number,
            contact: form.contact,
            user_type: form.user_type,
            status: '활성',
        };
        console.log("📦 payload", payload);


        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, payload);
            console.log('회원가입 성공:', res.data);
            navigate('/login');
        } catch (err) {
  alert("에러 발생");
  console.log("🔥 err:", err);

  if (err.response) {
    console.log("🔥 err.response.data:", err.response.data);
    console.log("🔥 상태 코드:", err.response.status);

    const { message, code } = err.response.data;
    if (code === 'DUPLICATE_EMAIL_OR_NICKNAME') {
      if (message.includes('닉네임')) {
        setErrors({ ...errors, nickname: message });
      } else {
        setErrors({ ...errors, email: message });
      }
    }
  } else {
    console.error("⚠️ 네트워크 또는 서버 미응답 오류");
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
            user_type={form.user_type}
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