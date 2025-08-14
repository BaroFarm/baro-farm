import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initial = useMemo(() => state?.profile ?? null, [state]);

  const [loading, setLoading] = useState(!initial); // 초기값 없으면 로딩해서 GET
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nickname: '',
    phone: '',
    zip_code: '',
    street: '',
    detail: '',
  });
  const [origin, setOrigin] = useState(null);

  // initial 이 없으면 한번 더 프로필 GET
  useEffect(() => {
    const ctrl = new AbortController();

    const ensureProfile = async () => {
      if (initial) {
        setForm(pickEditable(initial));
        setOrigin(pickEditable(initial));
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/my/profile`, {
          headers, cache: 'no-store', signal: ctrl.signal,
        });
        if (res.status === 401) {
          localStorage.clear();
          setError('세션이 만료되었습니다. 다시 로그인해 주세요.');
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`프로필 조회 실패 (${res.status})`);
        const json = await res.json();
        setForm(pickEditable(json.data));
        setOrigin(pickEditable(json.data));
        setLoading(false);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message || '네트워크 오류');
          setLoading(false);
        }
      }
    };

    ensureProfile();
    return () => ctrl.abort();
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const buildPatchBody = () => {
    const body = {};
    for (const k of Object.keys(form)) {
      if ((origin?.[k] ?? '') !== (form[k] ?? '')) body[k] = form[k];
    }
    return body;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const patchBody = buildPatchBody();
    if (Object.keys(patchBody).length === 0) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/my/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(patchBody),
      });

      if (res.status === 401) {
        localStorage.clear();
        alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`수정 실패 (${res.status}) ${t}`);
      }

      // 성공: 프로필 페이지로 이동하면 새로 GET 하면서 반영됨
      alert('프로필이 수정되었습니다.');
      navigate('/my/profile', { replace: true });
    } catch (e2) {
      alert(e2.message || '네트워크 오류');
    }
  };

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>프로필 수정</h2>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <Field label="닉네임">
          <input name="nickname" value={form.nickname} onChange={onChange} required />
        </Field>

        <Field label="전화번호">
          <input name="phone" value={form.phone} onChange={onChange} placeholder="010-0000-0000" />
        </Field>

        <Field label="우편번호">
          <input name="zip_code" value={form.zip_code} onChange={onChange} />
        </Field>

        <Field label="도로명 주소">
          <input name="street" value={form.street} onChange={onChange} />
        </Field>

        <Field label="상세 주소">
          <input name="detail" value={form.detail} onChange={onChange} />
        </Field>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => navigate('/mypage/buyer', { replace: true })}
                  style={btn('outline')}>취소</button>
          <button type="submit" style={btn('solid')}>저장</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- 작은 유틸/프레젠테이션 컴포넌트 ---------- */
const pickEditable = (p) => ({
  nickname: p?.nickname ?? '',
  phone: p?.phone ?? '',
  zip_code: p?.zip_code ?? '',
  street: p?.street ?? '',
  detail: p?.detail ?? '',
});

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
      <div style={{
        border: '1px solid #ccc', borderRadius: 8, padding: '10px 12px'
      }}>
        {children}
      </div>
    </label>
  );
}

const btn = (variant) =>
  variant === 'solid'
    ? { flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }
    : { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #aaa', background: 'white', cursor: 'pointer' };
