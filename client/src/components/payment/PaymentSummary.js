import React from 'react';

export default function PaymentSummary() {
  return (
    <>
    <div
      style={{
        backgroundColor: '#f9faf8',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'left',
        marginBottom: '40px'
      }}
    >
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
            <span style={{ minWidth: '180px' }}>총 상품 금액</span>
            <span style={{ textAlign: 'left', flex: 1 }}>30,000원</span>
        </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
        <span style={{ minWidth: '180px' }}>배송비</span>
        <span style={{ textAlign: 'left', flex: 1 }}>3,000원</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
        <span style={{ minWidth: '180px' }}>쿠폰 할인 금액</span>
        <span style={{ textAlign: 'left', flex: 1 }}>-0원</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
        <span style={{ minWidth: '180px' }}>포인트 할인 금액</span>
        <span style={{ textAlign: 'left', flex: 1 }}>-0원</span>
      </div>

      {/* 최종 결제 금액 */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
        <span style={{ minWidth: '180px' }}>최종 결제 금액</span>
        <span style={{ textAlign: 'left', flex: 1 }}>~~~ 원</span>
      </div>

      {/* 결제 수단 설명 */}
      <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        결제 수단<br />
        <span style={{ fontWeight: 'normal' }}>(아직 정해지지 않음)</span>
      </div>
    </div>
    {/* 결제 버튼 */}
      <div style={{ textAlign: 'center' }}>
        <button
          style={{
            backgroundColor: '#B6D19B',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          결제하기
        </button>
      </div>
      </>
  );
}
