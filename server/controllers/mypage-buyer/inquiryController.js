const { Inquiry, Inquiry_reply } = require('../../models');

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

module.exports = getMyInquiries;
