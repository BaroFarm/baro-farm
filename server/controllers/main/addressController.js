const axios = require('axios');

exports.searchAddress = async (req, res) => {
    try {
        const { city, road } = req.query;
        let { page = 1, limit = 10 } = req.query;

        if (!city || !road) {
            return res.status(400).json({ error: { code: 400, message: 'city와 road는 필수입니다.' } });
        }
        page  = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit,10) || 10, 1), 50);

        const keyword = `${city} ${road}`.trim();
        const r = await axios.get(process.env.JUSO_BASE_URL, {
            params: {
                confmKey: process.env.JUSO_CONFm_KEY,
                currentPage: page,
                countPerPage: limit,
                keyword,
                resultType: 'json'
            },
            timeout: 5000
        });

        const data = r.data?.results;
        if (!data) {
            return res.status(502).json({ status:'error', code:'UPSTREAM_ERROR', message:'주소 검색 서비스 오류가 발생했습니다.' });
        }

        const total = parseInt(data.common?.totalCount || '0', 10) || 0;
        const results = (data.juso || []).map(j => ({
            postcode: j.zipNo,          // 우편번호
            road: j.roadAddr,           // 도로명 주소
            jibun: j.jibunAddr || ''    // 지번 주소(없으면 빈 문자열)
        }));

        if (results.length === 0) {
            return res.status(404).json({ status:'error', code:'NOT_FOUND', message:'해당 조건의 주소를 찾을 수 없습니다.' });
        }

        return res.status(200).json({
            status: 'success',
            pagination: { page, limit, total },
            results
        });
    } catch (err) {
        if (err.response) {
            return res.status(502).json({ status:'error', code:'UPSTREAM_ERROR', message:'주소 검색 서비스 오류가 발생했습니다.' });
        }
        console.error('주소 검색 오류:', err);
        return res.status(500).json({ status:'error', code:'SERVER_ERROR', message:'서버 내부 오류가 발생하였습니다.' });
    }
};
