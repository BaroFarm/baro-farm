const express = require('express');
const router = express.Router();

const { searchAddress } = require('../controllers/main/addressController');
// const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/search', /*authMiddleware,*/ searchAddress);

module.exports = router;