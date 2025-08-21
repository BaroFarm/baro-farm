const { Op } = require('sequelize');
const { Order, OrderProduct, Product, DeliveryDetail, Payment, Seller, Store, ProductImg, Customer, Address } = require('../../models');


// 주문/배송 내역 조회
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const orders = await Order.findAll({
      where: { customer_id: customerId },
      order: [['order_date', 'DESC']],
      include: [
        { model: Customer,
          attributes: ["zip_code", "street", "detail"],
        },
        {
          model: OrderProduct,  // ← Order.hasMany(OrderProduct) 에 alias 없음
          as: 'items',
          attributes: ['order_product_quantity', 'order_product_price'],
          include: [
            {
              model: Product,
              as: 'Product',
              attributes: ['product_id', 'title'],
              include: [
                {
                  model: ProductImg,
                  as: 'images',
                  attributes: ['img_url'],
                  required: false,
                }
              ]
            }
          ]
        
        },
        // {
        //   model: DeliveryDetail,
        //   as: 'delivery',
        //   attributes: ['delivery_status'],
        //   required: false,
        // }
      ]
    });
    // 2) 배송상태 붙이기 (별도 조회)
    // const orderIds = orders.map(o => o.order_id);
    // let deliveryMap = {};
    // if (orderIds.length) {
    //   const dels = await DeliveryDetail.findAll({
    //     where: { order_id: { [Op.in]: orderIds } },
    //     attributes: ['order_id', 'delivery_status'],
    //   });
    //   deliveryMap = Object.fromEntries(dels.map(d => [d.order_id, d]));
    // }

    const orderIds = orders.map(o => o.order_id);
    let deliveryMap = {};
    if (orderIds.length) {
      const dels = await DeliveryDetail.findAll({
        where: { order_id: { [Op.in]: orderIds } },
        attributes: ['order_id', 'delivery_status'],
      });
      deliveryMap = Object.fromEntries(dels.map(d => [d.order_id, d]));
    }

    // 응답 형식 맞춰 데이터 가공
    const formattedOrders = (orders || []).map(order => ({ 
      order_id: order.order_id ?? null, 
      order_date: order.order_date ?? null, 
      order_price: order.order_price ?? null, 
      order_state: order.order_state ?? null, 
      delivery_status: deliveryMap[order.order_id]?.delivery_status ?? '배송준비',
      receiver_name: order.receiver_name ?? null, 
      street: order.Customer?.street ?? null,
      // itemsPreview: order.OrderProducts.map(item => {
      //   const p = item.Product;
      //   // ProductImgs가 배열일 가능성 큼
      //   const firstImgUrl =
      //     (p?.ProductImgs && p.ProductImgs[0]?.img_url) ??
      //     p?.ProductImg?.img_url ?? // 혹시 단수 관계인 경우 대비
      //     null;
      itemsPreview: (order.items || []).map(item => {
        const p = item.Product;
        const firstImgUrl = p?.images?.[0]?.img_url ?? null;

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

    const order = await Order.findOne({
      where: { order_id, customer_id: customerId },
      include: [
        { model: Customer,
          attributes: ['zip_code', 'street', 'detail']
        },
        {
          model: OrderProduct,
          as: 'items',
          where: { order_id },
          required: false,
          include: [
            {
              model: Product,
              as: 'Product',
              attributes: ['product_id', 'title', 'price'],
              include: [
                {
                  model: Seller,
                  as: 'seller',
                  attributes: ['name'],
                  required: false,
                },
                {
                  model: ProductImg,
                  as: 'images',
                  attributes: ['img_url'],
                  required: false,
                }
              ]
            }
          ]
        },
        { model: Payment, required: false },
      ]
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: '해당 주문을 찾을 수 없습니다.'
      });
    }


    // 주소 단건 조회 
    let addr = null;
    if (Address && order.address_id) {
      addr = await Address.findOne({
        where: { address_id: order.address_id },
        attributes: ['zip_code', 'street', 'detail'],
      });
    }

    const delivery = await DeliveryDetail.findOne({
      where: { order_id: order.order_id },
      order: [['delivery_id', 'DESC']],
    });


    //const items = order.OrderProducts || [];
    const items = order.items || [];

    // 응답 포맷
    const formattedOrder = {
      order_id: order.order_id,
      order_date: order.order_date,
      order_price: order.order_price,
      order_state: order.order_state,
        delivery_status: delivery?.delivery_status ?? '배송준비',
        tracking_number: delivery?.tracking_number ?? null,
        courier: delivery?.courier ?? null,
        shipping_fee :  order.order_shipping_fee ?? 0, // 배송비 추가
        receiver_name: order.receiver_name ?? null,
        receiver_phone: order.receiver_phone ?? null,
        deliveryAddress: addr
          ? {
          zipCode: addr.zip_code,
          street: addr.street ?? null,
          detail: addr.detail,
              full: [addr.zip_code, addr.street, addr.detail].filter(Boolean).join(' '),
            }
          : null,
        delivered_at: delivery?.delivered_at ?? null,
        deliveryHistory: [],
      
      // orderItems: (order.OrderProducts || []).map(item => {
      //   const p = item.Product;
      //   const firstImgUrl =
      //     (p?.ProductImgs && p.ProductImgs[0]?.img_url) ??
      //     p?.ProductImg?.img_url ?? null;

      orderItems: items.map((item) => {
        const p = item.Product;
        const firstImgUrl = p?.images?.[0]?.img_url ?? null;

        return {
          order_product_id: item.order_product_id,
          product_id: p?.product_id ?? null,
          product_name: p?.title ?? null,
          product_img: firstImgUrl ?? null,
          order_product_quantity: item.order_product_quantity,
          order_product_price: item.order_product_price,
          sellerName: p?.seller?.name ?? null,
        };
      }),
      paymentInfo: {
        approved_at: order.Payment?.approved_at ?? null,
        amount: order.Payment?.amount ?? 0,
        method: order.Payment?.method ?? null,
        discountAmount: 0,
        couponUsed: null
      },
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
    console.log(Object.keys(Product.associations)); // ['category','seller','direct_store','images', ...]

  }
};

module.exports = { getMyOrders, getMyOrderDetail };
