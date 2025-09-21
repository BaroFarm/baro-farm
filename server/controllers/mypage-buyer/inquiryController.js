//프론트에서 Product 추가했습니다 - 상품 상세에서 진입 시 상품 아이디 포함
const { Inquiry, Inquiry_reply, Product } = require('../../models');

// 문의 내역 조회
const getMyInquiries = async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const totalElements = await Inquiry.count({ where: { customer_id: customerId } });

    // 문의 내역 조회
    const inquiries = await Inquiry.findAll({
      where: { customer_id: customerId },
      attributes: [
        'inquiry_id',
        'title',
        'content',
        'category',        // ✅ 반드시 포함
        'status',
        'is_visible',
        'created_at',
        'product_id',
      ],
      include: [{ model: Inquiry_reply }],
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset
    });

    // 응답 매핑
    const result = inquiries.map(q => ({
      inquiry_id: q.inquiry_id,
      title: q.title,
      content: q.content,
      category: q.category || null,  //프론트에서 추가
      status: q.status === '접수' ? 'PENDING' : 'ANSWERED',
      is_visible: q.is_visible === '공개' ? 'public' : 'private',
      created_at: q.created_at,
      answer: q.Inquiry_replies?.length
        ? {
            inquiry_replies_id: q.Inquiry_replies.inquiry_reply_id,
            content: q.Inquiry_replies[0].content
          }
        : null
    }));

    res.status(200).json({
      status: 'success',
      data: {
        inquiries: result,
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

// 문의 게시
const createInquiry = async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const raw = req.body || {};
    let category = typeof raw.category === 'string' ? raw.category.trim() : raw.category;
    let title    = typeof raw.title === 'string'    ? raw.title.trim()    : raw.title;
    let content  = typeof raw.content === 'string'  ? raw.content.trim()  : raw.content;
    
    const normalizeVisibility = (v) => (v === '공개' ? '공개' : '비공개');
    const is_visible = normalizeVisibility(raw.is_visible);
    let finalProductId = raw.product_id;

    // 공백 제거
    category = typeof category === 'string' ? category.trim() : category;
    title    = typeof title === 'string'    ? title.trim()    : title;
    content  = typeof content === 'string'  ? content.trim()  : content;

    if (!category || !title || !content) {
      return res.status(400).json({
        status: 'error',
        message: '카테고리, 제목, 내용을 모두 입력해주세요.'
      });
    }

    if (category === '상품 문의') {
      if (finalProductId) {
        const exists = await Product.findByPk(finalProductId);
        if (!exists) {
          return res.status(404).json({ status: 'error', message: '존재하지 않는 상품입니다.' });
        }
      } else {
        finalProductId = null;  // 마이페이지에서 작성한 일반 상품 문의
      }
    }    

    // 문의 생성
    const inquiry = await Inquiry.create({
      customer_id: customerId,
      category,
      title,
      content,
      is_visible,
      status: '접수',
      created_at : new Date(),
      product_id: finalProductId
    });

    return res.status(201).json({
      status: 'success',
      data: { inquiry_id: inquiry.inquiry_id },
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

module.exports = {
  getMyInquiries, createInquiry
};
