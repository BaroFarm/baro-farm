import React from 'react';
import MyProfile from '../components/mypage/MyProfile';
import OrderQueryBox from '../components/mypage/OrderQueryBox';
import MyListSection from '../components/mypage/MyListSection';
import InquirySection from '../components/mypage/InquirySection';

export default function BuyerMyPage(){
    return(
        <div>
            <MyProfile />
            <div style={{marginBottom: '15px'}}><OrderQueryBox /></div>
            <div style={{marginBottom: '15px'}}><MyListSection /></div>
            <div style={{marginBottom: '15px'}}><InquirySection /></div>
        </div>
    );
}