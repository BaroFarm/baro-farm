// src/seller/SellerLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../seller/NavBar';
import Header from '../common/Header';

export default function SellerLayout() {
    return (
    <>
        <Header />
        <NavBar />
        <main>
            <Outlet />
        </main>
    </>
    );
}
