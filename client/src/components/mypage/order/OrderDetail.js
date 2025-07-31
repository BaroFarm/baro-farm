import React, {useState,useEffect} from 'react';
import SearchBar from './SearchBar';
import OrderDetailCard from './OrderDetailCard';

export default function OrderDetail(){
    return(
        <div style={{ padding: '48px' }}>
            <div style={{ fontWeight:'bold', fontSize:'22px', textAlign:'left',borderBottom: '1px solid gray',lineHeight: '2.5',
                }}>주문 상세</div>

            
                <div style={{ color: 'gray', marginTop: '12px', fontSize: '14px' }}>
                    주문 내역이 없어 테스트 용으로 임시 데이터를 사용합니다.
                </div>
        
            <SearchBar />
            <OrderDetailCard />

        </div>
    );
}