import React from 'react';

export default function ProductPolicy({product}){
    const noticeSections_1 = [
        {
            title: "01. 상품에 문제가 있는 경우",
            items: [
                "받으신 상품이 표시광고 내용 또는 계약 내용과 다른 경우에는 상품을 받은 날부터 3개월 이내, 그 사실을 알게 된 날부터 30일 이내에 반품을 요청하실 수 있습니다.",
                "상품의 정확한 상태를 확인할 수 있도록 사진을 함께 보내주시면 더 빠른 처리가 가능합니다.",
                "* 배송 중 문제가 있는 것으로 확인되면 해당 비용은 판매자가 부담합니다.",
            ],
        },
        {
            title: "02. 단순 변심, 주문 착오인 경우",
            subtitle: "신선 / 냉장 / 냉동 식품",
            items: [
                "상품의 특성상 재판매가 불가하여 단순 변심, 주문 착오, 주소 오류 등의 고객의 책임 있는 사유로 인한 교환 및 반품이 어려운 점 양해 부탁드립니다.",
                "유통기한 30일 이상 상품은 상품을 받은 날부터 7일 이내에만 접수가 가능합니다.",
                "교환/반품 시 왕복배송비(6,000원, 일부 상품은 3,000원)를 부담하셔야 합니다.",
            ],
        },
        {
            title: "03. 교환·환불이 불가능한 경우",
            items: [
                "고객님의 책임 있는 사유로 상품이 멸실/훼손된 경우",
                "시간이 지나 다시 판매하기 어려울 정도로 상품 가치가 감소한 경우",
                "신선식품 등 소비자의 요청에 따라 개별적으로 생산되는 상품인 경우",
                "반품 신청 후 14일 내에 물품이 반환되지 않거나 고객님 귀책으로 반품이 지연된 경우",
            ],
        },
    ];
        const noticeSections_2 = [
        {
            title: "01. 주문 취소 관련",
            items: [
                "주문 취소는 [마이페이지 > 주문/배송 조회]에서 직접 하실 수 있습니다. ",
                "[배송중]부터는 배송이 시작되어 주문 취소가 불가하니, 반품 접수 부탁드립니다(상품에 따라 반품이 불가할 수 있습니다.)",
                "주문 취소 및 반품 접수와 관련하여 도움이 필요하신 분은 문의 게시판 또는 직매장 문의를 이용해주시기 바랍니다.",
                "주문 마감 시간에 임박할수록 취소 가능 시간이 짧아질 수 있습니다.",
                "일부 예약 상품은 판매 시 안내된 취소 마감 기한 내에만 취소할 수 있습니다.",
            ],
        },
        {
            title: "02. 결제 승인 취소 / 환불 관리",
            items: [
                "카드 환불은 카드사 정책에 따르며, 자세한 사항은 카드사에 문의해주세요.",
                "결제 취소 시, 사용하신 적립금과 쿠폰도 모두 복원됩니다.",
            ],
        },
    ];

    return (
        <div style={{textAlign: 'left'}}>
        <div style={{ padding: '32px', background: '#fafafa', borderRadius: '12px' }}> (예시)
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>교환/환불 안내</h2>
            {noticeSections_1.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>{section.title}</div>
                    {section.subtitle && (
                        <div style={{ color: '#7a7a7a', fontSize: '14px', marginBottom: '4px' }}>
                            {section.subtitle}
                        </div>
                    )}
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                        {section.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
            <div style={{ padding: '32px', background: '#fafafa', borderRadius: '12px',  }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>주문 취소 안내</h2>
            {noticeSections_2.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>{section.title}</div>
                    {section.subtitle && (
                        <div style={{ color: '#7a7a7a', fontSize: '14px', marginBottom: '4px' }}>
                            {section.subtitle}
                        </div>
                    )}
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                        {section.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        </div>
    );
}