import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import AddCartModal from '../modal/AddCartModal';
import BuyNowModal from '../modal/BuyNowModal';
import StarRating from '../common/product/StarRating';

export default function ProductSummary({ product }) {

    const navigate = useNavigate();
    const [openCartModal, setOpenCartModal] = useState(false);
    const [openBuyModal, setOpenBuyModal] = useState(false);
    
    const handleAddToWishlist = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            navigate("/login")
            return;
        }
        //찜하기
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ product_id: product.product_id }),
            });

            const json = await res.json();
            if (res.status === 201) {
                alert(json.message || '찜 목록에 추가되었습니다!');
            } else {
                alert(json.message || '찜하기 실패!');
            }
        } catch (err) {
            console.error('찜하기 에러:', err);
            alert('서버 오류가 발생했습니다.');
        }
    };

    //즐겨찾기
    const handleAddToFavorites = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
    }
    try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                target_id: product.seller.store_id, // 매장 ID로 바꿔주세요
                target_type: "store"
            })
        });
        const json = await res.json();
        if (res.status === 201) {
            alert(json.message || "즐겨찾기에 추가되었습니다.");
        } else {
            alert(json.message || "즐겨찾기 추가 실패!");
        }
    } catch (err) {
        console.error("즐겨찾기 추가 중 오류:", err);
        alert("서버 오류가 발생했습니다.");
    }
};


    //장바구니

    //구매


    return (
        <section style={{ display: 'flex', gap: '40px', alignItems: 'start', padding: '24px' }}>
            {/* 왼쪽 영역 */}
            <div style={{ width: '450px', display: 'flex', flexDirection: 'column'}}>
            {/* 상품 상세 - 상단 한 줄 */}
                <h3 style={{ margin: '10px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>상품 상세</h3>
            {/* 아래 줄: 판매자명 + 즐겨찾기 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{product.seller.name}</h2>
                    <button 
                        onClick={handleAddToFavorites}
                        style={{ ...roundStyle, cursor: 'pointer' }}>즐겨찾기</button>
                </div>
            {/* 이미지 및 반품 뱃지 */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={product.image_url}
                        alt={product.title}
                        style={{ width: 450, height: 300, objectFit: 'cover' }}
                    />
                    <p
                        style={{
                            ...roundStyle,
                            backgroundColor: product.is_returnable ? '#B6D19B' : '#D9D9D9',
                            position: 'relative',
                            margin: '20px 10px',
                            width: 'fit-content',
                            fontSize: '16px',
                        }}
                    >
                        {product.is_returnable ? '반품 가능' : '반품 불가'}
                    </p>
                </div>
            </div>

            {/* 오른쪽 영역 */}
            <div style={{ flex: 1, }}>
                <h2 style={{ marginTop: 120, textAlign: 'left'}}>{product.title} ({product.weight})</h2>
                <p style={{textAlign: 'left'}}>{product.description}</p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '12px 0',
                }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                        {product.price.toLocaleString()}원
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating value={product.rating} size={20} />
                    </div>
                </div>
                
                {/* 쿠폰 영역 (나중에 추가) */}
                <div style={{border: '1px solid gray', height: '100px'}}>쿠폰 영역 (나중에 추가)</div>

                {/* 버튼들 */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '20px' 
                }}>
                {/* 왼쪽: 찜하기 */}
                <button 
                    onClick={handleAddToWishlist}
                    style={{ ...roundStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="/logoWithoutText.svg" alt="찜" style={{ width: '20px', height: '20px' }} />
                        찜하기
                </button>

                {/* 오른쪽: 장바구니 + 구매하기 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => {setOpenCartModal(true); }}
                        style={{ ...roundStyle, width: '100px' }}>
                            장바구니
                    </button>
                    {openCartModal ? <AddCartModal 
                                    openModal={openCartModal} 
                                    setOpenModal={setOpenCartModal}
                                    product={product}
                    /> : null}
                    
                    <button 
                        onClick={() => {setOpenBuyModal(true); }}
                        style={{ ...roundStyle, width: '100px' }}>
                            구매하기
                    </button>
                    {openBuyModal ? <BuyNowModal 
                        openModal={openBuyModal} 
                        setOpenModal={setOpenBuyModal}
                        product={product}
                    /> : null}
                </div>
            </div>
        </div>
    </section>
    );
}

const roundStyle = {
    fontSize: '16px',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#B6D19B',
    border: 'none',
    cursor: 'pointer',
    height: 'fit-content',
};
