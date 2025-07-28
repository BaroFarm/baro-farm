import React, {useEffect, useState} from 'react';
import ShopNav from '../components/common/ShopNav';
import CartNav from '../components/cart/CartNav';
import CartActionBar from '../components/cart/CartActionBar';
import SmartDelivery from '../components/cart/SmartDelivery';
import QuickPickUp from '../components/cart/QuickPickUp';
import CartSummary from '../components/cart/CartSummary';
import PickupAddressModal from '../components/cart/PickupAddressModal';

export default function CartPage(){

    const [selectedTab, setSelectedTab] = useState('스마트 배송');
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);  //바로찾음> 주소 찾기 팝업
    const visibleItems = cartItems.filter(item => 
        selectedTab === '스마트 배송' ? item.delivery_type === 'smart' : item.delivery_type === 'pickup'
    );
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');

    const [pickupDate, setPickupDate] = useState('');

//예시 데이터 사용
    useEffect(() => {
  // 임시 데이터
        const mockItems = [
            {
                cart_item_id: 1,
                product_id: 101,
                product_name: '무농약 사과',
                quantity: 2,
                delivery_type: 'smart'
            },
            {
                cart_item_id: 2,
                product_id: 102,
                product_name: '유기농 감자',
                quantity: 1,
                delivery_type: 'smart'
            },
            {
                cart_item_id: 3,
                product_id: 103,
                product_name: '유기농 감자',
                quantity: 1,
                delivery_type: 'pickup'
            }
        ];
        setCartItems(mockItems);
    }, []);
    
    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }
        // 선택된 항목 제거
        const updatedItems = cartItems.filter(item => !selectedItems.includes(item.cart_item_id));
        setCartItems(updatedItems);
        setSelectedItems([]); // 선택 항목 초기화
        // 이후 fetchCartItems();
    };

    const handleChangeDeliveryMethod = () => {
        if (selectedItems.length === 0) {
            alert('변경할 상품을 선택해주세요.');
            return;
        }
        alert('배송 방법 변경 모달 열기');
    };

    return(
        <div>
            <ShopNav />
            <CartNav
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
            />

            <div style={{ padding: '24px' }}>
                <CartActionBar
                    allSelected={selectedItems.length === visibleItems.length}
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
                            cartItems={cartItems.filter(item => item.delivery_type === 'smart')}
                            selectedItems={selectedItems}
                            setCartItems={setCartItems}
                            setSelectedItems={setSelectedItems}
                            onDeleteSelected={handleDeleteSelected}
                            onChangeDelivery={handleChangeDeliveryMethod}
                        />
                    }
                    
                    {selectedTab === '바로 찾음' && 
                        <QuickPickUp 
                            cartItems={cartItems.filter(item => item.delivery_type === 'pickup')}
                            selectedItems={selectedItems}
                            setCartItems={setCartItems}
                            setSelectedItems={setSelectedItems}
                            onDeleteSelected={handleDeleteSelected}
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
                        totalPrice={30000}
                        discount={5000}
                        shippingFee={3000}
                        onOrderClick={() => alert('주문하기 버튼 클릭!')}
                        productId={cartItems.find(item => selectedItems.includes(item.cart_item_id))?.product_id || 0} 
                        pickupDate={pickupDate}
                        pickupTime={"14:00"}
                        pickupLocationId={selectedFarm?.id}
                    />
                </div>
        </div>
    )
}