import React from 'react';

export default function AIbotButton({ onClick }){

    return(
        <button style={buttonstyle} onClick={onClick}>
            AI 챗봇
        </button>
    );
}

const buttonstyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'black',
    height: '30px',
    padding: '0 12px',
    borderRadius: '10px',
    width: '80px',
    lineHeight: 1,          // 베이스라인 보정
    boxSizing: 'border-box',

}