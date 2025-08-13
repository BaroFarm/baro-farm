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
    padding: '20px',
  },
};

export default Layout;
