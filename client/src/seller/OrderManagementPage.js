import React from 'react';

export default function OrderManagementPage({ orderList = [] }) {
  return (
    <div style={{ padding: '24px' }}>
      {/* 타이틀 영역 */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '28px',       // 글씨 더 크게
            fontWeight: '800',      // 굵게
            margin: 0,              // 불필요한 여백 제거
            textAlign: 'left',      // 좌측 정렬
            color: '#1d1d1f'        // 진한 블랙톤
          }}
        >
          주문/배송 관리
        </h2>
      </div>

      {/* 테이블 */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '15px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        <thead style={{ backgroundColor: '#f0f4ed' }}>
          <tr>
            <th style={thStyle}>스마트배송</th>
            <th style={thStyle}>주문번호</th>
            <th style={thStyle}>구매자명</th>
            <th style={thStyle}>상품명</th>
            <th style={thStyle}>현재 상태</th>
            <th style={thStyle}>주문일</th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order, idx) => (
            <tr
              key={order.orderNo}
              style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}
            >
              <td style={tdStyle}>{order.smartDelivery}</td>
              <td style={tdStyle}>{order.orderNo}</td>
              <td style={tdStyle}>{order.buyer}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{order.product}</td>
              <td style={tdStyle}>{order.status}</td>
              <td style={tdStyle}>{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '12px 10px',
  borderBottom: '2px solid #ccc',
  textAlign: 'center',
  fontWeight: '600',
  color: '#333'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  textAlign: 'center',
  color: '#333'
};
