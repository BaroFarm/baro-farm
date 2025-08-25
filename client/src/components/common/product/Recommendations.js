import React,{useMemo} from "react";
import ProductSlider from "./ProductSlider";
import useRecommendations from "../../../hooks/useRecommendations";
import mockRecoProducts from "../../../data/mockRecoProducts";



// id 기준 중복 제거
function dedupeById(list) {
  const m = new Map();
  for (const it of list) m.set(it.id, it);
  return Array.from(m.values());
}
// mock → slider 포맷으로 매핑
function mapFromMock(item) {
  return {
    id: item.product_id ?? item.id,
    name: item.title ?? item.name ?? "상품",
    price: item.price ?? 0,
    image: item.image_url ?? item.image ?? "/images/mock/no-image-240.png",
    rating: Number(item.rating ?? 0),
  };
}

export default function Recommendations({
  title = "추천 상품",
  fallbackToMock = true, // 필요 시 false로 두면 빈 리스트 그대로 유지
}) {
  // 1) API 우선
  const { items: apiItems = [], loading, error } = useRecommendations();

  // 2) API가 비어있거나 실패하면 mock 사용
  const products = useMemo(() => {
    const base =
      apiItems && apiItems.length
        ? apiItems // 훅에서 이미 {id,name,price,image} 로 매핑됨
        : fallbackToMock
        ? mockRecoProducts.map(mapFromMock)
        : [];
    return dedupeById(base);
  }, [apiItems, fallbackToMock]);

  // 로딩 중에도 이전값이 없으면 스켈레톤처럼 비워두고, 값이 있으면 바로 렌더
  // (ProductSlider에 스켈레톤이 없다면 그냥 즉시 렌더)

  return(
    <div style={{marginTop: '20px', marginBottom: '20px'}}>
      {error && !apiItems.length && fallbackToMock && (
        <div style={{ padding: 10, margin: "0 24px 8px", background: "#fff3cd", border: "1px solid #ffeeba" }}>
          추천 상품을 불러오지 못해 임시 데이터를 보여드려요.
        </div>
      )}
      <ProductSlider products={products} title={title} />
    </div>
  );
}
