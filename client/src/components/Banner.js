// src/components/Banner.jsx
import React from 'react';

function Banner() {
  return (
    <div style={styles.banner}>
      <p style={styles.text}>[ 메인 배너 영역입니다 ]</p>
    </div>
  );
}

const styles = {
  banner: {
    width: '100%',
    height: '220px',
    backgroundColor: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
    borderRadius: '8px',
  },
  text: {
    fontSize: '18px',
    color: '#555',
  },
};

export default Banner;
