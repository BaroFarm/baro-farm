import React from 'react';

export default function PickupFarm({
  farmName,
  imageUrl,
  kioskAvailable = false, // 무인 수령함 지원 여부
  useKiosk = false,        // 현재 선택 상태
  onToggleKiosk,           // (checked:boolean) => void
}) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #cce4c1' }}>
      <div style={{ fontSize: '14px', marginBottom: '8px' }}>배송 직매장(농가)</div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#ddd',
            borderRadius: '4px',
            backgroundImage: `url(${imageUrl || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flex: '0 0 auto',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {/* 이름 + 체크박스 한 줄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 'bold' }}>{farmName}</div>

            {kioskAvailable && (
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  background: '#eef6e8',
                  color: '#3f6212',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!useKiosk}
                  onChange={(e) => onToggleKiosk?.(e.target.checked)}
                  aria-label="무인 수령함 사용"
                  style={{ width: 14, height: 14 }}
                />
                <span>무인 수령함 사용</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
