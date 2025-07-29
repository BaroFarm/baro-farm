import React from 'react';
import { FaTruck, FaUndoAlt } from 'react-icons/fa';

export default function OrderQueryBox(){
    return(
        <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '20px',
            padding: '24px'
        }}>
            <div style={{fontWeight: 'bold', fontSize:"18px", textAlign: 'Left'}}> 주문 관련 정보 조회</div>
            
            <div style={{ display: 'flex', gap: '40px', margin: '25px', marginLeft: '100px'}}>
            {/* 주문/배송 조회 */}
                <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <FaTruck size={36} />
                    <div>주문/배송 조회</div>
                </div>

            {/* 취소/반품/환불 내역 */}
                <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <FaUndoAlt size={36} />
                    <div>취소/반품/환불 내역</div>
                </div>
            </div>
        </div>
    );
}