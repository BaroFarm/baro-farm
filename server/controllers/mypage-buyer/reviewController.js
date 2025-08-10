const { Review, Product, ProductImg } = require('../../models');

const getMyReviews = async (req, res) => {
    try {
        const customerId = req.user.customer_id;
        
        // 페이지 정보
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        // 전체 리뷰 개수
        const totalElements = await Review.count({
            where: { customer_id: customerId }
        });

        const reviews = await Review.findAll({
        where: { customer_id: customerId },
        include: [
            {
            model: Product,
            attributes: ['product_id', 'title'],
            include: [
                { model: ProductImg, attributes: ['img_url'], required: false }
            ]
            }
        ],
        limit: pageSize,
        offset,
        order: [['created_date', 'DESC']]
        });

        // 응답 형식에 맞춰 매핑
        const result = (reviews || []).map(item => ({
            review_id: item?.review_id ?? null,
            rating: item?.rating ?? null,
            content: item?.content ?? null,
            img_url: item?.img_url ?? null,
            product_id: item?.Product?.product_id ?? null,
            product_name: item?.Product?.title ?? null,
            product_img_url: item?.Product?.ProductImgs?.[0]?.img_url ?? null,
            created_at: item?.created_date ?? null
        }));

        res.status(200).json({
          status: 'success',
          data: {
            result,
            pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalElements / pageSize),
            totalElements,
            pageSize
            }
          }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
        });
    }
};

module.exports = { getMyReviews };
