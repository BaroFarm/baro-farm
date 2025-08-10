const dummyQnA = [
    {
    product_id: 1,
    inquiry_id: 4,
    title: "비밀글입니다.",
    content: null,
    status: "접수",
    is_visible: "비공개",
    created_at: "2025-07-14T10:00:00Z",
    author_masked: "테*****3",
    reply_count: 0,
    replies: []
    },
    {
    product_id: 1,
    inquiry_id: 3,
    title: "상품 재입고 문의",
    content: "이 상품 재입고 예정이 있나요?",
    is_visible: "공개",
    author_masked: "테*****2",
    status: "접수",
    created_at: "2025-08-09T22:47:12.000Z",
    reply_count: 1,
    replies: [
        {
        inquiry_reply_id: 1,
        content: "현재 해당 상품은 다음주 중으로 재입고 예정입니다.",
        created_at: "2025-08-10T10:00:38.000Z"
        }
    ]
    },
];

export default dummyQnA;