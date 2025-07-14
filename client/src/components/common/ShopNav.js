import React from 'react';

export default function ShopNav() {
    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: '60px',
            backgroundColor: '#fff',
            justifyContent: 'space-between',
            fontFamily: 'Arial, sans-serif',
        }}>

      {/* 쇼핑페이지 상품 종류 카테고리바 */}
        <ul style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '20px',
            backgroundColor: '#B6D19B',
        }}>
            <li><button style={buttonStyle}>전체 상품</button></li>
            <li><button style={buttonStyle}>쌀,잡곡</button></li>
            <li><button style={buttonStyle}>채소,버섯</button></li>
            <li><button style={buttonStyle}>과일,견과</button></li>
            <li><button style={buttonStyle}>축산,축산가공</button></li>
            <li><button style={buttonStyle}>수산물</button></li>
            <li><button style={buttonStyle}>반찬,양념,가루</button></li>
            <li><button style={buttonStyle}>식사대용,간편식</button></li>
            <li><button style={buttonStyle}>간식,음료,유제품</button></li>
            <li><button style={buttonStyle}>건강,차</button></li>
        </ul>
        </nav>
    );
}

const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#49454F',
    padding: '6px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    outline: 'none',
};
