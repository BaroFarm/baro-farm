import React, {useEffect, useState} from 'react';
import ShopNav from '../components/common/ShopNav';
import CartNav from '../components/cart/CartNav';
import SmartDelivery from '../components/cart/SmartDelivery';
import QuickPickUp from '../components/cart/QuickPickUp';

export default function CartPage(){

    const [selectedTab, setSelectedTab] = useState('스마트 배송');
    const [cartItems, setCartItems] = useState([]);
    const [selectedSmartItems, setSelectedSmartItems] = useState([]);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    
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
            }
        ];
        setCartItems(mockItems);
    }, []);
    
    const handleDeleteSelected = () => {
        if (selectedSmartItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }
        alert('삭제 기능 작동 (연동 준비)');
        // 이후 fetchCartItems();
    };

    const handleChangeDeliveryMethod = () => {
        if (selectedSmartItems.length === 0) {
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
                    {/* 아래 컴포넌트만 바뀜 */}
                    {selectedTab === '스마트 배송' &&
                        <SmartDelivery  
                            cartItems={cartItems.filter(item => item.delivery_type === 'smart')}
                            selectedItems={selectedSmartItems}
                            setSelectedItems={setSelectedSmartItems}
                            onDeleteSelected={handleDeleteSelected}
                            onChangeDelivery={handleChangeDeliveryMethod}
                            // setIsDeliveryModalOpen={setIsDeliveryModalOpen}
                        />
                    }
                    
                    {selectedTab === '바로 찾음' && <QuickPickUp />}
                
                </div>
        </div>
    )
}