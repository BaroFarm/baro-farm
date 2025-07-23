// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import NavBar from './NavBar';

function Layout({ children }) {
  return (
    <>
      <Header />
      <NavBar />
      <div style={styles.wrapper}>{children}</div>
    </>
  );
}

const styles = {
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
};

export default Layout;
