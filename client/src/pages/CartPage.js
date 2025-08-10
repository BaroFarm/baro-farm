import React, {useEffect, useState, useMemo} from 'react';
import ShopNav from '../components/common/ShopNav';
import CartNav from '../components/cart/CartNav';
import CartActionBar from '../components/cart/CartActionBar';
import SmartDelivery from '../components/cart/SmartDelivery';
import QuickPickUp from '../components/cart/QuickPickUp';
import CartSummary from '../components/cart/CartSummary';
import PickupAddressModal from '../components/cart/PickupAddressModal';

export default function CartPage(){
    const BASE = process.env.REACT_APP_API_BASE_URL;
    const [selectedTab, setSelectedTab] = useState('스마트 배송');
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);  //바로찾음> 주소 찾기 팝업
    
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [pickupDate, setPickupDate] = useState('');

    const visibleItems = useMemo(
    () =>
        cartItems.filter((i) =>
            selectedTab === '스마트 배송' ? i.delivery_type === 'smart' : i.delivery_type === 'pickup'
        ),
        [cartItems, selectedTab]
    );

    //수량 변경
    const handleQuantityChange = (cartItemId, newQuantity) => {
        setCartItems(prev =>
            prev.map(item =>
                item.cart_item_id === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

// ---------- API 연동 + 더미 폴백 ----------
    useEffect(() => {
        const fetchCart = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${BASE}/api/cart`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) {
            // 401 등 에러 시 더미로 폴백
                throw new Error(`(${res.status}) 장바구니 조회 실패`);
            }

            const json = await res.json();
            // 명세: { status:"success", data: [ { cart_item_id, cart_id, product_id, quantity, delivery_type, product:{ product_id, title, price } } ] }
            const mapped =
                json?.data?.map((row) => ({
                    cart_item_id: row.cart_item_id,
                    product_id: row.product_id,
                    product_name: row.product?.title ?? '상품',
                    price: row.product?.price ?? 0,
                    quantity: row.quantity,
                    // 백엔드가 pickup만 내려주면 smart로 바꿔쓸 아이템은 프론트 규칙으로 변환 가능
                    delivery_type: row.delivery_type === 'pickup' ? 'pickup' : row.delivery_type ?? 'smart',
                })) ?? [];

            setCartItems(mapped);
            setSelectedItems([]); // 초기화
        } catch (e) {
            console.warn('[cart] API 실패, 더미 데이터 사용:', e?.message);
            setCartItems([
                { cart_item_id: 1, product_id: 101, product_name: '무농약 사과', price: 15000, quantity: 2, delivery_type: 'smart' },
                { cart_item_id: 2, product_id: 102, product_name: '유기농 감자', price: 8900, quantity: 1, delivery_type: 'smart' },
                { cart_item_id: 3, product_id: 103, product_name: '양파(바로찾음)', price: 6200, quantity: 1, delivery_type: 'pickup' },
            ]);
            setSelectedItems([]);
        }
        };
        fetchCart();
    }, [BASE]);

    //장바구니 삭제
    async function deleteCartItemApi(cartItemId) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE}/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) throw new Error(`장바구니 삭제 실패 (${res.status})`);
    return res.json().catch(() => ({}));
    }

    // 단건 삭제(행의 '삭제' 버튼)
    const handleDeleteSingle = async (cartItemId) => {
        const prev = cartItems;
        // 낙관적 업데이트
        setCartItems(prev.filter(i => i.cart_item_id !== cartItemId));
        setSelectedItems(sel => sel.filter(id => id !== cartItemId));
        try {
            await deleteCartItemApi(cartItemId);
        } catch (e) {
            alert(e.message || '삭제 중 오류가 발생했습니다.');
            setCartItems(prev); // 롤백
        }
    };
    //선택 삭제(상단 액션바)
    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }
        if (!window.confirm(`선택한 ${selectedItems.length}개 항목을 삭제할까요?`)) return;

        const prev = cartItems;
        const ids = selectedItems.slice();

        // 낙관적 업데이트
        setCartItems(prev.filter(i => !ids.includes(i.cart_item_id)));
        setSelectedItems([]);

        try {
            await Promise.all(ids.map(id => deleteCartItemApi(id)));
        } catch (e) {
            alert(e.message || '일부 삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.');
        setCartItems(prev); // 롤백
        }
    };

    const handleChangeDeliveryMethod = () => {
        if (selectedItems.length === 0) {
            alert('변경할 상품을 선택해주세요.');
            return;
        }
        alert('배송 방법 변경 모달 열기(추후 연동)');
    };
    // ---------- 합계(선택상품 기준) ----------
    const selectedLines = cartItems.filter((i) => selectedItems.includes(i.cart_item_id));
    const itemsTotal = selectedLines.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
    const shippingFee = itemsTotal >= 40000 ? 0 : itemsTotal > 0 ? 3000 : 0;
    
    return(
        <div>
            <ShopNav />
            <CartNav selectedTab={selectedTab} onSelectTab={setSelectedTab} />

            <div style={{ padding: '24px' }}>
                <CartActionBar
                    allSelected={visibleItems.length > 0 && selectedItems.length === visibleItems.length}
                    onSelectAll={(checked) => {
                        if (checked) {
                            setSelectedItems(visibleItems.map(i => i.cart_item_id));
                        } else {
                            setSelectedItems([]);
                        }
                    }}
                    onDelete={handleDeleteSelected}
                    onChangeDelivery={handleChangeDeliveryMethod}
                />
                    {/* 아래 컴포넌트만 바뀜 */}
                    {selectedTab === '스마트 배송' &&
                        <SmartDelivery  
                            cartItems={cartItems.filter((i) => i.delivery_type === 'smart')}
                            selectedItems={selectedItems}
                            setCartItems={setCartItems}
                            onQuantityChange={handleQuantityChange}
                            setSelectedItems={setSelectedItems}
                            onDeleteSelected={handleDeleteSelected}
                            onDeleteSingle={handleDeleteSingle}
                            onChangeDelivery={handleChangeDeliveryMethod}
                        />
                    }
                    
                    {selectedTab === '바로 찾음' && 
                        <QuickPickUp 
                            cartItems={cartItems.filter((i) => i.delivery_type === 'pickup')}
                            selectedItems={selectedItems}
                            setCartItems={setCartItems}
                            onQuantityChange={handleQuantityChange}
                            setSelectedItems={setSelectedItems}
                            onDeleteSelected={handleDeleteSelected}
                            onDeleteSingle={handleDeleteSingle}
                            onChangeDelivery={handleChangeDeliveryMethod}
                            selectedFarm={selectedFarm}
                            setIsDeliveryModalOpen={setIsModalOpen}
                            selectedAddress = {selectedAddress}
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                        />
                    }
                    <PickupAddressModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onComplete={({ address, farm }) => {
                            setSelectedAddress(address);
                            setSelectedFarm(farm);
                        }}
                    />

                    <CartSummary 
                        totalItems={selectedItems.length}
                        totalPrice={itemsTotal}
                        discount={0}
                        shippingFee={shippingFee}
                        onOrderClick={() => alert('주문하기 버튼 클릭!')}
                        productId={cartItems.find((i) => selectedItems.includes(i.cart_item_id))?.product_id || 0} 
                        pickupDate={pickupDate}
                        pickupTime={"14:00"}
                        pickupLocationId={selectedFarm?.id}
                    />
                </div>
        </div>
    )
}