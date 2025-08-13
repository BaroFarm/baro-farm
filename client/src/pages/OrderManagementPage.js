import React from 'react';

export default function OrderManagementPage({ orderList }) {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>주문/배송 관리</h2>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '15px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
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
            <tr key={order.orderNo} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
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
