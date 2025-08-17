import React from 'react';

const tabs = ['스마트 배송', '바로 찾음'];

export default function CartNav({ selectedTab, onSelectTab }){
    return(
        <nav style={navStyle}>
            <ul style={ulStyle}>
                {tabs.map((label) => (
                    <li key={label}>
                        <button
                            onClick={() => onSelectTab(label)}
                            style={{
                                ...buttonStyle,
                                ...(selectedTab === label ? selectedButtonStyle : {}),
                            }}
                        >
                            {label} (숫자)
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
const navStyle = {
    borderBottom: '1px solid #ccc',
    maxWidth: '1152px',
    margin: '20px auto 0 auto',
};

const ulStyle = {
    display: 'flex',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    gap: '70px',
};


const buttonStyle = {
    width: '100%',
    padding: '16px 0',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    fontWeight: 'normal',
    backgroundColor: 'white',
};

const selectedButtonStyle = {
    fontWeight: 'bold',
    borderBottom: '3px solid #8DA291', // 선택된 탭 밑줄 강조
    backgroundColor: 'white'
};
