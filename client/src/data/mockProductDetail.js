const dummyProduct = {
  id: 101,
  title: "무농약 유기농 사과",
  price: 12000,
  weight: "2kg",
  status: "판매중",
  description: "청송 농장에서 직접 수확한 신선한 유기농 사과입니다.",
  image_url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=400&fit=crop",
  is_returnable: true,
  is_subscription: true,
  is_video: true,
  video_url: "https://youtube.com/watch?v=abc123",
  created_at: "2025-07-01T10:30:00",
  updated_at: "2025-07-12T14:00:00",
  category: {
    id: 3,
    name: "과일"
  },
  seller: {
    id: 77,
    name: "청송농원",
    contact: "010-1234-5678"
  },
  store: {
    id: 5,
    name: "성수직매장"
  },
  detail_page: {
    figma_export_url: "https://figma.baro.com/export/abcd1234",
    page_status: "공개"
  },
  average_rating: 4.8,
  review_count: 128
};

export default dummyProduct;