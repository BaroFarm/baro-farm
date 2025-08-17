// src/pages/MemberInfoPage.jsx
import React, { useEffect, useState } from 'react';
import { getSeller, patchSeller } from '../api/seller';

export default function MemberInfoPage() {
  const [seller, setSeller] = useState(null);      // 조회 결과
  const [form, setForm] = useState(null);          // 편집용 폼 상태
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('idle');    // idle | loading | saving | success | error
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token'); 
  const storeId = localStorage.getItem('store_id');

  // 초기 조회
  useEffect(() => {
    async function run() {
      if (!token) {
        setError('로그인이 필요합니다.');
        setStatus('error');
        return;
      }
      if (!storeId) {
        setError('store_id가 없습니다.');
        setStatus('error');
        return;
      }
      setStatus('loading');
      try {
        const res = await getSeller(storeId, token);
        const data = res.data?.data || {};
        setSeller(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          contact: data.contact || '',
          license_number: data.license_number || '',
        });
        setStatus('idle');
      } catch (err) {
        const payload = err.response?.data;
        if (payload?.code === 401) setError('판매자를 찾을 수 없습니다.');
        else if (payload?.code === 500) setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        else setError(payload?.message || '판매자 정보를 불러오지 못했습니다.');
        setStatus('error');
      }
    }
    run();
  }, [token, storeId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onCancel = () => {
    // 폼을 원래 데이터로 롤백
    setForm({
      name: seller?.name || '',
      email: seller?.email || '',
      phone: seller?.phone || '',
      contact: seller?.contact || '',
      license_number: seller?.license_number || '',
    });
    setEditing(false);
  };

  const validate = () => {
    // 최소 유효성 검사 (필요에 맞게 강화 가능)
    if (!form.name?.trim()) return '이름을 입력하세요.';
    if (!form.email?.trim()) return '이메일을 입력하세요.';
    return '';
  };

  const onSave = async () => {
    const msg = validate();
    if (msg) {
      alert(msg);
      return;
    }

    setStatus('saving');
    setError('');

    // 명세 기반 PATCH: 변경 필드만 보낼 수 있지만, 단순화를 위해 현재 폼 전체 전송
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      contact: form.contact,
      license_number: form.license_number,
      // ❌ password 절대 전송/표시 금지
    };

    try {
      const res = await patchSeller(payload, token);
      const updated = res.data?.data || payload;

      // 화면 동기화
      setSeller(updated);
      setForm({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || '',
        contact: updated.contact || '',
        license_number: updated.license_number || '',
      });
      setEditing(false);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 800);
    } catch (err) {
      const payload = err.response?.data;
      if (payload?.code === 401) setError('판매자 정보 변경에 실패했습니다.');
      else if (payload?.code === 500) setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      else setError(payload?.message || '저장에 실패했습니다.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div style={{ padding: 32 }}>불러오는 중…</div>;
  }
  if (status === 'error') {
    return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9fbf7', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>회원 정보</h2>

      {/* 상단 사용자 정보 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '28px' }}>👤</div>
        <span style={{ fontWeight: 'bold' }}>{seller?.name || '-'}</span>
        <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#555' }}>신원 인증</span>
        <span style={{ marginLeft: '6px', width: '16px', height: '16px', backgroundColor: '#246bfd', borderRadius: '50%', display: 'inline-block' }} />
      </div>

      {/* 폼 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '16px', columnGap: '16px' }}>
        <label>회원 유형</label>
        <span style={{ backgroundColor: '#d8e8ca', borderRadius: '8px', padding: '4px 10px', fontSize: '14px', display: 'inline-block' }}>판매자</span>

        <label>이름</label>
        <input
          name="name"
          type="text"
          value={form?.name || ''}
          onChange={onChange}
          readOnly={!editing}
          style={inputStyle(editing)}
        />

        <label>이메일</label>
        <input
          name="email"
          type="email"
          value={form?.email || ''}
          onChange={onChange}
          readOnly={!editing}
          style={inputStyle(editing)}
        />

        <label>비밀번호</label>
        <button style={greenButtonStyle} onClick={() => alert('비밀번호 변경은 별도 화면에서 처리해주세요.')}>
          비밀번호 변경
        </button>

        <label>전화번호</label>
        <input
          name="phone"
          type="text"
          value={form?.phone || ''}
          onChange={onChange}
          readOnly={!editing}
          style={inputStyle(editing)}
          placeholder="010-1234-5678"
        />

        <div style={{ gridColumn: '1 / 3', height: '1px', backgroundColor: '#ccc', margin: '8px 0' }} />

        <label>상호명</label>
        <input
          type="text"
          placeholder="응애네 채소"
          style={inputStyle(false)}
          readOnly
        />

        <label>스토어 주소</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="경기도 가평시 ○○○"
            style={{ ...inputStyle(false), flex: 1 }}
            readOnly
          />
          <button style={greenButtonStyle} disabled>검색</button>
        </div>

        <label>통신판매번호</label>
        <input
          name="license_number"
          type="text"
          value={form?.license_number || ''}
          onChange={onChange}
          readOnly={!editing}
          style={inputStyle(editing)}
          placeholder="123-45-67890"
        />

        <label>고객 응대 연락처</label>
        <input
          name="contact"
          type="text"
          value={form?.contact || ''}
          onChange={onChange}
          readOnly={!editing}
          style={inputStyle(editing)}
          placeholder="031-123-1234"
        />
      </div>

      {/* 하단 버튼 */}
      <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!editing ? (
          <>
            <button style={grayButtonStyle} onClick={() => window.history.back()}>뒤로</button>
            <button style={greenButtonStyle} onClick={() => setEditing(true)}>수정</button>
          </>
        ) : (
          <>
            <button style={grayButtonStyle} onClick={onCancel}>취소</button>
            <button
              style={{ ...greenButtonStyle, opacity: status === 'saving' ? 0.7 : 1 }}
              onClick={onSave}
              disabled={status === 'saving'}
            >
              {status === 'saving' ? '저장 중…' : '저장'}
            </button>
          </>
        )}
      </div>

      {/* 저장 성공 피드백 */}
      {status === 'success' && (
        <div style={{ marginTop: 12, textAlign: 'center', color: '#2f7a2f' }}>저장되었습니다.</div>
      )}

      {/* 에러 피드백 */}
      {status === 'error' && error && (
        <div style={{ marginTop: 12, textAlign: 'center', color: '#cf1322' }}>{error}</div>
      )}
    </div>
  );
}

const inputStyle = (editing) => ({
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '14px',
  width: '100%',
  backgroundColor: editing ? '#fff' : '#f5f5f5'
});

const greenButtonStyle = {
  backgroundColor: '#d8e8ca',
  border: 'none',
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '14px',
  cursor: 'pointer'
};

const grayButtonStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '14px',
  cursor: 'pointer'
};
