import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyProfile from '../components/mypage/MyProfile';
import OrderQueryBox from '../components/mypage/OrderQueryBox';
import MyListSection from '../components/mypage/MyListSection';
import InquirySection from '../components/mypage/InquirySection';

export default function BuyerMyPage(){
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [navigate]);
    
    return(
        <div>
            <MyProfile />
            <div style={{marginBottom: '15px'}}><OrderQueryBox /></div>
            <div style={{marginBottom: '15px'}}><MyListSection /></div>
            <div style={{marginBottom: '15px'}}><InquirySection /></div>
        </div>
    );
}