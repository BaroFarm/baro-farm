const { Seller } = require('../models');

exports.getSellerInfo = async (req, res) => {
  try {
    // seller_id를 하드코딩 (1번 판매자를 예시로 조회)
    // const sellerId = 1;
    // 로그인/회원가입과 연동하면 윗줄 지우고 아래 코드로 대체하면 됩니다
    const sellerId = req.user.get('seller_id');

    
    const seller = await Seller.findOne({
      where: { seller_id: sellerId },
      attributes: ['name', 'email', 'password', 'phone', 'contact', 'business_number']
    });

    if (!seller) {
      return res.status(401).json({
        status: 'error',
        message: '판매자를 찾을 수 없습니다.',
        code: 401,
      });
    }

    return res.json({
      status: 'success',
      data: {
        name: seller.name,
        email: seller.email,
        password: seller.password,
        phone: seller.phone,
        contact: seller.contact,
        license_number: seller.business_number,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 500,
    });
  }
};

exports.patchSellerInfo = async (req, res) => {
  try {
    // seller_id를 하드코딩 (1번 판매자를 예시로 조회)
    // const sellerId = 1;
    // 로그인/회원가입과 연동하면 윗줄 지우고 아래 코드로 대체하면 됩니다
    const sellerId = req.user.get('seller_id');
    const { name, email, password, phone, contact, license_number } = req.body;

    const [updated] = await Seller.update(
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password }),
        ...(phone && { phone }),
        ...(contact && { contact }),
        ...(license_number && { business_number: license_number }),
      },
      {
        where: { seller_id: sellerId }
      }
    );

    if (updated === 0) {
      return res.status(401).json({
        status: 'error',
        message: '판매자 정보 변경에 실패했습니다.',
        code: 401,
      });
    }

    return res.json({ status: 'success' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 500,
    });
  }
};