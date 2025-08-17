import React, { useEffect, useState } from 'react';

const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
// 모듈 레벨 간단 캐시: 같은 product_id는 한 번만 조회
const imgCache = new Map(); // product_id -> image_url|null

export default function CartItem({ item, isSelected, onToggleSelect, onDelete, onPurchase, onQuantityChange }) {    
    const [img, setImg] = useState(item.image_url || null);
    // 이미지가 없으면 상품상세에서 한 장 끌어와서 보강
    useEffect(() => {
        let alive = true;
        const pid = item?.product_id;
        if (!pid || img) return; // id 없거나 이미 있으면 스킵

        // 캐시 우선
        if (imgCache.has(pid)) {
            if (alive) setImg(imgCache.get(pid));
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${BASE}/api/products/${pid}?ts=${Date.now()}`, { cache: 'no-store' });
                if (!res.ok) {
                    imgCache.set(pid, null);
                    return;
                }
                const js = await res.json();
                const url =
                    js?.data?.images?.[0]?.url ||
                    js?.data?.image_url ||
                        null;

                imgCache.set(pid, url);
                if (alive) setImg(url);
            } catch {
                imgCache.set(pid, null);
            }
        })();

        return () => { alive = false; };
    }, [item?.product_id, img]);

    const handleIncrease = () => {
        const newQty = item.quantity + 1;
        onQuantityChange(item.cart_item_id, newQty);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            const newQty = item.quantity - 1;
            onQuantityChange(item.cart_item_id, newQty);
        }
    };


    return (
        <div style={{ ...tableGrid, padding: '12px 0', borderBottom: '1px solid #ddd' }}>
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(item.cart_item_id)}
            />
            <img 
                src={img || '/images/mock/no-image-240.png'} 
                alt="상품 이미지" style={imageStyle}
                onError={(e) => {
                    // 진짜 폴백: 에러 나면 기본 이미지로
                    e.currentTarget.src = '/images/mock/no-image-240.png';
                }}
            />
            
            <div style={infoStyle}>
                <div>{item.product_name}</div>
                <div>{(item.price * item.quantity).toLocaleString()}원</div>
            </div>
            <div style={quantityStyle}>수량
                <button onClick={handleDecrease}>-</button>
                <span>{item.quantity}</span>
                <button onClick={handleIncrease}>+</button>
            </div>

            <div>{item.delivery_type === 'smart' ? '스마트 배송' : '바로 찾음'}</div>
            
            <div style={buttonGroupStyle}>
                <button onClick={() => onDelete(item.cart_item_id)} style={buttonStyle}>삭제</button>
                <button onClick={() => onPurchase(item.cart_item_id)} style={buttonStyle}>구매</button>
            </div>
        </div>
    );
}

const tableGrid = {
    display: 'grid',
    gridTemplateColumns: '40px 80px 1fr 120px 120px 140px',
    /* 체크박스 | 이미지 | 상품명 | 수량 | 배송타입 | 버튼그룹 */
    alignItems: 'center',
    gap: '16px',
};
function CartHeader() {
    return (
        <div style={{ ...tableGrid, padding: '8px 0', color: '#666', fontSize: 14 }}>
        <div></div>
        <div></div>
        <div>상품명</div>
        <div>수량</div>
        <div>배송</div>
        <div style={{ justifySelf: 'end' }}>관리</div>
        </div>
    );
}

const imageStyle = {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    // border: '1px solid green',
};


const infoStyle = {
    display: 'flex',
    gap: '44px',
    fontWeight: '500',
    flexDirection: 'row',
};

const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '120px',
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '6px', // 삭제/구매 버튼 간격만 조정
    marginLeft: 'end', // 버튼 그룹을 오른쪽 끝으로 밀기
};

const buttonStyle = {
    backgroundColor: '#d6e9c6',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 12px',
    cursor: 'pointer',
};
