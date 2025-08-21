import React from 'react';
import { FaComments, FaUser } from 'react-icons/fa';

export default function InquirySection(){
    return(
        <div style={{
                backgroundColor: '#F9F9F9',
                borderRadius: '20px',
                padding: '24px'
            }}>
                <div style={{fontWeight: 'bold', fontSize:"18px", textAlign: 'Left'}}> 문의</div>
                
                <div style={{ display: 'flex', gap: '40px', margin: '25px', marginLeft: '100px'}}>
                {/* 직매장 소통 채널 */}
                    <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                        <FaComments size={36} />
                        <div>직매장 소통 채널</div>
                    </div>
    
                {/* 나의 문의 내역 */}
                    <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                        <FaUser size={36} />
                        <div>나의 문의 내역</div>
                    </div>
                </div>
            </div>
        );
}