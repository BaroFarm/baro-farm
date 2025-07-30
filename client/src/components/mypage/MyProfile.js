import React, { useEffect, useState } from 'react';
import AIbotButton from '../common/buttons/AIbotButton';

// const mockProfile = {
//     customer_id: "uuid-1234-abcd-efgh",
//     email: "buyer@example.com",
//     nickname: "닉네임",
//     phone: "010-1234-5678",
//     user_type: "buyer",
//     address: {
//         zipCode: "03187",
//         street: "서울특별시 종로구 세종대로 175",
//         detail: "광화문빌딩 10층"
//     },
//     profile_image: "~" // 실제 이미지 URL로 교체 가능
// };


export default function MyProfile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/my/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                const json = await res.json();
                setProfile(json.data);
            } catch (err) {
                console.error('프로필 정보를 불러오지 못했습니다.', err);
            }
        };

        fetchProfile();
    }, []);
//     useEffect(() => {
//   // 실제 fetch 대신 mock 데이터로 테스트
//         setTimeout(() => {
//             setProfile(mockProfile);
//         }, 300);
//     }, []);

    if (!profile) return <div>로딩 중...</div>;

    return (
        <div style={{
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid gray' 
        }}>
        {/* 왼쪽: 프로필 이미지 + 닉네임 + 수정 버튼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', }}>
                <img
                    src={profile.profile_image && profile.profile_image !== '~' 
                        ? profile.profile_image 
                        : '/default_profile.png'}
                    alt="프로필 이미지"
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        backgroundColor: '#ddd',
                    }}
                />
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{profile.nickname}
                        <button
                            style={{
                                marginLeft: '20px',
                                background: 'none',
                                border: 'none',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            프로필 수정
                        </button>
                    </div>
                </div>
            </div>

            {/* 오른쪽: AI 챗봇 링크 자리 */}
            <div><AIbotButton /></div>
        </div>
    );
}
