import React, {useState} from 'react';
import BuyVoucherButton from './buttons/BuyVoucherButton';
import AIbotButton from './buttons/AIbotButton';

export default function ShopNav() {
    const [selectedCategory, setSelectedCategory] = useState('전체 상품');

    const handleCategoryClick = (label) => {
        setSelectedCategory(label);
        // 👉 필요하다면 props로 상위에 전달하거나 페이지 이동도 여기서 처리 가능
    };

    const categories = [
        '전체 상품', '쌀,잡곡', '채소,버섯', '과일,견과', '축산,축산가공',
        '수산물', '반찬,양념,가루', '식사대용,간편식', '간식,음료,유제품', '건강,차'
    ];

    return (
        <nav
            style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '45px',
            backgroundColor: '#B6D19B',
            padding: '0 24px',
            fontFamily: 'Arial, sans-serif',
            marginTop: '-15px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box',
        }}
        >
      {/* 왼쪽: 카테고리 리스트 */}
        <ul
            style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '16px',
            flex: 1,
            alignItems: 'center',
            }}
        >
        {categories.map((label, idx) => (
                    <li key={idx}>
                        <button
                            style={{
                                ...buttonStyle,
                                fontWeight: selectedCategory === label ? 'bold' : 'normal',
                                color: selectedCategory === label ? '#black' : '#49454F',
                            }}
                            onClick={() => handleCategoryClick(label)}
                        >
                            {label}
                        </button>
                    </li>
                ))}
            </ul>

      {/* 오른쪽: 버튼 두 개 */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <BuyVoucherButton />
            <AIbotButton />
        </div>
    </nav>
    );
}

const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#49454F',
    padding: '6px 4px',
    transition: 'background-color 0.2s',
    outline: 'none',
    textAlign: 'left',
    whiteSpace: 'nowrap', // 줄바꿈 방지
};
