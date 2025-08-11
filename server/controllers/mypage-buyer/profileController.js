const bcrypt = require('bcrypt');
const { Customer } = require('../../models');

const getProfile = async (req, res) => {
    try {
        const user = req.user; // authMiddleware에서 설정한 사용자 정보

        res.status(200).json({
            status: 'success',
            data: {
                customer_id: user.customer_id,
                email: user.email,
                nickname: user.nickname,
                phone: user.phone,
                user_type: user.user_type,
                address: {
                zipCode: user.zip_code,
                street: user.street,
                detail: user.detail
                },
                profile_image: user.profile_image
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    } 
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const {
            nickname,
            phone,
            zip_code,
            street,
            detail,
            password
        } = req.body;

        const updateData = {
            nickname,
            phone: phone,
            zip_code: zip_code,
            street: street,
            detail: detail
        };

        // 비밀번호 변경하는 경우, 해시 처리
        if (password) {
            const isSame = await bcrypt.compare(password, user.password); // 기존 비밀번호와 동일한 경우
            if (!isSame) {
                const hash = await bcrypt.hash(password, 10);
                updateData.password = hash;
            }
        }

        // DB 업데이트
        await Customer.update(updateData, { 
            where: { customer_id: user.customer_id }
        });

        // 업데이트된 사용자 정보 
        const updatedUser = await Customer.findByPk(user.customer_id);

    res.status(200).json({
        status: 'success',
        data: {
            customer_id: updatedUser.customer_id,
            email: updatedUser.email,
            nickname: updatedUser.nickname,
            phone: updatedUser.phone,
            user_type: updatedUser.user_type,
            zip_code: updatedUser.zip_code,
            street: updatedUser.street,
            detail: updatedUser.detail,
            profile_image: updatedUser.profile_image,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
        }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    }
};

module.exports = {
    getProfile, updateProfile
};
