import React, {useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
//https://dev-ini.tistory.com/90 참고

export default function BuyNowModal({ openModal, setOpenModal, product }) {
    
    const [count, setCount] = useState(1);
    const [deliveryType, setDeliveryType] = useState('default');
    const navigate = useNavigate();
    const pid = Number(product?.product_id ?? product?.id) || 0;
    const price = Number(product?.price ?? 0);
    const totalPrice = price * count;

    // 👉 이름(alt 텍스트용)
        const name = (product?.name ?? product?.title ?? '상품').toString();
    
        // 👉 ProductSummary와 동일한 폴백 체인
        const imageSrc = useMemo(() => {
            const url =
                product?.image ??                   // normalizeProduct에서 세팅했을 수 있음
                product?.image_url ??
                product?.thumbnail ??
                product?.main_image_url ??
                product?.images?.[0]?.image_url ??
                product?.images?.[0]?.url ??
                `https://picsum.photos/seed/${encodeURIComponent(String(pid || name || 'default'))}/800/600`;
            return url;
        }, [product, pid, name]);

    // const price = product?.price || 0;
    // const totalPrice = price * count;

    const handleMinus = () => {
        if (count > 1) setCount(prev => prev - 1);
    };

    const handlePlus = () => {
        setCount(prev => prev + 1);
    };

    //결제 요청 API 연결
    const handleBuyNow = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
    }

    try {   //API 명세서 올라오면 참고해서 API POST 수정!!!!!(url 등)
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
        product_id: product.product_id,
        quantity: count,
        delivery_type: deliveryType === 'default' ? 'smart' : deliveryType
        })
    });

    const data = await res.json();

    if (res.ok && data.status === 'success') {
        alert(data.message || '결제 페이지로 이동합니다!');
        setOpenModal(false);
    } else {
        alert(data.message || '주문 정보 처리 실패');
    }
    } catch (error) {
        console.error('주문 처리 오류:', error);
        alert('서버 오류가 발생했습니다.');
    }
    };


    return (
    <div style={styles.overlay}>
    <div style={styles.cartContainer}>
        
        <div style={{ display: 'flex', gap: '24px' }}>
                    {/* 이미지 */}
                    <img
                        src={imageSrc}
                        alt={name}
                        onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(String(pid || name || 'default'))}/800/600`;
                        }}
                        style={{ width: 300, height: 300, objectFit: 'cover', background: '#eee', marginTop: '20px' }}
                    />

                    {/* 우측 내용 */}
                    <div style={{ flex: 1 }}>
                        <h2>{product?.title} ({product?.weight})</h2>

                        <div style={{ backgroundColor: '#CFF7D3',
                                color: '#02542D', 
                                fontWeight: 'normal', 
                                fontSize: '14px', 
                                borderRadius: '5px',
                                display: 'inline-block',
                                padding: '2px 6px',
                                marginBottom: '6px'}}>가격</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                            {totalPrice.toLocaleString()}원
                        </div>

                        {/* 수량 */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ marginRight: '12px', fontWeight: 'normal', }}>수량</label>
                            <button onClick={handleMinus}>-</button>
                            <span style={{ margin: '0 8px' }}>{count}</span>
                            <button onClick={handlePlus}>+</button>
                        </div>

                        {/* 상품 수령 방식 */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ marginRight: '12px' }}>상품 수령 방식 선택</label>
                            <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                                <option value="default">스마트 배송</option>
                                <option value="pickup">바로 찾음</option>
                            </select>
                        </div>

                        {/* 구매 버튼 */}
                        <button
                            onClick={handleBuyNow}
                            style={{
                                width: '100%',
                                backgroundColor: '#333',
                                color: 'white',
                                padding: '12px 0',
                                fontWeight: 'normal',
                                fontSize: '16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginBottom: '12px',
                            }}
                        >
                            구매하기
                        </button>

                        {/* 반품 안내 */}
                        <details>
                        <summary style={{ cursor: 'pointer' }}>
                            {product?.is_returnable
                                ? '해당 상품은 반품 가능 상품입니다.'
                                : '해당 상품은 반품 불가 상품입니다.'}
                        </summary>
                        <p style={{ marginTop: '8px', color: '#888' }}>
                            {product?.is_returnable
                                ? '상품 수령 후 7일 이내에 반품하실 수 있습니다.'
                                : '반품 불가 상품은 구매 전에 꼭 확인해 주세요.'}
                        </p>
                        </details>
                    </div>
                </div>

                {/* 취소 버튼 */}
                <button
                    onClick={() => setOpenModal(false)}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '20px',
                        fontSize: '18px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
        </div>
    </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
    },
    cartContainer: {
        backgroundColor: '#ffffff',
        width: '650px',
        height: '350px',
        border: '1px solid #cccccc',
        borderRadius: '20px',
        padding: '20px',
        fontWeight: 600,
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        position: 'fixed',
        zIndex: 100,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'left'
    },
    
};
