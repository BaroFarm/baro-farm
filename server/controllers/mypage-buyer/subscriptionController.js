const { Op } = require('sequelize');
const { Order, OrderProduct, Product, ProductImg, DeliveryDetail } = require('../../models');

// 나의 정기배송 신청 내역 조회
const getMySubscriptions = async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '10', 10);
    const offset = (page - 1) * pageSize;

    const { rows, count } = await Order.findAndCountAll({
      where: { customer_id: customerId, delivery_type: '정기 배송' },
      attributes: [
        'order_id', 'order_date', 'order_state',
        'order_price', 'order_shipping_fee', 'delivery_type',
        'receiver_name', 'receiver_phone', 'address_id'
      ],
      include: [
        {
          model: OrderProduct,
          as: 'items',
          attributes: ['order_product_id','order_product_quantity','order_product_price'],
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['product_id','title','price'],
            include: [{ model: ProductImg, as: 'images', attributes: ['img_url'], required: false }]
          }]
        }
      ],
      order: [['order_date','DESC']],
      limit: pageSize,
      offset
    });

    // 주문별 최신 배송 1건 조회
    const orderIds = rows.map(o => o.order_id);
    const latestByOrderId = {};
    if (orderIds.length) {
      const deliveries = await DeliveryDetail.findAll({
        where: { order_id: { [Op.in]: orderIds } },
        attributes: [
          'delivery_id','order_id','delivery_status','delivered_at','is_delivered',
          'tracking_number','courier','subscription_cycle','pickup_time'
        ],
        order: [['delivered_at','DESC'], ['delivery_id','DESC']]
      });
      for (const d of deliveries) {
        if (!latestByOrderId[d.order_id]) latestByOrderId[d.order_id] = d;
      }
    }

    // 응답 매핑
    const result = rows.map(o => {
      const d = latestByOrderId[o.order_id] || null;
      return {
        order_id: o.order_id,
        order_date: o.order_date,
        order_state: o.order_state,
        order_price: o.order_price,
        order_shipping_fee: o.order_shipping_fee,
        delivery_type: o.delivery_type,   // '정기 배송'
        receiver_name: o.receiver_name,
        receiver_phone: o.receiver_phone,
        address_id: o.address_id,
        latest_delivery: d ? {
          delivery_id: d.delivery_id,
          delivery_status: d.delivery_status,
          delivered_at: d.delivered_at,
          is_delivered: !!d.is_delivered,
          tracking_number: d.tracking_number ?? null,
          courier: d.courier ?? null,
          subscription_cycle: d.subscription_cycle ?? null,
          pickup_time: d.pickup_time ?? null
        } : null,
        items: (o.items || []).map(it => ({
          order_product_id: it.order_product_id,
          product_id: it.Product?.product_id ?? null,
          product_name: it.Product?.title ?? null,
          product_price: it.Product?.price ?? null,
          product_img: it.Product?.images?.[0]?.img_url ?? null,
          quantity: it.order_product_quantity,
          unit_price_at_order: it.order_product_price
        }))
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        result, page, pageSize,
        totalElements: count,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

module.exports = { getMySubscriptions };
