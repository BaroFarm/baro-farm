import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import BuyVoucherButton from './buttons/BuyVoucherButton';
import AIbotButton from './buttons/AIbotButton';
import ChatbotModal from '../../ai_chatbot/ChatbotModal';

const categories = [
    '전체 상품', '쌀,잡곡', '채소,버섯', '과일,견과', '축산,축산가공',
    '수산물', '반찬,양념,가루', '식사대용,간편식', '간식,음료,유제품', '건강,차'
];

export default function ShopNav() {

    const [botOpen, setBotOpen] = useState(false);

    const handleSend = async (text) => {
    // 시연용 더미 동작
    console.log('[AI Chat] user:', text);
    alert(`보낸 메시지: ${text}\n(서버 연동 전이라 더미 응답입니다)`);
    // 서버 붙일 거면 여기서 fetch/axios 호출
    // const r = await fetch('/api/ai/chat', { method:'POST', body: JSON.stringify({ text }) });
    // const data = await r.json();
    };

    const [selectedCategory, setSelectedCategory] = useState('전체 상품');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = decodeURIComponent(location.pathname);
        const matched = categories.find(cat => path.includes(cat));
        setSelectedCategory(matched || '전체 상품');
    }, [location.pathname]);

    const handleCategoryClick = (label) => {
        setSelectedCategory(label);
        if(label === '전체 상품'){
            navigate('/'); //전체는 기본 페이지로 이동
        } else{
            navigate(`/shop/${encodeURIComponent(label)}`)  //한글 카테고리 인코딩 필수
        }
    };

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
            <AIbotButton onClick={() => setBotOpen(true)} />
        </div>
        {/* 모달 */}
        <ChatbotModal
            open={botOpen}
            onClose={() => setBotOpen(false)}
            onSend={handleSend}
        />
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
