import React from 'react';
import {
    FaStar,
    FaHeart,
    FaCalendarAlt,
    FaGift,
    FaPercentage,
    FaSmile,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function MyListSection() {
    const navigate = useNavigate();

    const items = [
        { icon: <FaStar size={36} />, label: '즐겨찾기', path: '/my/favorites' },
        { icon: <FaHeart size={36} />, label: '찜 목록', path: '/my/wishlist' },
        { icon: <FaCalendarAlt size={36} />, label: '나의 정기 배송', path: '/my/subscriptions' },
        { icon: <FaGift size={36} />, label: '나의 금액권', path: '/my/coupons' },
        { icon: <FaPercentage size={36} />, label: '쿠폰(할인권)', path: '/my/discounts' },
        { icon: <FaSmile size={36} />, label: '나의 리뷰 목록', path: '/my/reviews' },
    ];

    return (
        <div
            style={{
                backgroundColor: '#F9F9F9',
                borderRadius: '20px',
                padding: '24px',
            }}
        >
            <div
                style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    textAlign: 'left',
                    marginBottom: '20px',
                }}
            >
                MY 리스트
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 120px)', // 한 줄에 4개
                    gap: '40px',
                    justifyContent: 'start',
                    marginLeft: '90px'
                }}
            >
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(item.path)}
                        style={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            width: '100px',
                        }}
                    >
                        {item.icon}
                        <div>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
