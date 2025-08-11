const { Order, OrderProduct, Product, DeliveryDetail, Payment, Seller, DirectStore, ProductImg } = require('../../models');

// 주문/배송 내역 조회
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const orders = await Order.findAll({
      where: { customer_id: customerId },
      order: [['order_date', 'DESC']],
      include: [
        {
          model: OrderProduct,  // ← Order.hasMany(OrderProduct) 에 alias 없음
          attributes: ['order_product_quantity', 'order_product_price'],
          include: [
            {
              model: Product,
              as: 'Product',
              attributes: ['product_id', 'title'],
              include: [
                {
                  model: ProductImg, 
                  attributes: ['img_url'],
                }
              ]
            }
          ]
        },
        {
          model: DeliveryDetail,
          attributes: ['delivery_status']
        }
      ]
    });

    // 응답 형식 맞춰 데이터 가공
    const formattedOrders = (orders || []).map(order => ({ 
      order_id: order.order_id ?? null, 
      order_date: order.order_date ?? null, 
      order_price: order.order_price ?? null, 
      order_state: order.order_state ?? null, 
      delivery_status: order.DeliveryDetail?.delivery_status || null,
      receiver_name: order.receiver_name ?? null, 
      street: order.street ?? null, 
      itemsPreview: order.OrderProducts.map(item => {
        const p = item.Product;
        // ProductImgs가 배열일 가능성 큼
        const firstImgUrl =
          (p?.ProductImgs && p.ProductImgs[0]?.img_url) ??
          p?.ProductImg?.img_url ?? // 혹시 단수 관계인 경우 대비
          null;

        return {
          product_id: p?.product_id ?? null,
          product_name: p?.title ?? null,
          product_img: firstImgUrl,
          quantity: item.order_product_quantity ?? null,
          price: item.order_product_price ?? null,
        };
      })
    }));

    res.status(200).json({
      status: 'success',
      data: formattedOrders
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


// 주문/배송 내역 상세 조회
const getMyOrderDetail = async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const { order_id } = req.params;

    // 주문 조회 (주문상품, 상품, 판매자, 스토어, 배송, 결제 정보 포함)
    const order = await Order.findOne({
      where: {
        order_id,
        customer_id: customerId
      },
      include: [
        {
          model: OrderProduct,
          include: [
            {
              model: Product,
              as: 'Product',
              attributes:['product_id','title'],
              include: [
                {
                  model: Seller,
                  as:'seller',
                  attributes: ['name'],
                  // include: [
                  //   {
                  //     model: DirectStore,
                  //     as:'direct_store',
                  //     attributes: ['name'] // 스토어 이름
                  //   },
                  // ]
                },
                {
                  model: ProductImg, 
                  attributes: ['img_url'],
                }
              ]
            }
          ]
        },
        {
          model: DeliveryDetail
        },
        {
          model: Payment
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: '해당 주문을 찾을 수 없습니다.'
      });
    }

    // 응답 포맷
    const formattedOrder = {
      order_id: order.order_id,
      order_date: order.order_date,
      order_price: order.order_price,
      order_state: order.order_state,
      deliveryInfo: {
        delivery_status: order.DeliveryDetail?.delivery_status || null,
        tracking_number: order.DeliveryDetail?.tracking_number || null,
        courier: order.DeliveryDetail?.courier || null,
        shipping_fee : order.order_shipping_fee, // 배송비 추가
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        deliveryAddress: {
          zipCode: order.zip_code,
          street: order.street,
          detail: order.detail
        },
        delivered_at: order.DeliveryDetail?.delivered_at || null,
        deliveryHistory: []
      },
      orderItems: (order.OrderProducts || []).map(item => {
        const p = item.Product;
        const firstImgUrl =
          (p?.ProductImgs && p.ProductImgs[0]?.img_url) ??
          p?.ProductImg?.img_url ?? null;

        return {
          order_product_id: item.order_product_id,
          product_id: p?.product_id ?? null,
          product_name: p?.title ?? null,
          product_img: firstImgUrl ?? '~',
          order_product_quantity: item.order_product_quantity,
          order_product_price: item.order_product_price,
          sellerName: p?.Seller?.Store?.name ?? null
        };
      }),
      paymentInfo: {
        approved_at: order.Payment?.approved_at ?? null,
        amount: order.Payment?.amount ?? 0,
        method: order.Payment?.method ?? null,
        discountAmount: 0,
        couponUsed: null
      }
    };

    res.status(200).json({
      status: 'success',
      data: formattedOrder
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

module.exports = { getMyOrders, getMyOrderDetail };