import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ShopNav from '../components/common/ShopNav';
import CartNav from '../components/cart/CartNav';
import CartActionBar from '../components/cart/CartActionBar';
import SmartDelivery from '../components/cart/SmartDelivery';
import QuickPickUp from '../components/cart/QuickPickUp';
import CartSummary from '../components/cart/CartSummary';
import PickupModal from '../components/cart/PickupModal';
import '../components/cart/PickupModal.css';

export default function CartPage() {
  // 1) BASE 문자열은 변하지 않으니, 한 번만 계산
  const API_BASE = useMemo(
    () => (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '').replace(/\/$/, ''),
    []
  );

  // 2) api 헬퍼를 stable 하게
  const api = useCallback((p) => (API_BASE ? `${API_BASE}${p}` : p), [API_BASE]);

  const [selectedTab, setSelectedTab] = useState('스마트 배송');
  const [cartItems, setCartItems] = useState([]);

  const [selectedSmart, setSelectedSmart] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const visibleItems = useMemo(
    () => cartItems.filter(i => (selectedTab === '스마트 배송' ? i.delivery_type === 'smart' : i.delivery_type === 'pickup')),
    [cartItems, selectedTab]
  );

  const handleQuantityChange = (cartItemId, newQuantity) => {
    setCartItems(prev => prev.map(item => item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item));
  };

  // 3) refreshCart 는 api(=stable)만 의존
  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(api('/api/cart'), {
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!res.ok) throw new Error(`(${res.status}) 장바구니 조회 실패`);
    const json = await res.json();
    const mapped = (json?.data ?? []).map(row => ({
      cart_item_id: row.cart_item_id,
      product_id: row.product_id,
      product_name: row.product?.title ?? '상품',
      price: Number(row.product?.price ?? 0),
      quantity: Number(row.quantity ?? 0),
      delivery_type: row.delivery_type === 'pickup' ? 'pickup' : (row.delivery_type ?? 'smart'),
    }));
    setCartItems(mapped);
    setSelectedSmart([]); 
    setSelectedPickup([]);
  }, [api]);

  // 4) 여기선 refreshCart 의 안정성만 보면 됨
  useEffect(() => {
    refreshCart().catch(() => {
      setCartItems([
        { cart_item_id: 1, product_id: 101, product_name: '무농약 사과', price: 15000, quantity: 2, delivery_type: 'smart' },
        { cart_item_id: 2, product_id: 102, product_name: '유기농 감자',  price:  8900, quantity: 1, delivery_type: 'smart' },
        { cart_item_id: 3, product_id: 103, product_name: '양파(바로찾음)', price: 6200, quantity: 1, delivery_type: 'pickup' },
      ]);
      setSelectedSmart([]); 
      setSelectedPickup([]);
    });
  }, [refreshCart]);

  useEffect(() => {
    setSelectedSmart([]);
    setSelectedPickup([]);
    if (selectedTab === '바로 찾음') {
      setSelectedFarm(null);
      setSelectedAddress('');
      setPickupDate('');
    }
  }, [selectedTab]);

  async function deleteCartItemApi(cartItemId) {
    console.log('[delete] call id=', cartItemId);
    const token = localStorage.getItem('accessToken');
    const res = await fetch(api(`/api/cart/${encodeURIComponent(cartItemId)}`), {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    let body = null;
    try { body = await res.json(); } catch (_) {}
    const okStatus = body?.status ? body.status === 'success' : true;
    if (!res.ok || !okStatus) throw new Error(body?.message || `장바구니 삭제 실패 (${res.status})`);
    return body;
  }

  const handleDeleteSingle = async (cartItemId) => {
    const prev = cartItems;
    setCartItems(prev.filter(i => i.cart_item_id !== cartItemId));
    setSelectedSmart(sel => sel.filter(id => id !== cartItemId));
    setSelectedPickup(sel => sel.filter(id => id !== cartItemId));
    try {
      await deleteCartItemApi(cartItemId);
    } catch (e) {
      alert(e.message || '삭제 중 오류가 발생했습니다.');
      setCartItems(prev);
      refreshCart().catch(() => {});
    }
  };

  const handleDeleteSelected = async (ids) => {
    if (!ids?.length) return alert('삭제할 상품을 선택해주세요.');
    if (!window.confirm(`선택한 ${ids.length}개 항목을 삭제할까요?`)) return;

    const prev = cartItems;
    setCartItems(prev.filter(i => !ids.includes(i.cart_item_id)));
    setSelectedSmart(s => s.filter(id => !ids.includes(id)));
    setSelectedPickup(s => s.filter(id => !ids.includes(id)));

    try {
      const results = await Promise.allSettled(ids.map(id => deleteCartItemApi(id)));
      if (results.some(r => r.status === 'rejected')) {
        alert('일부 항목 삭제에 실패했습니다. 목록을 다시 불러옵니다.');
        await refreshCart();
      }
    } catch (e) {
      alert(e.message || '일부 삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.');
      setCartItems(prev);
      refreshCart().catch(() => {});
    }
  };

  const handleChangeDeliveryMethod = () => {
    const ids = selectedTab === '스마트 배송' ? selectedSmart : selectedPickup;
    if (!ids.length) return alert('변경할 상품을 선택해주세요.');
    alert('배송 방법 변경 모달 열기(추후 연동)');
  };

  // 합계 계산(선택 있으면 선택만, 없으면 탭 전체)
  const smartAll = cartItems.filter(i => i.delivery_type === 'smart');
  const smartSel = smartAll.filter(i => selectedSmart.includes(i.cart_item_id));
  const smartLines = smartSel.length ? smartSel : smartAll;
  const smartTotal = smartLines.reduce((s,i)=> s + (i.price||0)*(i.quantity||0), 0);
  const smartShipping = smartTotal >= 40000 ? 0 : smartTotal > 0 ? 3000 : 0;

  const pickupAll = cartItems.filter(i => i.delivery_type === 'pickup');
  const pickupSel = pickupAll.filter(i => selectedPickup.includes(i.cart_item_id));
  const pickupLines = pickupSel.length ? pickupSel : pickupAll;
  const pickupTotal = pickupLines.reduce((s,i)=> s + (i.price||0)*(i.quantity||0), 0);
  const pickupShipping = 0;

  const searchFarms = async ({ region, road }) => {
    const q = encodeURIComponent(`${region} ${road}`.trim());
    const res = await fetch(api(`/api/farms/nearby?address=${q}`), { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('매장 검색 실패');
    const json = await res.json();
    return (json?.data ?? []).sort((a,b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  };

  return (
    <div>
      <ShopNav />
      <CartNav selectedTab={selectedTab} onSelectTab={setSelectedTab} cartItems={cartItems}/>

      <div style={{ padding: '24px' }}>
        <CartActionBar
          allSelected={
            selectedTab === '스마트 배송'
              ? visibleItems.length > 0 && selectedSmart.length === visibleItems.length
              : visibleItems.length > 0 && selectedPickup.length === visibleItems.length
          }
          onSelectAll={(checked) => {
            const ids = checked ? visibleItems.map(i => i.cart_item_id) : [];
            if (selectedTab === '스마트 배송') setSelectedSmart(ids);
            else setSelectedPickup(ids);
          }}
          onDelete={() => handleDeleteSelected(selectedTab === '스마트 배송' ? selectedSmart : selectedPickup)}
          onChangeDelivery={handleChangeDeliveryMethod}
        />

        {selectedTab === '스마트 배송' ? (
          <>
            <SmartDelivery
              cartItems={smartAll}
              selectedItems={selectedSmart}
              setCartItems={setCartItems}
              onQuantityChange={handleQuantityChange}
              setSelectedItems={setSelectedSmart}
              onDeleteSelected={() => handleDeleteSelected(selectedSmart)}
              onDeleteSingle={handleDeleteSingle}
              onChangeDelivery={handleChangeDeliveryMethod}
            />
            <CartSummary
              deliveryType="smart"
              selectedLines={smartLines}
              totalItems={smartLines.reduce((n,i)=>n+(i.quantity||0),0)}
              totalPrice={smartTotal}
              discount={0}
              shippingFee={smartShipping}
              onOrderClick={() => alert('스마트 배송 주문하기!')}
              productId={smartLines[0]?.product_id || 0}
            />
          </>
        ) : (
          <>
            <QuickPickUp
              cartItems={pickupAll}
              selectedItems={selectedPickup}
              setCartItems={setCartItems}
              onQuantityChange={handleQuantityChange}
              setSelectedItems={setSelectedPickup}
              onDeleteSelected={() => handleDeleteSelected(selectedPickup)}
              onDeleteSingle={handleDeleteSingle}
              onChangeDelivery={handleChangeDeliveryMethod}
              selectedFarm={selectedFarm}
              setIsDeliveryModalOpen={setIsModalOpen}
              selectedAddress={selectedAddress}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
            />
            <PickupModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSearch={searchFarms}
              onSelect={(store) => {
                setSelectedFarm({ id: store.id, name: store.name, imageUrl: store.imageUrl, kioskAvailable: !!store.kiosk });
                setIsModalOpen(false);
              }}
            />
            <CartSummary
              deliveryType="pickup"
              selectedLines={pickupLines}
              totalItems={pickupLines.reduce((n,i)=>n+(i.quantity||0),0)}
              totalPrice={pickupTotal}
              discount={0}
              shippingFee={pickupShipping}
              onOrderClick={() => alert('바로 찾음 주문하기!')}
              productId={pickupLines[0]?.product_id || 0}
              pickupDate={pickupDate}
              pickupTime="14:00"
              pickupLocationId={selectedFarm?.id}
            />
          </>
        )}
      </div>
    </div>
  );
}
