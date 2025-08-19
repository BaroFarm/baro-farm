import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import StarRating from '../common/product/StarRating';

// ✅ 예시 데이터 (API 실패 시 사용됨)
const fallbackData = {
    summary: {
        average_rating: 4.57,
        total_reviews: 631,
        rating_distribution: {
            "5": 496,
            "4": 97,
            "3": 23,
            "2": 10,
            "1": 5,
        },
    },
    keywords: [
        {
            label: "신선한",
            description: "신선해요",
            percentage: 78,
            count: 491,
        },
        {
            label: "포장",
            description: "꼼꼼해요",
            percentage: 75,
            count: 469,
        },
        {
            label: "생산지",
            description: "명확해요",
            percentage: 96,
            count: 603,
        },
    ],
};


export default function ProductReviewSummary({ productId }) {
    const [summary, setSummary] = useState(null);
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const fetchReviewSummary = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}/reviews?page=1&limit=5&sort=recent`);
                const data = await res.json();
                setSummary(data.summary);
                setKeywords(data.keywords);
            } catch (err) {
                console.error("리뷰 요약 불러오기 실패. 예시 데이터를 사용합니다.", err);
                setSummary(fallbackData.summary);
                setKeywords(fallbackData.keywords);
            }
        };
        fetchReviewSummary();
    }, [productId]);

    if (!summary) return <div>로딩 중...</div>;

    const { average_rating, total_reviews, rating_distribution } = summary;

    const ratingData = [
        ["별점", "리뷰 수"],
        ["5점", rating_distribution["5"]],
        ["4점", rating_distribution["4"]],
        ["3점", rating_distribution["3"]],
        ["2점", rating_distribution["2"]],
        ["1점", rating_distribution["1"]],
    ];

    const chartOptions = {
        legend: "none",
        chartArea: { width: "80%" },
        hAxis: { title: "리뷰 수", minValue: 0, },
        vAxis: { title: "별점",},
    };

    return (
    <>
        <h3 style={{ margin: '30px 0 30px 0', fontSize: '18px', textAlign: 'left' }}>리뷰 ({total_reviews})</h3>

        <div style={{
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
        }}>

        {/* 1. 총 평점 */}
        <div style={{ flex: "1", minWidth: "220px" }}>
            <h2 style={{ fontSize: "16px" }}>총 평점</h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <StarRating value={average_rating} size={30} />
                <span style={{ fontWeight: "bold", fontSize: "18px", marginTop: "4px" }}>
                    {average_rating.toFixed(2)} / 5
                </span>
            </div>
            <p style={{ fontSize: "18px", color: "#777" }}>전체 리뷰 수: {total_reviews}개</p>
        </div>

        {/* 2. 평점 비율 */}
        <div style={{ flex: "2", minWidth: "280px" }}>
            <h2 style={{ fontSize: "16px" }}>평점 비율</h2>
            <Chart
                chartType="BarChart"
                width="100%"
                height="200px"
                data={ratingData}
                options={chartOptions}
            />
        </div>

        {/* 3. 키워드 평가 */}
        <div style={{ flex: "2", minWidth: "280px" }}>
            <h2 style={{ fontSize: "16px" }}>구매자 평가 키워드</h2>
            {keywords.map((k, idx) => (
                <div key={idx} style={{ margin: "10px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span><strong>{k.label}</strong>: {k.description}</span>
                        <span>{k.percentage}%</span>
                    </div>
                <div style={{ background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                        style={{
                            width: `${k.percentage}%`,
                            background: "#7FC97F",
                            height: "100%",
                        }}
                    ></div>
                </div>
            </div>
            ))}
        </div>
    </div>
    </>
    );
}