const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middlewares/authMiddleware');
const favoriteController = require('../controllers/favoriteController');

router.post('/', authMiddleware, favoriteController.addToStoreWishlist);

module.exports = router;
