import React, { useEffect, useState } from 'react';
import AddressChangeModal from '../modal/AddressChangeModal'; // 경로 맞춰주세요
import SearchAddressModal from '../modal/SearchAddressModal';

export default function OrdererInfo() {
    const [profile, setProfile] = useState({
        customer_id: 'uuid-1234-abcd-efgh',
        email: 'buyer@example.com',
        nickname: '홍길동',
        phone: '010-1234-5678',
        user_type: 'buyer',
        address: { zipCode: '03187', street: '서울특별시 종로구 세종대로 175', detail: '광화문빌딩 10층' },
        profile_image: '~'
    });

    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    // 주소 찾기 모달
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // 주소 변경 모달의 초기값을 부모가 보관(선택 주소 반영용)
    const [addrDraft, setAddrDraft] = useState({
        label: '기본 배송지',
        receiver: profile.nickname || '',
        phone: profile.phone || '',
        zipCode: profile.address?.zipCode || '',
        street: profile.address?.street || '',
        detail: profile.address?.detail || '',
        isDefault: true,
    });

    useEffect(() => {
        (async () => {
            try {
                const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
                const res = await fetch(`${BASE}/api/my/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                });
                if (!res.ok) return; // 시연용, 실패해도 로컬 더미 유지
                const json = await res.json();
                setProfile(json.data);
            } catch (err) {
                console.error('프로필 정보를 불러오지 못했습니다.', err);
            }
        })();
    }, []);
    // 프로필을 받아오면 드래프트도 동기화
    useEffect(() => {
        setAddrDraft((d) => ({
            ...d,
            receiver: profile.nickname || '',
            phone: profile.phone || '',
            zipCode: profile.address?.zipCode || '',
            street: profile.address?.street || '',
            detail: profile.address?.detail || '',
        }));
    }, [profile]);

    const handleSaveAddress = (payload) => {
        // 시연: 로컬만 갱신
        setProfile((prev) => ({
            ...prev,
            nickname: payload.receiver,
            phone: payload.phone,
            address: { zipCode: payload.zipCode, street: payload.street, detail: payload.detail },
        }));
    };

    // 실제론 여기서 서버에 PATCH:
    // await fetch(`${BASE}/api/my/address`, { method:'PATCH', body: JSON.stringify(payload) ... });


  // (선택) 주소찾기 눌렀을 때 호출 — 기존 PickupModal 재사용 가능
    // AddressChangeModal의 "주소 찾기" 버튼 콜백
    const openAddressSearch = () => setIsSearchOpen(true);

    if (!profile) return <div>로딩 중...</div>;

    return (
    <>
        <div style={{ backgroundColor:'#f9faf8', padding:'20px', borderRadius:'8px', marginBottom:'24px' }}>
            {/* 주문자명 줄 */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', flex:1, marginRight:'12px' }}>
                <label style={{ width:'100px', fontWeight:'bold' }}>주문자 명</label>
                <input
                    type="text"
                    value={profile.nickname}
                    readOnly
                    style={{ width:'200px', padding:'6px', marginRight:'8px', borderRadius:'4px', border:'1px solid #ccc' }}
                />
                <button
                    style={{ background:'#b6c8a8', border:'none', borderRadius:'20px', padding:'6px 12px', fontWeight:'bold' }}
                >
                    배송지
                </button>
            </div>
            <button
                style={{ background:'#B6D19B', border:'none', borderRadius:'20px', padding:'6px 16px', fontWeight:'bold', cursor:'pointer' }}
                onClick={() => setIsAddrModalOpen(true)}   // ← 여기서 모달 열기
            >
                변경
            </button>
        </div>

        {/* 주소 */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:'12px' }}>
            <label style={{ width:'100px', fontWeight:'bold' }}>주소</label>
            <input
                type="text"
                value={`${profile.address.street}, ${profile.address.detail}`}
                readOnly
                style={{ width:'400px', padding:'6px', borderRadius:'4px', border:'1px solid #ccc' }}
            />
        </div>

        {/* 전화번호 */}
        <div style={{ display:'flex', alignItems:'center' }}>
            <label style={{ width:'100px', fontWeight:'bold' }}>전화번호</label>
            <input
                type="text"
                value={profile.phone}
                readOnly
                style={{ width:'400px', padding:'6px', borderRadius:'4px', border:'1px solid #ccc' }}
            />
        </div>
    </div>

      {/* 배송 메모: textarea로 수정 (input type="textArea"는 유효하지 않음) */}
    <div style={{ backgroundColor:'#f9faf8', padding:'20px', borderRadius:'8px', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
            <label style={{ width:'100px', fontWeight:'bold' }}>배송 메모</label>
            <textarea
                placeholder="배송 요청 사항을 입력해주세요"
                rows={3}
                style={{ width:'400px', padding:'6px', borderRadius:'4px', border:'1px solid #ccc', resize:'vertical' }}
            />
        </div>
    </div>

      {/* 모달들은 트리의 끝에 하나씩만! */}
    <AddressChangeModal
        isOpen={isAddrModalOpen}
        onClose={() => setIsAddrModalOpen(false)}
        initial={addrDraft}
        onSave={handleSaveAddress}
        onOpenAddressSearch={openAddressSearch}
    />

    <SearchAddressModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(addr) => {
          // 선택한 주소를 드래프트에 반영 (받는 분/전화는 보존)
        setAddrDraft(d => ({
            ...d,
            zipCode: addr.postcode || '',
            street: addr.road || '',
            detail: d.detail || (addr.jibun ? `(${addr.jibun})` : ''),
        }));
        setIsSearchOpen(false);
        }}
        defaultCity=""
        defaultRoad=""
        defaultPage={1}
        defaultLimit={10}
    />
    </>
    );
}
