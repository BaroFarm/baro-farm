import React, {useState} from 'react';
import CartItem from './CartItem';
import PickupFarm from './PickupFarm';

export default function QuickPickUp ({
    cartItems,
    selectedItems,
    setCartItems,
    setSelectedItems,
    onDeleteSelected,
    onChangeDelivery,
    onQuantityChange,
    selectedFarm,
    setIsDeliveryModalOpen,
    selectedAddress,
    pickupDate,
    setPickupDate,

}){
    const handleToggleSelect = (id) => {
            setSelectedItems(prev =>
                prev.includes(id)
                    ? prev.filter(itemId => itemId !== id)
                    : [...prev, id]
            );
        };
    
        const handleDeleteSingle = (id) => {
            // 해당 아이템만 제외하고 갱신
            const updatedItems = cartItems.filter(item => item.cart_item_id !== id);
            setCartItems(updatedItems);
            setSelectedItems(prev => prev.filter(itemId => itemId !== id)); // 선택된 항목에서도 제거
        };
    
        const handlePurchaseSingle = (id) => {
            // TODO: 구매 처리
            alert(`${id}번 상품 구매 (예시)`);
        };

        // ✅ 무인 수령함 사용 여부
        const [useKiosk, setUseKiosk] = useState(false);
    
        return (
        <div style={{ textAlign: 'left'}}>
                <h3>바로 찾음 상품</h3>
    
                <ul style={{ listStyle: 'none', padding: 0}}>
                    {cartItems.map(item => (
                        <li key={item.cart_item_id}>
                            <CartItem
                                item={item}
                                isSelected={selectedItems.includes(item.cart_item_id)}
                                onToggleSelect={handleToggleSelect}
                                onDelete={handleDeleteSingle}
                                onPurchase={handlePurchaseSingle}
                                onQuantityChange={onQuantityChange}
                            />
                        </li>
                    ))}
                </ul> 
                {/* 주문자 정보 입력 영역 */}
                <span style={{fontSize: '18px'}}>바로찾음 서비스 안내</span>
                <p>바로찾음 서비스는 날짜와 시간, 상품을 구매할 매장을 지정한 후 직접 픽업할 수 있는 서비스입니다.</p>
            <div style={{ paddingTop: '40px', paddingBottom: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <section style={{ border: '1px solid #ccc', padding: '24px', borderRadius: '8px' }}>
                <h3>바로 찾음 주문자 정보 입력</h3>
                <p>정확하게 입력해주세요.</p>

                <form>
                    <div style={{ marginBottom: '16px' }}>
                        <label>이름 *</label><br />
                        <input type="text" placeholder="Value" style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label>전화번호 *</label><br />
                        <input type="tel" placeholder="Value" style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label>주소 *</label><br />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" placeholder="주소 찾기" style={{ flex: 1 }} readOnly value={selectedAddress} />
                            <button type="button" onClick={() => setIsDeliveryModalOpen(true)}>주소 찾기</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label>희망 픽업 일시</label><br />
                        <input type="date" style={{ width: '100%' }}
                            value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}/>
                    </div>

                    <div>
                        <label>
                            <input type="checkbox" /> 입력된 정보 저장
                        </label>
                    </div>
                </form>
            </section>
        </div>
        {selectedFarm && (
            <div style={{ fontSize: '18px', marginTop: '40px' }}>
                선택한 직매장(농가)
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#ddd',
                            borderRadius: '4px',
                            backgroundImage: `url(${selectedFarm.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontWeight: 'bold' }}>{selectedFarm.name}</div>
                        </div>
                    </div>
                </div>
            )}
            <PickupFarm
                farmName="직매장(농가) 명"
                imageUrl="" // or 실제 이미지 URL
                kioskAvailable={true}
                useKiosk={useKiosk}
                onToggleKiosk={setUseKiosk}
            />
    </div>
    );
}