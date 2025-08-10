const { Review, ReviewKeyword, Product } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getProductReviews = async (req, res) => {
    const productId = parseInt(req.params.product_id, 10);
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
            error: { code: 400, message: "유효하지 않은 상품 ID입니다." }
        });
    }

    const validSorts = ['recent', 'rating'];
    if (!validSorts.includes(sort)) {
        return res.status(400).json({
            error: { code: 400, message: "Invalid 'sort' parameter." }
        });
    }

    try {
        // 상품 존재 여부 확인
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                error: { code: 404, message: `Product with ID '${productId}' not found.` }
            });
        }

        // 리뷰 전체 조회
        const allReviews = await Review.findAll({
            where: { product_id: productId },
            attributes: ['content'],
            raw: true
        });

        // 키워드 정의
        const keywordDefs = [
            { label: '신선한', description: '신선해요', keyword: '신선' },
            { label: '포장', description: '꼼꼼해요', keyword: '포장' },
            { label: '생산지', description: '명확해요', keyword: '생산지' }
        ];

        // 키워드 통계 계산 
        const totalReviews = allReviews.length;
        const keywords = keywordDefs.map(def => {
            const count = allReviews.filter(r => r.content.includes(def.keyword)).length;
            return {
                label: def.label,
                description: def.description,
                percentage: totalReviews ? Math.round((count / totalReviews) * 100) : 0,
                count
            };
        });
        
        // 평점 평균, 전체 리뷰 수
        const summaryData = await Review.findAll({
            where: { product_id: productId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
                [sequelize.fn('COUNT', sequelize.col('review_id')), 'total_reviews'],
            ],
            raw: true
        });

        // 평점 분포 집계
        const ratings = await Review.findAll({
            where: { product_id: productId },
            attributes: ['rating', [sequelize.fn('COUNT', 'rating'), 'count']],
            group: ['rating'],
            raw: true
        });

        const rating_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratings.forEach(r => {
            rating_distribution[r.rating] = parseInt(r.count);
        });

        // 정렬 기준 및 페이지네이션 계산 
        const order = sort === 'rating'
        ? [['rating', 'DESC'], ['created_date', 'DESC']]
        : [['created_date', 'DESC']];

        const offset = (page - 1) * limit;

        // 리뷰 목록 조회
        const { count, rows } = await Review.findAndCountAll({
            where: { product_id: productId },
            order,
            offset: parseInt(offset),
            limit: parseInt(limit),
            attributes: ['customer_id', 'rating', 'content', 'created_date']
        });

        // 응답 데이터 가공 및 반환 
        return res.status(200).json({
        summary: {
            average_rating: parseFloat(Number(summaryData[0].average_rating).toFixed(2)) || 0,
            total_reviews: parseInt(summaryData[0].total_reviews) || 0,
            rating_distribution
        },
        keywords,
        reviews: rows.map(r => ({
            user_id: String(r.customer_id).replace(/(?<=.{4})./g, '*'), 
            rating: r.rating,
            content: r.content,
            date: r.created_date.toISOString().split('T')[0]
        })),
        pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit)
        }
        });

    } catch (error) {
        console.error('리뷰 조회 오류:', error);
        return res.status(500).json({
        error: { code: 500, message: '서버 내부 오류가 발생했습니다.' }
        });
    }
};

exports.createReview = async (req, res) => {
    const { product_id, order_id, rating, content, images } = req.body;
    const user_id = req.user.id; // JWT 인증 미들웨어에서 세팅된 사용자 정보

    // 필수 파라미터 검사
    if (!product_id || !order_id || !rating || !content) {
        return res.status(400).json({
            error: {
                code: 400,
                message: "필수 입력값이 누락되었습니다. (product_id, order_id, rating, content)"
            }
        });
    }

    try {
        // 상품 존재 여부 확인
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                error: { code: 404, message: `상품 ID ${product_id}를 찾을 수 없습니다.` }
            });
        }

    // // 주문 존재 여부 확인 및 본인 확인
    // const order = await Order.findOne({ where: { order_id, user_id, product_id } });
    // if (!order) {
    //     return res.status(403).json({
    //         error: { code: 403, message: "이 상품에 대한 리뷰를 등록할 권한이 없습니다." }
    //     });
    // }

    // 리뷰 저장
    const review = await Review.create({
        product_id,
        user_id,
        order_id,
        rating,
        content,
        images
    });

    return res.status(201).json({
        status: 'success',
        message: '리뷰가 등록되었습니다.',
        data: {
            review_id: review.review_id,
            product_id,
            user_id,
            rating,
            content,
            images,
            created_at: review.created_date
        }
    });

    } catch (err) {
        console.error('리뷰 등록 오류:', err);
        return res.status(500).json({
        error: {
            code: 500,
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
        });
    }
};
