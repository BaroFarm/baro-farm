import React, { useEffect, useRef, useState } from 'react';
import './PasswordModal.css';

export default function PasswordModal({
  isOpen,
  onClose = () => {},
  onSubmit = async () => {},
  saving = false,
  serverError = '',
  requireCurrent = false, // 정책 정해지면 true로만 바꾸면 됨
  minLen = 8,
}) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [localErr, setLocalErr] = useState('');
  const firstRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ current_password: '', new_password: '', confirm: '' });
    setLocalErr('');
    setTimeout(() => firstRef.current?.focus(), 0);

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    if (requireCurrent && !form.current_password) return '현재 비밀번호를 입력하세요.';
    if (!form.new_password) return '새 비밀번호를 입력하세요.';
    if (form.new_password.length < minLen) return `새 비밀번호는 최소 ${minLen}자 이상이어야 합니다.`;
    if (form.new_password !== form.confirm) return '새 비밀번호와 확인이 일치하지 않습니다.';
    return '';
  };

  const canSubmit = !saving && !validate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setLocalErr(msg); return; }
    try {
      await onSubmit(form);
    } catch (err) {
      setLocalErr(err?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="pm-overlay" role="dialog" aria-modal="true" onClick={(e)=>{ if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-modal" onClick={(e)=>e.stopPropagation()}>
        <button className="pm-close" aria-label="닫기" onClick={onClose}>×</button>
        <h2 className="pm-title">비밀번호 변경</h2>

        <form className="pm-form" onSubmit={handleSubmit}>
          {requireCurrent && (
            <label className="pm-field">
              <span className="pm-label">현재 비밀번호</span>
              <input
                ref={firstRef}
                type="password"
                autoComplete="current-password"
                value={form.current_password}
                onChange={(e)=>setForm(f=>({...f, current_password: e.target.value}))}
              />
            </label>
          )}

          {!requireCurrent && (
            <label className="pm-field">
              <span className="pm-label">새 비밀번호</span>
              <input
                ref={firstRef}
                type="password"
                autoComplete="new-password"
                value={form.new_password}
                onChange={(e)=>setForm(f=>({...f, new_password: e.target.value}))}
              />
            </label>
          )}

          {requireCurrent && (
            <label className="pm-field">
              <span className="pm-label">새 비밀번호</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.new_password}
                onChange={(e)=>setForm(f=>({...f, new_password: e.target.value}))}
              />
            </label>
          )}

          <label className="pm-field">
            <span className="pm-label">새 비밀번호 확인</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e)=>setForm(f=>({...f, confirm: e.target.value}))}
            />
          </label>

          {(localErr || serverError) && <div className="pm-error">{localErr || serverError}</div>}

          <div className="pm-actions">
            <div className="pm-col">
                <button type="button" className="pm-secondary" onClick={onClose} disabled={saving}>
                    취소
                </button>
            </div>
            <div className="pm-col">
                <button type="submit" className="pm-primary" disabled={!canSubmit}>
                    {saving ? '변경 중…' : '변경'}
                </button>
            </div>
        </div>
        </form>
      </div>
    </div>
  );
}
