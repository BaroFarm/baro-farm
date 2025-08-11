import React from 'react';

function ProductReturnModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '400px' }}>
        <h3>반품 가능 여부 수정</h3>
        <hr />
        <div style={{ margin: '15px 0' }}>
          <label>
            <input type="radio" name="returnable" defaultChecked /> 반품 가능
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input type="radio" name="returnable" /> 반품 불가능
          </label>
        </div>
        <div>
          <label>반품 가능 조건</label>
          <input type="text" placeholder="반품 가능 조건을 입력하세요" style={{ width: '100%', padding: '6px', marginTop: '5px' }} />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button style={{ width: '45%', background: '#d6e5c8' }} onClick={onClose}>취소</button>
          <button style={{ width: '45%', background: '#d6e5c8' }}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default ProductReturnModal;
