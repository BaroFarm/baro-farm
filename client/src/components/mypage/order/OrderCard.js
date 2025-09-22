import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../../modal/ReviewModal';
import DeliveryTrackModal from '../../modal/DeliveryTrackModal';
import ReturnRequestModal from '../../modal/ReturnRequestModal';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

// 1) 배송상태 정규화 + 버튼 라벨 매핑
const normalizeStatus = (s) => {
  switch (s) {
    case '배송준비':
    case 'READY':
      return 'READY';
    case '배송중':
    case 'IN_DELIVERY':
      return 'IN_DELIVERY';
    case '배송완료':
    case 'DELIVERED':
      return 'DELIVERED';
    case '취소':
    case 'CANCELED':
      return 'CANCELED';
    default:
      return 'UNKNOWN';
  }
};

const STATUS_BTN_TEXT = {
  READY: '배송 준비중',
  IN_DELIVERY: '배송 조회',
  DELIVERED: '배송 조회',
  CANCELED: '취소됨',
  UNKNOWN: '배송 상태 미정',
};

export default function OrderCard({ order }) {
  const {
    order_id,
    order_date,
    order_price,
    delivery_status,
    itemsPreview = [],
  } = order || {};

  const [openReview, setOpenReview] = useState(false); // ★ 모달 상태
  const [openTrack, setOpenTrack] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);

  const firstItem = itemsPreview[0] || {};
  const formattedDate = order_date
    ? new Date(order_date).toLocaleDateString('ko-KR')
    : '-';

  const norm = normalizeStatus(delivery_status);
  const btnLabel = STATUS_BTN_TEXT[norm];
  const isDelivered = norm === 'DELIVERED';

  const navigate = useNavigate();

  // 상세 이동에 쓸 ID
  const detailId = order?.order_pk ?? order?.id ?? order_id;

  const productId = firstItem?.product_id ?? firstItem?.productId;

    // ★ 토큰 가져오기(프로젝트에 맞춰 교체: accessToken/localStorage key 등)
  const getToken = () => localStorage.getItem('accessToken') || "";

  const goDetail = () => {
    if (!detailId) return;

    const focusPid = firstItem?.product_id ?? firstItem?.productId;
    const focusOpid = firstItem?.order_product_id;

    const params = new URLSearchParams();
    if (focusPid != null && focusPid !== '') params.set('pid', String(focusPid));
    if (focusOpid != null && focusOpid !== '') params.set('opid', String(focusOpid));
    const qs = params.toString();

    navigate(`/my/orders/${detailId}${qs ? `?${qs}` : ''}`, {
      state: {
        orderSnapshot: order,
        focusProductId: focusPid ?? null,
        focusOrderProductId: focusOpid ?? null,
      },
    });
  };

  const fallbackText = encodeURIComponent(firstItem?.product_name || '상품');
  const fallbackImg = `https://placehold.co/100x100?text=${fallbackText}`;

  // 등록 콜백: 실제로는 API 호출 연결
  const handleSubmitReview = async ({ rating, content, file }) => {
    try {
      let imgUrl = null;

      // 가장 첫 파일만 채택(명세가 img_url 단일 필드이므로)
      // if (files && files[0]) {
      //   imgUrl = await uploadFileAndGetUrl(files[0]); // 업로드 엔드포인트 없으면 null
      // }

      if (!productId) {
        alert("product_id를 찾을 수 없어요.");
        return;
      }

      const payload = {
        rating,
        content,
        ...(imgUrl ? { img_url: imgUrl } : {}), // 있으면 포함
      };

      const { data } = await axios.post(
        `${API_BASE}/api/products/${productId}/reviews`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      // 성공 UX
      console.log("review created:", data);
      alert("리뷰가 등록되었습니다!");
      setOpenReview(false);

      // (선택) 주문/리뷰 리스트 리프레시 트리거 또는 상위 콜백 호출

    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "리뷰 등록에 실패했습니다.";
      alert(msg);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        backgroundColor: '#fff',
        display: 'flex',
        gap: '20px',
      }}
    >
      {/* 썸네일 */}
      <div>
        <img
          src={firstItem?.image_url || firstItem?.product_img || fallbackImg}
          onError={(e) => { e.currentTarget.src = fallbackImg; }}
          alt={firstItem?.product_name || '상품명 없음'}
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* 텍스트 영역 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '13px', color: '#666', textAlign: 'left' }}>
          {formattedDate} 주문
        </div>

        <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>
          {firstItem?.product_name || '-'}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#333',
          }}
        >
          <div>
            {(order_price ?? 0).toLocaleString()} 원&nbsp;&nbsp;&nbsp;&nbsp;
            수량: {firstItem?.quantity ?? firstItem?.order_product_quantity ?? '-'}
          </div>
          <div style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
            직매장(농가) 명 문의 &gt;
          </div>
        </div>

        {/* 버튼들 */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          {isDelivered ? (
            <button
              type="button"
              onClick={() => setOpenReview(true)}   // ★ 모달 오픈
              style={{
                border: '1px solid #3F7D20',
                color: '#3F7D20',
                padding: '6px 18px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '300px',
                fontSize: '16px',
              }}
            >
              리뷰 작성
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpenTrack(true)}
              style={{
                border: '1px solid #ccc',
                padding: '6px 18px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '300px',
                fontSize: '16px',
              }}
            >
              {btnLabel}
            </button>
          )}

          <button
            type="button"
            onClick={goDetail}
            style={{
              border: '1px solid #ccc',
              padding: '6px 18px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '300px',
              fontSize: '16px',
            }}
          >
            주문 상세
          </button>

          <button
            type="button"
            onClick={()=> setOpenReturn(true)}
            style={{
              border: '1px solid #ccc',
              padding: '6px 18px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '300px',
              fontSize: '16px',
            }}
          >
            교환 / 반품
          </button>
        </div>
      </div>

      {/* ★ 리뷰 모달 */}
    <ReviewModal
      open={openReview}
      onClose={() => setOpenReview(false)}
      productImage={firstItem?.image_url || firstItem?.product_img}
      sellerName={"직매장(농가) 명"}          // 백엔드 값 있으면 교체
      productName={firstItem?.product_name}
      onSubmit={handleSubmitReview}
    />
    <DeliveryTrackModal
      open={openTrack}
      onClose={() => setOpenTrack(false)}
      carrierName="CJ 대한통운"
      carrierPhone="1111-2222"
      trackingNumber="12345678910"
      currentStep={2} // 0:주문확인,1:상품준비,2:배송중,3:배송완료
      events={[
      { time: "2025-08-23 11:41", location: "이천 로컬 직매장", status: "상품 배송 시작" },
      { time: "2025-08-23 11:23", location: "이천 로컬 직매장", status: "주문 정보 확인" },
      ]}
    />
    <ReturnRequestModal
      open={openReturn}
      onClose={() => setOpenReturn(false)}
      orderId={detailId}                        // 주문 식별자
      orderProductId={firstItem?.order_product_id} // 있으면 전달
      defaultType="RETURN"                      // 기본값: 반품
      //onSubmitted={handleReturnSubmitted}
      getToken={getToken}
    />
    </div>
  );
}