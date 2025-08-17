const { Refund, Payment, Order, OrderProduct, Product, ProductImg } = require('../../models');

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
      distinct: true, col: 'refund_id',
      include: [{
        model: Payment, as: 'payment',
        include: [{
          model: Order, as: 'order',
          where: { customer_id: customerId },
          attributes: [],
          required: true
        }]
      }]
    });

    // 환불 목록 조회
    const refunds = await Refund.findAll({
      attributes: ['refund_id', 'amount', 'status', 'reason', 'created_at'],
      include: [
        {
          model: Payment, as: 'payment',
          attributes: ['payment_id', 'method', 'amount'],
          include: [
            {
              model: Order, as: 'order',
              attributes: ['order_id', 'customer_id', 'order_shipping_fee'],
              where: { customer_id: customerId },
              required: true,
              include: [
                {
                  model: OrderProduct, as: 'items',
                  attributes: ['order_product_id', 'order_product_quantity'],
                  include: [
                    {
                      model: Product, as: 'Product',
                      attributes: ['product_id', 'title'],
                      include: [
                        {
                          model: ProductImg, as: 'images', attributes: ['img_url']// 추가
                        }
                      ]
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
    const cancellations = (refunds || []).map(r => {
      // const order = refund.Payment?.Order;
      // const orderProducts = order?.OrderProducts || [];

      // const mainProduct = orderProducts[0]?.Product?.title || '';
      // let product_name = mainProduct;
      // if (orderProducts.length > 1) {
      //   product_name += ` 외 ${orderProducts.length - 1}개`;
      // }

      // const quantity = orderProducts.reduce((sum, op) => sum + (op.order_product_quantity || 0), 0);

      const pay   = r.payment || r.Payment;
      const order = pay?.order || pay?.Order;
      const items = order?.items || order?.OrderProducts || [];
      const first = items[0]?.product || items[0]?.Product;
      const img   = first?.images?.[0]?.img_url || first?.ProductImgs?.[0]?.img_url || null;

      const product_name = items.length > 1
        ? `${first?.title || ''} 외 ${items.length - 1}개`
        : (first?.title || '');

      const quantity = items.reduce((sum, it) =>
        sum + (it.order_product_quantity ?? it.OrderProductQuantity ?? 0), 0);

      return {
        // refund_id: refund.refund_id ?? null,
        // order_id: order?.order_id ?? null,
        // product_img: orderProducts[0]?.Product?.ProductImgs?.[0]?.img_url || null, // 상품 이미지 추가
        // product_name,
        // quantity, // 상품 수량 추가
        // paymentInfo: {
        //   method: refund.Payment?.method, // 결제 수단
        //   amount: refund.Payment?.amount // 결제 금액
        // }, 
        // shipping_fee: order?.order_shipping_fee ?? null, // 배송비 추가
        // refund_amount: refund.amount ?? null, // 환불 금액
        // created_at: refund.created_at ?? null,
        // status: refund.status ?? null
        refund_id: r.refund_id ?? null,
        order_id: order?.order_id ?? order?.OrderId ?? null,
        product_img: img,
        product_name,
        quantity,
        paymentInfo: {
          method: pay?.method ?? null,
          amount: pay?.amount ?? 0,
        },
        shipping_fee: order?.order_shipping_fee ?? order?.OrderShippingFee ?? 0,
        refund_amount: r.amount ?? 0,
        created_at: r.created_at ?? null,
        status: r.status ?? null,
      };
    });


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
      attributes: ['refund_id','amount','status','reason','created_at','refunded_at'],
      include: [
        {
          model: Payment, as: 'payment',
          attributes: ['payment_id','method','amount'],
          include: [
            {
              model: Order, as: 'order',
              attributes: ['order_id','customer_id','order_shipping_fee'],
              include: [
                {
                  model: OrderProduct, as: 'items',
                  attributes: ['order_product_id','order_product_quantity'],
                  include: [
                    {
                      model: Product,  as: 'Product',
                      attributes: ['product_id','title'],
                      include: [
                        {
                          model: ProductImg,  as: 'images', attributes: ['img_url']// 추가
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // if (!refund || !refund.Payment || !refund.Payment.Order) {
    //   return res.status(404).json({ status: 'error', message: '데이터를 찾을 수 없습니다.' });
    // }

    // const order = refund.Payment.Order;
    // const orderProducts = order.OrderProducts || [];

    // // 상품명 조합 및 수량 계산
    // const mainProduct = orderProducts[0]?.Product?.title || '';
    // let product_name = mainProduct;
    // if (orderProducts.length > 1) {
    //   product_name += ` 외 ${orderProducts.length - 1}개`;
    // }
    // const quantity = orderProducts.reduce((sum, op) => sum + (op.order_product_quantity || 0), 0);

    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     cancellation: {
    //       refund_id: refund.refund_id,
    //       order_id: order.order_id,
    //       product_name,
    //       product_img: refund.Payment?.Order?.OrderProducts?.[0]?.Product?.ProductImgs.img_url || null, // 상품 이미지 추가
    //       quantity, // 상품 수량
    //       shipping_fee : order.order_shipping_fee, // 배송비 추가
    //       paymentInfo: {
    //         method: refund.Payment.method,
    //         amount: refund.Payment.amount // 결제 금액
    //       },
    //       reason: refund.reason,
    //       status: refund.status,
    //       refund_amount: refund.amount, // 환불 금액
    //       created_at: refund.created_at,
    //       refunded_at: refund.refunded_at,
    //     }
    //   }
    // });
    const pay   = refund?.payment || refund?.Payment;
    const order = pay?.order || pay?.Order;
    if (!refund || !pay || !order) {
      return res.status(404).json({ status: 'error', message: '데이터를 찾을 수 없습니다.' });
    }

    const items = order.items || order.OrderProducts || [];
    const first = items[0]?.product || items[0]?.Product;
    const img   = first?.images?.[0]?.img_url || first?.ProductImgs?.[0]?.img_url || null;

    const product_name = items.length > 1
      ? `${first?.title || ''} 외 ${items.length - 1}개`
      : (first?.title || '');

    const quantity = items.reduce((sum, it) =>
      sum + (it.order_product_quantity ?? it.OrderProductQuantity ?? 0), 0);

    res.status(200).json({
      status: 'success',
      data: {
        cancellation: {
          refund_id: refund.refund_id,
          order_id: order.order_id ?? order.OrderId,
          product_name,
          product_img: img,
          quantity,
          shipping_fee: order.order_shipping_fee ?? order.OrderShippingFee ?? 0,
          paymentInfo: { method: pay.method ?? null, amount: pay.amount ?? 0 },
          reason: refund.reason ?? null,
          status: refund.status ?? null,
          refund_amount: refund.amount ?? 0,
          created_at: refund.created_at,
          refunded_at: refund.refunded_at,
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
