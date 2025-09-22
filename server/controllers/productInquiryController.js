// 상품 상세의 문의 탭의 해당 상품 문의 내역 조회
const { Inquiry, Inquiry_reply, Customer, Product } = require('../models');

const getProductInquiries = async (req, res) => {
    try {
        // product_id | productId 둘 다 허용
        const pidRaw = req.params.product_id ?? req.params.productId;
        const productId = Number(pidRaw);
        //const productId = Number(req.params.product_id);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        // productId 유효성 검사
        if (!productId || isNaN(productId)) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_PRODUCT_ID',
                message: '유효한 상품 ID를 입력하세요.'
            });
        }
        const productExists = await Product.findByPk(productId);
        if (!productExists) {
            return res.status(404).json({
                status: 'error',
                code: 'PRODUCT_NOT_FOUND',
                message: `해당 상품을 찾을 수 없습니다.`
            });
        }
        
        // 조건 : 해당 상품 + '상품 문의'
        const where = {
            //category: '상품 문의',
            product_id: productId,
        };
        //const categoryFilter = req.query.category || null;
        if (req.query.category) where.category = req.query.category;

        
        // 이름 가운데 글자 * 처리
        const maskName = (name) => {
        if (!name) return '';
        if (name.length <= 2) return name[0] + '*';
        return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
        };

        const { rows, count } = await Inquiry.findAndCountAll({
            where,
            include: [
                { model: Customer, attributes: ['customer_id', 'name'] },
                {
                model: Inquiry_reply, // 답변 달린 경우            
                attributes: ['inquiry_reply_id', 'content', 'created_at'],
                },
            ],
            order: [
                ['created_at', 'DESC'],
                [Inquiry_reply, 'created_at', 'ASC'],
            ],
            limit: pageSize,
            offset,
        });
        
        const result = rows.map((q) => {
        const isPrivate = q.is_visible === '비공개';
        const isOwnerOrAdminOrSeller =
            (req.user?.customer_id && req.user.customer_id === q.customer_id) ||
            req.user?.role === 'admin' ||
            req.user?.role === 'seller';

        const title   = isPrivate && !isOwnerOrAdminOrSeller ? '비밀글입니다.' : q.title; // 비공개 글인 경우, 제목 처리
        const body    = isPrivate && !isOwnerOrAdminOrSeller ? null : q.content;

        // 답변도 비공개, 권한 없으면 내용 마스킹
        const repliesSrc = q.Inquiry_replies || q.replies || []; 
        const replies = (isPrivate && !isOwnerOrAdminOrSeller)
            ? repliesSrc.map(r => ({
                inquiry_reply_id: r.inquiry_reply_id,
                content: null,                     // 내용 숨김
                created_at: r.created_at,
            }))
            : repliesSrc.map(r => ({
                inquiry_reply_id: r.inquiry_reply_id,
                content: r.content,
                created_at: r.created_at,
            }));

        return {
            inquiry_id: q.inquiry_id,
            title,
            content: body,
            is_visible: q.is_visible,             // '공개' | '비공개'
            author_masked: maskName(q.Customer?.name),
            status: q.status,                     // '접수' | '답변완료'
            created_at: q.created_at,
            reply_count: replies.length,
            replies,                             
        };
        });

        return res.status(200).json({
        status: 'success',
        data: {
            result,
            page,
            pageSize,
            totalElements: count,
            totalPages: Math.ceil(count / pageSize),
        },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.',
        });
    }
};

module.exports = getProductInquiries;
