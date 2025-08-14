// src/pages/ProductImageUploadPage.jsx
import React, { useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

// ✅ 환경 변수
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api';
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

function ProductImageUploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // (URL 파라미터 > location.state > localStorage) 우선순위
  const productId =
    Number(params.productId) ||
    Number(location.state?.productId) ||
    Number(localStorage.getItem('current_product_id') || 0);

  const [uploading, setUploading] = useState(false);
  const [localPreviews, setLocalPreviews] = useState([]);   // 사용자가 선택한 파일 미리보기
  const [serverImages, setServerImages] = useState([]);     // 서버가 내려준 최종 이미지 목록

  const handleOpenPicker = () => fileInputRef.current?.click();

  // Cloudinary 업로드
  const uploadToCloudinary = async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    // form.append('folder', 'barofarm'); // 필요하면 사용
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const { data } = await axios.post(url, form);
    return { img_id: data.public_id, img_url: data.secure_url };
  };

  // 백엔드 메타 등록 (문서 스펙 준수)
  const registerImageToServer = async ({ productId, img_id, img_url, img_order }) => {
    const fd = new FormData();
    fd.append('img_id', String(img_id));                      // string
    fd.append('product_id',String(productId));       // int
    fd.append('img_url', String(img_url));                    // string (문서의 int 표기는 오타)
    if (img_order != null) fd.append('img_order',  String(img_order)); // int
    fd.append('created_at', new Date().toISOString()); // ISO datetime

    const endpoint = `${API_BASE}/s-products/${productId}/images`;
    const { data } = await axios.post(endpoint, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    // data 예시: { product_id: 123, images: [...] }
    return data;
  };

  // 파일 선택 → 즉시 업로드 & 등록 → 응답의 images를 화면에 즉시 표시
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 로컬 미리보기 (업로드 전에 확인용)
    setLocalPreviews(files.map((f) => URL.createObjectURL(f)));

    if (!productId) {
      alert('productId가 없습니다. 이전 단계에서 생성된 상품 ID가 필요합니다.');
      return;
    }
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert('Cloudinary 환경변수가 없습니다. client/.env 설정 후 개발 서버를 재시작하세요.');
      return;
    }

    try {
      setUploading(true);

      let lastResponse = null;
      for (let i = 0; i < files.length; i++) {
        // 1) Cloudinary 업로드
        const { img_id, img_url } = await uploadToCloudinary(files[i]);

        // 2) 우리 서버에 등록
        lastResponse = await registerImageToServer({
          productId,
          img_id,
          img_url,
          img_order: i + 1,
        });
      }

      // 서버가 내려준 최신 이미지 리스트를 즉시 화면에 반영
      setServerImages(lastResponse?.images ?? []);
      alert('이미지 업로드 및 등록 완료!');
    } catch (err) {
      console.error('Upload/Register error:', err?.response?.data || err);
      const apiMsg = err?.response?.data?.message;            // 백엔드 표준 에러
      const cloudMsg = err?.response?.data?.error?.message;   // Cloudinary 에러
      alert(apiMsg || cloudMsg || '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      // 같은 파일 다시 선택 가능하게 input 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 타이틀(좌측 정렬) */}
      <h2 style={styles.topTitle}>상품 등록</h2>

      {/* 가운데 안내/버튼 블록 */}
      <div style={styles.centerBlock}>
        <p style={styles.centerTitle}>
          상품등록을 위해<br />이미지를 업로드 하세요
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          style={styles.uploadBtn}
          onClick={handleOpenPicker}
          disabled={uploading}
        >
          {uploading ? '업로드 중…' : '이미지 업로드'}
        </button>

        {/* 로컬 미리보기 (업로드 직전 확인용) */}
        {localPreviews.length > 0 && (
          <>
            <p style={styles.sectionLabel}>선택한 이미지(로컬 미리보기)</p>
            <div style={styles.previewWrap}>
              {localPreviews.map((src, idx) => (
                <img key={idx} src={src} alt={`local-${idx}`} style={styles.previewImg} />
              ))}
            </div>
          </>
        )}

        {/* 서버가 저장한 최종 이미지 목록 (API 응답) */}
        {serverImages.length > 0 && (
          <>
            <p style={styles.sectionLabel}>등록된 이미지(서버 응답)</p>
            <div style={styles.previewWrap}>
              {serverImages.map((it, idx) => (
                <div key={idx} style={styles.serverItem}>
                  <img src={it.img_url} alt={`server-${idx}`} style={styles.previewImg} />
                  <div style={styles.imgMeta}>
                    <span style={styles.metaText}>order: {it.img_order}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 좌/우 네비게이션 */}
      <div style={styles.navRow}>
        <button
          style={styles.prevBtn}
          onClick={() => navigate('/product/form', { state: { productId } })}
          disabled={uploading}
        >
          &lt; 이전 단계로 이동
        </button>

        <button
          style={styles.nextBtn}
          onClick={() => navigate('/product/ai-description', { state: { productId } })}
          disabled={uploading}
        >
          다음 단계로 이동 <span style={{ marginLeft: 6 }}>›</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  topTitle: { fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: 'left' },

  centerBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '40px 0 24px',
  },
  centerTitle: { fontSize: 28, fontWeight: 700, lineHeight: 1.5, textAlign: 'center' },

  uploadBtn: {
    backgroundColor: '#C9DFAF',
    border: '1px solid #98B985',
    borderRadius: 8,
    padding: '12px 28px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  sectionLabel: { marginTop: 14, fontWeight: 600 },

  previewWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    maxWidth: 760,
    justifyContent: 'center',
  },
  previewImg: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #ddd',
  },
  serverItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  imgMeta: { marginTop: 4, fontSize: 12, color: '#555' },
  metaText: { background: '#F4F7F1', padding: '2px 6px', borderRadius: 6 },

  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 680,
    margin: '0 auto',
    paddingTop: 24,
  },
  prevBtn: {
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: '12px 20px',
    cursor: 'pointer',
  },
  nextBtn: {
    backgroundColor: '#B6D19B',
    border: '1px solid #000',
    borderRadius: 999,
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default ProductImageUploadPage;
