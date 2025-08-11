import React, { useState } from 'react';

function ReturnPolicyModal({ onClose }) {
  const [selectedOption, setSelectedOption] = useState('가능');
  const [condition, setCondition] = useState('');

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>반품 가능 여부 수정</h3>
        <hr />
        <div style={styles.options}>
          <label>
            <input
              type="radio"
              value="가능"
              checked={selectedOption === '가능'}
              onChange={() => setSelectedOption('가능')}
            />
            <span style={styles.radioLabel}>반품 가능</span>
          </label>
          <label>
            <input
              type="radio"
              value="불가능"
              checked={selectedOption === '불가능'}
              onChange={() => setSelectedOption('불가능')}
            />
            <span style={styles.radioLabel}>반품 불가능</span>
          </label>
        </div>

        {selectedOption === '가능' && (
          <div>
            <p style={{ marginBottom: '4px' }}>반품 가능 조건</p>
            <input
              type="text"
              placeholder="반품 가능 조건을 입력하세요"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button onClick={onClose} style={styles.cancelBtn}>취소</button>
          <button onClick={onClose} style={styles.confirmBtn}>확인</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    background: 'white',
    padding: '30px',
    width: '400px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  options: {
    display: 'flex',
    gap: '30px',
    margin: '20px 0',
  },
  radioLabel: {
    marginLeft: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  buttonGroup: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    backgroundColor: '#d9e4d3',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  confirmBtn: {
    backgroundColor: '#d9e4d3',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ReturnPolicyModal;
