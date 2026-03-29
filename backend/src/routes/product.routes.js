const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();
const {
  createProduct,
  getAvailableProducts,
  startAuction,
  getPendingProducts,
  approveProduct
} = require('../controllers/product.controller');

// PUBLIC / USER ROUTES
router.post('/add', verifyToken, upload.single('productPic'), createProduct);
router.get('/', getAvailableProducts);
router.post('/start-auction', verifyToken, startAuction);

// ADMIN SPECIFIC ROUTES
router.get('/admin/pending', verifyToken, isAdmin, getPendingProducts);
router.put('/admin/approve/:id', verifyToken, isAdmin, approveProduct);

module.exports = router;
