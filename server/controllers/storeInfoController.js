const { Store } = require('../models');

exports.getStoreInfo = async (req, res) => {
  try {
    // 테스트용 store_id 하드코딩
    // const storeId = 1;

    // 인증 미들웨어 사용 시.. 위 코드 대신 이거 씀
    const storeId = req.user.store_id;

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: '해당 판매자의 스토어를 찾을 수 없습니다.',
        code: 404,
      });
    }

    return res.json({
      status: 'success',
      data: {
        name: store.name,
        zip_code: store.zip_code ?? store.zipCode ?? '',
        street: store.street,
        detail: store.detail,
      },
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

exports.patchStoreInfo = async (req, res) => {
  try {
    // const storeId = 1; // 테스트용 하드코딩
    // 인증 미들웨어 사용 시.. 위 코드 대신 이거 씀
    const storeId = req.user.store_id;

    const { name, zip_code, street, detail } = req.body;

    const [updated] = await Store.update(
      {
        ...(name && { name }),
        ...(zip_code && { zip_code }),
        ...(street && { street }),
        ...(detail && { detail }),
      },
      {
        where: { store_id: storeId }
      }
    );

    if (updated === 0) {
      return res.status(404).json({
        status: 'error',
        message: '해당 판매자의 스토어를 찾을 수 없습니다.',
        code: 404,
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