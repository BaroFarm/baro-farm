import React from 'react';

export default function BuyVoucherButton(){

    return(
        <button style={buttonstyle}>
            금액권구매
        </button>
    );
}

const buttonstyle = {
    background: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'black',
    padding: '8px, 16px',
    borderRadius: '10px',
    height: '30px',
    width: '80px',

}