import React from 'react';
import MyProfile from '../components/mypage/MyProfile';
import OrderQueryBox from '../components/mypage/OrderQueryBox';

export default function BuyerMyPage(){
    return(
        <div>
            <MyProfile />
            <OrderQueryBox />
        </div>
    );
}