import React, {useEffect, useState} from "react";
import axios from "axios";

export default function PromoBanner(){
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await axios.get("https://api.baro-farm.com/api/banners", {
                params: { position: "main", limit: 3 },
                });
                setBanners(response.data.data);  // 데이터 상태에 저장
            } catch (error) {
                console.error("배너 불러오기 실패", error);
                if (error.response) {
                    alert(`에러 발생: ${error.response.data.error.message}`);
                } else {
                    alert("서버와 연결할 수 없습니다.");
                }
            }
        }; 

        //fetchBanners();

  // 만약 지금 API 준비 안 됐으면 아래 더미 데이터 주석 해제하고,
  // fetchBanners 호출 부분은 주석 처리해도 됨
    
    const exampleData = [
        { banner_id: "bn001",
        title: "7월 여름맞이 할인!",
        image_url: "https://cdn.baro.com/banner/summer.png",
        link_url: "https://baro-farm.com/event/summer",
        alt_text: "여름 특가 이벤트 배너",
        priority: 1,
        position: "main", },
        {  banner_id: "bn002",
        title: "정기배송 상품 추천",
        image_url: "https://cdn.baro.com/banner/subscription.png",
        link_url: "https://baro-farm.com/subscription",
        alt_text: "정기배송 추천 배너",
        priority: 2,
        position: "main", },
    ];
    setBanners(exampleData);

}, []);

    return (
        <div className="w-full flex justify-center overflow-x-auto flex gap-4 p-4"
            style={{ border: "2px solid #4caf50", padding: 16 }}
        >
            {banners.length === 2 ? (
        // 배너 데이터 없을 때 대체 UI (일단 임시로 3으로 해둠...연동 후 수정)
        <div
            style={{
            width: 900,
            height: 250,
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#555",
            fontSize: 18,
            borderRadius: 8,
            }}
        >
            배너 이미지 준비 중...
        </div>
    ) : (
            banners.map((banner) => (
            <a
            key={banner.banner_id}
            href={banner.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full max-w-[500px] rounded shadow overflow-hidden"
            >
                <img
                    src={banner.image_url}
                    alt={banner.alt_text || banner.title}
                    className="w-full object-cover"
                    style={{ height: 250 }}
                />
            </a>
            ))
        )}
    </div>
    );
}

