import React, { useEffect, useState } from 'react';

export default function AddressChangeModal({
    isOpen,
    onClose,
    initial = {
        label: '기본 배송지',
        receiver: '',
        phone: '',
        zipCode: '',
        street: '',
        detail: '',
        isDefault: true,
    },
    onSave,             // (payload) => void
    onOpenAddressSearch // (optional) 주소찾기 모달/페이지 여는 콜백
}) {
    const [form, setForm] = useState(initial);

    useEffect(() => { setForm(initial); }, [initial]);

    if (!isOpen) return null;

    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        // 간단 유효성 검사
        if (!form.receiver?.trim()) return alert('받으실 분을 입력해주세요.');
        if (!form.phone?.trim())    return alert('전화번호를 입력해주세요.');
        if (!form.street?.trim())   return alert('주소를 입력해주세요.');
        onSave?.(form);
        onClose?.();
    };

    return (
    <div style={overlay}>
        <div style={modal} onClick={(e) => e.stopPropagation()}>
        <button style={close} onClick={onClose} aria-label="닫기">✕</button>

        <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>배송지 변경</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>정확하게 입력해주세요.</p>

        <form onSubmit={handleSubmit}>
            <Label>배송지 명</Label>
            <Input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="예: 집, 회사" />

            <Label>받으실 분 *</Label>
            <Input value={form.receiver} onChange={(e) => set('receiver', e.target.value)} required placeholder="홍길동" />

            <Label>전화번호 *</Label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="010-0000-0000" />

            <Label>주소 *</Label>
            <div style={{ display: 'flex', gap: 8 }}>
                <Input value={form.street} onChange={(e) => set('street', e.target.value)} required placeholder="도로명 주소" style={{ flex: 1 }} />
                <button type="button" style={btnSub} onClick={onOpenAddressSearch}>주소 찾기</button>
            </div>
            <Input value={form.detail} onChange={(e) => set('detail', e.target.value)} placeholder="상세주소" />

            <div style={{ marginTop: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
                    기본 배송지로 설정
                </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button type="button" style={btnGhost} onClick={onClose}>취소</button>
                <button type="submit" style={btnPrimary}>확인</button>
            </div>
        </form>
        </div>
    </div>
    );
}

// 작은 프리미티브들
const Label = (p) => <div style={{ fontSize: 12, color: '#555', margin: '10px 0 6px' }} {...p} />;
const Input = ({ style, ...rest }) => (
    <input
        {...rest}
        style={{
        width: 'calc(100% - 20px)', padding: '10px 12px', borderRadius: 8,
        border: '1px solid #ddd', outline: 'none', ...style
    }}
    />
);

// styles
const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
};
const modal = {
    background: '#fff', width: 520, borderRadius: 12, padding: 20, position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};
const close = {
    position: 'absolute', top: 10, right: 12, border: 'none', background: 'transparent',
    fontSize: 18, cursor: 'pointer'
};
const btnPrimary = {
    background: '#B6D19B', border: 'none', borderRadius: 24, padding: '10px 24px',
    fontWeight: 'bold', cursor: 'pointer'
};
const btnGhost = {
    background: '#eee', border: 'none', borderRadius: 24, padding: '10px 24px', cursor: 'pointer'
};
const btnSub = {
    background: '#dfe9d6', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', whiteSpace: 'nowrap'
};
