import React from 'react';

export default function Logo() {
    return (
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            
            <img src="/logo.svg" alt="바로팜 로고" style={{ height: '100px', marginTop: '5px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '30px', marginLeft: '0px', padding: '0' }}>바로팜</span>
        </div>
    );
}