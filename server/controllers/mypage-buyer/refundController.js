const { Refund, Payment, Order, OrderProduct, Product } = require('../../models');

// 취소/반품 내역 조회
const getMyCancellations = async (req, res) => {
  try {
    const customerId = req.user.customer_id; // 로그인된 사용자 ID 가져오기

    // 페이지네이션 정보 설정
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // 전체 환불 건수 조회
    const totalElements = await Refund.count({
      include: [{
        model: Payment,
        include: [{
          model: Order,
          where: { customer_id: customerId }
        }]
      }]
    });

    // 환불 목록 조회
    const refunds = await Refund.findAll({
    include: [
        {
        model: Payment,
        include: [
            {
            model: Order,
            where: { customer_id: customerId },
            attributes: ['order_id'],
            include: [
                {
                model: OrderProduct,
                attributes: ['order_product_id'], 
                include: [
                    {
                    model: Product,
                    attributes: ['title']
                    }
                ]
                }
            ]
            }
        ]
        }
    ],
    limit: pageSize,
    offset,
    order: [['created_at', 'DESC']]
    });

    // 응답 매핑
    const cancellations = (refunds || []).map(refund => ({
        refund_id: refund.refund_id ?? null, 
        order_id: refund.Payment?.Order?.order_id ?? null, 
        product_name: refund.Payment?.Order?.OrderProducts?.[0]?.Product?.title || null, // 상품명 조인
        amount: refund.amount ?? null, 
        created_at: refund.created_at ?? null, 
        status: refund.status ?? null, 
    }));

    res.status(200).json({
      status: 'success',
      data: {
        cancellations,
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
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};


// 취소/반품 내역 상세 조회
const getCancellationDetail = async (req, res) => {
  try {
    const { refund_id } = req.params; 

    // 환불 1건 상세 조회
    const refund = await Refund.findOne({
      where: { refund_id },
      include: [
        {
          model: Payment,
          include: [
            {
              model: Order,
              attributes: ['order_id'],
              include: [
                {
                  model: OrderProduct,
                  include: [
                    {
                      model: Product,
                      attributes: ['title']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!refund || !refund.Payment || !refund.Payment.Order) {
      return res.status(404).json({ status: 'error', message: '데이터를 찾을 수 없습니다.' });
    }

    const order = refund.Payment.Order;
    const orderProducts = order.OrderProducts || [];

    // 상품명 조합 및 수량 계산
    const mainProduct = orderProducts[0]?.Product?.title || '';
    let product_name = mainProduct;
    if (orderProducts.length > 1) {
      product_name += ` 외 ${orderProducts.length - 1}개`;
    }
    const quantity = orderProducts.reduce((sum, op) => sum + (op.order_product_quantity || 0), 0);

    res.status(200).json({
      status: 'success',
      data: {
        cancellation: {
          refund_id: refund.refund_id,
          order_id: order.order_id,
          product_name,
          quantity,
          amount: refund.amount,
          reason: refund.reason,
          created_at: refund.created_at,
          refunded_at: refund.refunded_at,
          status: refund.status,
          paymentInfo: {
            method: refund.Payment.method,
            amount: refund.Payment.amount
          },
          refundStatus: refund.status // 상태 코드와 동일하게 처리
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

module.exports = { getMyCancellations, getCancellationDetail };
