import React from 'react';

export default function PointUsage(){
    return(
        <div
            style={{
                marginBottom: '24px',
                marginTop: '24px',
                textAlign: 'left',
            }}
        >
      {/* 제목 */}
            <div style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '12px',
                marginLeft: '15px'
            }}>
                포인트 적용
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: '15px',
                    marginBottom: '12px'
                }}
            >
                <span>사용 가능 포인트 </span>
                <span>~원</span>
            </div>
            
            {/* 입력창 + 전액 사용 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '15px' }}>
        <input
          type="text"
          placeholder="0원"
          style={{
            width: '200px',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          style={{
            backgroundColor: '#B6D19B',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          전액 사용
        </button>
      </div>
    </div>
  );
}