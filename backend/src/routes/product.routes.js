const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();
const {
  createProduct,
  getAvailableProducts,
  getActiveAuctions,
  getMyProducts,
  editProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
} = require('../controllers/product.controller');

// ── Public routes ──────────────────────────────────────────────────────────
router.get('/', getAvailableProducts);
router.get('/auctions', getActiveAuctions);

// ── Authenticated user routes ──────────────────────────────────────────────
router.post('/add', verifyToken, upload.single('productPic'), createProduct);
router.get('/my-products', verifyToken, getMyProducts);
router.put('/:id', verifyToken, upload.single('productPic'), editProduct);
router.delete('/:id', verifyToken, deleteProduct);

// ── Admin-only routes ──────────────────────────────────────────────────────
router.get('/admin/pending', verifyToken, isAdmin, getPendingProducts);
router.put('/admin/approve/:id', verifyToken, isAdmin, approveProduct);

module.exports = router;
