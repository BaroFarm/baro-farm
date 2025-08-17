import React, {useEffect, useState} from 'react';
import { FaSearch } from 'react-icons/fa';
import {useNavigate, useLocation} from 'react-router-dom';

export default function SmallNavbar() {
    const navigate = useNavigate(); // 네비게이션 훅 사용
    const location = useLocation(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userType');
        localStorage.removeItem('tokenType');
        alert('로그아웃 되었습니다.');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: '60px',
            backgroundColor: '#fff',
            justifyContent: 'space-between',
            fontFamily: 'Arial, sans-serif',
            marginTop:'35px'
        }}>

      {/* 오른쪽: 작은 네비 메뉴 */}
        <ul style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '20px',
        }}>
            <li><button style={{...buttonStyle, fontWeight: location.pathname === '/cart' ? 'bold' : 'normal', }}
                        onClick={() => navigate('/cart')}>장바구니</button></li>
            <li><button style={buttonStyle} >마이페이지</button></li>
            <li>
            {isLoggedIn ? (
                        <button style={buttonStyle} onClick={handleLogout}>로그아웃</button>
                    ) : (
                        <button style={buttonStyle} onClick={() => navigate('/login')}>로그인</button>
                    )}
            </li>
        </ul>
        
      {/* 검색창 */}
        <div style={searchContainerStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaSearch style={{ margin: '0px 10px' }} />
                <input type="text" placeholder=" 검색어를 입력하세요" 
                style={searchInputStyle}/>
            </div>
        </div>
        </nav>
    );
}

const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'gray',
    padding: '6px 8px',
    borderBottom: '1px solid #ddd',
};
const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
};
const searchInputStyle = {
    border: '1px solid gray',
    borderRadius: '20px',
    fontSize: '14px',
    height: '25px',
    background: 'transparent',
};