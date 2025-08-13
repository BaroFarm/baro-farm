// src/pages/buyer/BuyerVouchersPage.jsx
import React from 'react';
import Header from '../../components/Header';
import NavBar from '../../components/NavBar';

const vouchers = [
  {
    id: 1,
    image: '/images/veggie-voucher.jpg',
    title: '웅이네 채소 금액권',
    subtitle: '웅이네 채소',
    expire: '~2025.05.31 까지',
    amount: '사용 가능 금액',
    refund: '환불 가능 기간',
  },
  {
    id: 2,
    image: '/images/barofarm-voucher.jpg',
    title: '바로팜 금액권',
    subtitle: '바로팜',
    expire: '~2025.05.31 까지',
    amount: '사용 가능 금액',
    refund: '환불 가능 기간',
  },
  {
    id: 3,
    image: '/images/default-voucher.jpg',
    title: '금액권 명',
    subtitle: '금액권 사용 가능처',
    expire: '~2025.05.31 까지',
    amount: '사용 가능 금액',
    refund: '환불 가능 기간',
  },
];

function BuyerVouchersPage() {
  return (
    <>
      <Header />
      <NavBar />
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '20px' }}>나의 금액권</h2>
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #ddd',
              padding: '15px 0',
            }}
          >
            <img
              src={voucher.image}
              alt={voucher.title}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                marginRight: '15px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{voucher.title}</div>
              <div style={{ color: '#777', fontSize: '14px' }}>{voucher.subtitle}</div>
              <div style={{ color: '#777', fontSize: '12px' }}>{voucher.expire}</div>
            </div>
            <div style={{ marginRight: '15px', color: 'red' }}>{voucher.amount}</div>
            <div style={{ marginRight: '15px', fontSize: '14px', color: 'red' }}>{voucher.refund}</div>
            <button style={styles.tag}>사용 이력</button>
            <button style={styles.tag}>환불 요청</button>
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
  tag: {
    backgroundColor: '#A7C4A0',
    border: 'none',
    borderRadius: '15px',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '5px',
  },
};

export default BuyerVouchersPage;
