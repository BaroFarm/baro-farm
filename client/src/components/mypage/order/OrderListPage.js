import React, {useState,useEffect} from 'react';
import SearchBar from './SearchBar';
import OrderCardList from './OrderCardList';
import Pagination from '../../common/pagination/Pagination';

export default function OrderListPage(){
    
    const [orders, setOrders] = useState([]); // 전체 주문 목록
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const itemsPerPage = 5; // 페이지당 항목 수 (예시)
    
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    useEffect(() => {
    // ✅ 여기에 fetch 또는 mock data 로드
        const mockOrders = Array.from({ length: 28 }, (_, i) => ({
            id: i + 1,
            name: `상품 ${i + 1}`,
            date: '2025.07.31',
        }));
        setOrders(mockOrders);
    }, []);

    const paginatedOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return(
    <div style={{padding: '48px'}}>
        <div style={{fontWeight:'bold', fontSize:'22px', textAlign:'left'}}>주문/배송 조회</div>
        <SearchBar />
        {/* <OrderCardList orders={paginatedOrders}/> */} 
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}/>
    </div>
    );
}