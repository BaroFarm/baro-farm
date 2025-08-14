import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIbotButton from '../common/buttons/AIbotButton';
import default_Profile from '../../assets/default_profile.jpg';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctrl = new AbortController();

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`; // 토큰 있을 때만 헤더 추가

        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/my/profile`,
          { headers, cache: 'no-store', signal: ctrl.signal } // 304 회피 + abort
        );

        if (res.status === 304) return; // 변경 없음 → 기존 state 유지
        if (res.status === 401) {
          // 세션 만료/미인증
          localStorage.clear();
          setError('세션이 만료되었습니다. 다시 로그인해 주세요.');
          return;
        }
        if (!res.ok) throw new Error(`프로필 조회 실패 (${res.status})`);

        const json = await res.json();
        setProfile(json.data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || '네트워크 오류');
      }
    };

    fetchProfile();
    return () => ctrl.abort();
  }, []);

  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;
  if (!profile) return <div>로딩 중...</div>;

  const imgSrc =
    profile.profile_image && profile.profile_image !== '~'
      ? profile.profile_image
      : default_Profile; // ✅ 문자열 경로(번들된 asset)

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src={imgSrc}
          onError={(e) => { e.currentTarget.src = default_Profile; }} // ✅ 깨진 URL 폴백
          alt="프로필 이미지"
          style={{
            width: 80, height: 80, borderRadius: '50%',
            objectFit: 'cover', backgroundColor: '#ddd'
          }}
        />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {profile.nickname}
            <button
              onClick={() => navigate('/my/profile/edit', { state: { profile } })} // ⬅️ 수정 페이지로 이동(초기값 전달)
              style={{
                marginLeft: 20, background: 'none', border: 'none',
                padding: '6px 12px', cursor: 'pointer', fontSize: 14
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
