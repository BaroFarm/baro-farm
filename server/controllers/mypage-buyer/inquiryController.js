const { Inquiry, Inquiry_reply, Customer, Product } = require('../../models');

// 나의 문의 내역 조회
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
        'category',        // 반드시 포함
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

// 직매장 소통채널 - 문의 게시판 - 문의 내역 조회
const getInquiries = async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    // 이름 마스킹
    const maskName = (name) => {
      if (!name) return '';
      if (name.length <= 2) return name[0] + '*';
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    };

    const { rows, count } = await Inquiry.findAndCountAll({
      include: [
        { model: Customer, attributes: ['customer_id', 'name'] },
        {
          model: Inquiry_reply, 
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

    // 데이터 가공
    const result = rows.map((q) => {
      const isPrivate = q.is_visible === '비공개';
      const isOwnerOrAdminOrSeller =
        (req.user?.customer_id && req.user.customer_id === q.customer_id) ||
        req.user?.role === 'admin' ||
        req.user?.role === 'seller';

      const title = isPrivate && !isOwnerOrAdminOrSeller ? '비밀글입니다.' : q.title;
      const body = isPrivate && !isOwnerOrAdminOrSeller ? null : q.content;

      // 답변 처리
      const repliesSrc = q.Inquiry_replies || [];
      const replies =
        isPrivate && !isOwnerOrAdminOrSeller
          ? repliesSrc.map((r) => ({
              inquiry_reply_id: r.inquiry_reply_id,
              content: null,
              created_at: r.created_at,
            }))
          : repliesSrc.map((r) => ({
              inquiry_reply_id: r.inquiry_reply_id,
              content: r.content,
              created_at: r.created_at,
            }));

      return {
        inquiry_id: q.inquiry_id,
        title,
        content: body,
        is_visible: q.is_visible, // '공개' | '비공개'
        author_masked: maskName(q.Customer?.name),
        status: q.status, // '접수' | '답변완료'
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
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};

// 직매장 소통채널 - 문의 게시판 - 문의 게시
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
  getMyInquiries, getInquiries,createInquiry
};
