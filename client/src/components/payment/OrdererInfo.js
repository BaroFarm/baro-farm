import React, {useEffect, useState} from 'react';

export default function OrdererInfo() {

    const [profile, setProfile] = useState({
        customer_id: 'uuid-1234-abcd-efgh',
        email: 'buyer@example.com',
        nickname: '홍길동',
        phone: '010-1234-5678',
        user_type: 'buyer',
        address: {
            zipCode: '03187',
            street: '서울특별시 종로구 세종대로 175',
            detail: '광화문빌딩 10층'
        },
        profile_image: '~'
    }); //예시 데이터 사용

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

    if (!profile) return <div>로딩 중...</div>;

    //주문 상품은 장바구니 먼저 연동 후 백 연동해야 할 듯...
    return (
        <>
        <div style={{
            backgroundColor: '#f9faf8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
        }}>
            {/* 주문자명 줄 전체 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                {/* 왼쪽: 라벨 + 입력 + 기본 배송지 버튼 */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '12px' }}>
                    <label style={{ width: '100px', fontWeight: 'bold' }}>주문자 명</label>
                    <input
                        type="text"
                        value={profile.nickname}
                        readOnly
                        style={{ width: '200px', padding: '6px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        style={{
                            backgroundColor: '#b6c8a8',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            cursor: 'default',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        기본 배송지
                    </button>
                </div>

                {/* 오른쪽: 변경 버튼 */}
                <button
                    style={{
                        backgroundColor: '#B6D19B',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    변경
                </button>
            </div>

            {/* 주소 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>주소</label>
                <input
                    type="text"
                    value={`${profile.address.street}, ${profile.address.detail}`}
                    readOnly
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            {/* 전화번호 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>전화번호</label>
                <input
                    type="text"
                    value={profile.phone}
                    readOnly
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
        </div>
        
        {/* 배송 메모 */}
        <div style={{
            backgroundColor: '#f9faf8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>배송 메모</label>
                <input
                    type="textArea"
                    placeholder="배송 요청 사항을 입력해주세요"
                    style={{ width: '400px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
        </div>
    </>
    );
}
