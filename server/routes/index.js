const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); // 사용자 인증
const mypageRoutes = require('./mypage-buyer') // 마이페이지
const recommendRoutes = require('./recommendRoutes'); // 상품 추천

const sellerRoutes = require('./seller'); // 판매자 정보 조회 및 변경
const storeInfoRoutes = require('./storeInfo'); // 스토어 정보 조회 및 변경
const storeRoutes = require('./store'); // 스토어와 스토어 내 상품 관리
const sProductsRoutes = require('./sProducts'); // 판매자 상품 등록

const productInquiryRoutes = require('./productInquiryRoutes'); // 상품 문의 내역 조회

const categoryRoutes = require('./category');   // 카테고리 조회 
const productRoutes = require('./product');     // 상품 조회 및 리뷰 
const cartRoutes = require('./cart');           // 장바구니 관리  
const wishlistRoutes = require('./wishlist');   // 찜하기 
const favoriteRoutes = require('./favorites');  // 즐겨찾기 
const addressRoutes = require('./address');     // 주소 검색 

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.use('/', recommendRoutes); 

router.use('/seller', sellerRoutes);

router.use('/store', storeInfoRoutes);

router.use('/store', storeRoutes);

router.use('/s-products', sProductsRoutes);

router.use('/products', productInquiryRoutes);

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/address', addressRoutes);

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;