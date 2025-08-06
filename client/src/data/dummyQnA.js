const dummyQnA = [
    {
    inquiry_id: "INQ-001",
    product_id: 101, 
    title: "주문 취소 문의드립니다.",
    content: "어제 주문한 상품을 취소하고 싶은데 어떻게 해야 하나요?",
    status: "PENDING",
    is_visible: "private",
    created_at: "2025-07-14T10:00:00Z",
    author: "홍*동",
    answer: null
    },
    {
    inquiry_id: "INQ-002",
    product_id: 101, 
    title: "사과 유통기한 문의",
    content: "무농약 유기농 사과 유통기한이 어떻게 되나요?",
    status: "ANSWERED",
    is_visible: "public",
    created_at: "2025-07-10T14:30:00Z",
    author: "고*동",
    answer: {
        inquiry_replies_id: "ANS-002",
        content: "유통기한은 수령일로부터 약 7~10일입니다.",
    }
    },

    {
    inquiry_id: "INQ-003",
    product_id: 567, // ✅ 다른 상품의 문의
    title: "배송은 얼마나 걸리나요?",
    content: "지방이라 배송이 오래 걸릴까봐 걱정돼요.",
    status: "ANSWERED",
    is_visible: "public",
    created_at: "2025-07-08T09:10:00Z",
    author: "유*나",
    answer: {
        inquiry_replies_id: "ANS-003",
        content: "보통 1~2일 이내에 도착하며, 지방도 대부분 빠르게 도착합니다."
    }
    }
];

export default dummyQnA;