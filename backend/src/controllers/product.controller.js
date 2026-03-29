const Product = require('../models/product.model');
const Auction = require('../models/auction.model');
const { uploadToImageKit } = require('../middleware/upload');

// User adds a product (Defaults to pending_approval)
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, buyingDate } = req.body;
    let productPic = '';

    // Process image upload through ImageKit
    if (req.file) {
      productPic = await uploadToImageKit(req.file);
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      productPic,
      buyingDate,
      seller: req.user._id,
      status: 'pending_approval' // Explicitly hidden from standard users initially
    });

    res.status(201).json({ success: true, message: 'Product created and awaiting Admin verification.', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list product.', error: error.message });
  }
};

// View available (admin approved) products for all users
exports.getAvailableProducts = async (req, res) => {
  try {
    // Only fetch officially available products and populate seller name
    const products = await Product.find({ status: 'available' }).populate('seller', 'name email');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.', error: error.message });
  }
};

// Start an auction using a previously approved product
exports.startAuction = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findOne({ _id: productId, seller: req.user._id, status: 'available' });
    if (!product) return res.status(403).json({ success: false, message: 'Product not found or not available for auction.' });

    // Creates an auction out of this product
    const newAuction = await Auction.create({
      title: product.title,
      description: product.description,
      images: [product.productPic],
      startingPrice: product.price, // Start auction specifically from standard selling price
      minBidIncrement: 50,
      seller: req.user._id,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours timer
    });

    // We can soft delete or flag the main product so it acts entirely as an auction now
    product.status = 'sold';
    await product.save();

    res.status(200).json({ success: true, message: 'Successfully converted to Auction waiting room!', data: newAuction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to initiate auction.', error: error.message });
  }
};

// ======= ADMIN ROUTES ======= //

// Get purely pending products waiting
exports.getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending_approval' }).populate('seller', 'name email');
    res.status(200).json({ success: true, data: pendingProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending products.', error: error.message });
  }
};

// Admin actively verifying products
exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (action === 'approve') {
      product.status = 'available';
    } else {
      product.status = 'removed';
    }
    
    await product.save();
    res.status(200).json({ success: true, message: `Product successfully ${action}d.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product status.', error: error.message });
  }
};
