import React from 'react';

function DirectStoreInquiryPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '16px' }}>문의게시판</h2>

      {/* 카테고리 탭 */}
      <div style={{
        display: 'flex',
        background: '#E8F0E6',
        padding: '8px 0',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        {['전체', '상품 문의', '배송 문의', '환불 문의', '기타'].map((tab, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 0',
              cursor: 'pointer',
              borderRight: idx < 4 ? '1px solid #ccc' : 'none'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 나중에 추가 */}
      <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '16px' }}>
        나중에 추가
      </div>
    </div>
  );
}

export default DirectStoreInquiryPage;
