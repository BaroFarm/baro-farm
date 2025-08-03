import React from 'react';
//https://dev-ini.tistory.com/90 참고

export default function AddCartModal({ openModal, setOpenModal }) {
    return (
    <div style={styles.overlay}>
    <div style={styles.cartContainer}>
        <span style={styles.productName}>[풀무원] 국물 떡볶이</span>
        <span style={styles.productPrice}>4,000원</span>

        <div style={styles.count}>
            <div style={styles.minus}>-</div>
            <div style={styles.number}>2</div>
            <div style={styles.plus}>+</div>
        </div>

        <span style={styles.total}>합계</span>
        <span style={styles.totalPrice}>8,000원</span>

        <button style={styles.cancel} type="button"
            onClick={() => {setOpenModal(false); }}>취소
        </button>
        {!openModal ? setOpenModal(true) : null}   {/* state 반전시키기 */}

        <button style={styles.addCart} type="button">장바구니 담기</button>
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
        width: '250px',
        height: '150px',
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
    },
    productName: {
        display: 'inline-block',
        fontSize: '14px',
        position: 'absolute',
    },
    productPrice: {
        fontSize: '14px',
        position: 'absolute',
        left: '20px',
        top: '60px',
    },
    count: {
        width: '70px',
        height: '20px',
        border: '1px solid #cccccc',
        position: 'absolute',
        right: '20px',
        top: '50px',
        padding: '2px 0',
    },
    minus: {
        position: 'absolute',
        left: '10%',
    },
    number: {
        position: 'absolute',
        left: '45%',
    },
    plus: {
        position: 'absolute',
        right: '10%',
    },
    total: {
        display: 'inline-block',
        position: 'absolute',
        left: '20px',
        top: '100px',
        fontSize: '14px',
    },
    totalPrice: {
        fontSize: '22px',
        fontWeight: 600,
        display: 'inline-block',
        position: 'absolute',
        right: '20px',
        top: '50%',
    },
    cancel: {
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        width: '120px',
        padding: '7px 0',
        backgroundColor: 'white',
        color: '#0f6cfc',
        fontWeight: 600,
        border: '1px solid #0f6cfc',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    addCart: {
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        width: '120px',
        padding: '7px 0',
        backgroundColor: '#0f6cfc',
        color: 'white',
        fontWeight: 600,
        border: '1px solid #0f6cfc',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};
