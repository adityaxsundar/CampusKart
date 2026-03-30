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
      status: 'draft' // Saved as draft initially
    });

    res.status(201).json({ success: true, message: 'Product saved as a draft.', data: newProduct });
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

// Get products for the currently logged in user
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your products.', error: error.message });
  }
};

// Update an existing product you own
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, buyingDate } = req.body;

    const product = await Product.findOne({ _id: id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.buyingDate = buyingDate || product.buyingDate;

    if (req.file) {
      product.productPic = await uploadToImageKit(req.file);
    }

    // Changing product details should revert status to pending_approval if strictly verifying, but for now let's keep it simple
    // product.status = 'pending_approval';

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product.', error: error.message });
  }
};

// Delete a product you own
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized to delete.' });

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.', error: error.message });
  }
};

// Update a product's status (Supports Draft, Pending, Available, Removed, Sold transitions)
exports.changeProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    // Allowed logic-controlled statuses for users
    const allowedStatuses = ['draft', 'pending_approval', 'available', 'removed', 'sold'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status requested.' });
    }

    const product = await Product.findOne({ _id: id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });

    // Transition Logic:
    // 1. DRAFT <-> PENDING_APPROVAL (Cancellation/Submission)
    // 2. REMOVED <-> DRAFT / PENDING_APPROVAL (Resubmission/Editing restricted items)
    // 3. AVAILABLE -> REMOVED (User choosing to hide it)
    // 4. AVAILABLE <-> SOLD (Mark as purchased/available)

    const current = product.status;

    // RULE: If already 'removed' by admin, they can move it back to 'draft' or 'pending_approval'
    if (current === 'removed' && !['draft', 'pending_approval'].includes(status)) {
       return res.status(403).json({ success: false, message: 'Removed products can only be moved to Draft or Pending for re-verification.' });
    }

    // RULE: If 'available', can only move to 'removed' or 'sold'
    if (current === 'available' && !['removed', 'sold'].includes(status)) {
      return res.status(403).json({ success: false, message: 'Active products can only be marked as Sold or Removed.' });
    }

    // RULE: If 'sold', can only move to 'available' or 'removed'
    if (current === 'sold' && !['available', 'removed'].includes(status)) {
       return res.status(403).json({ success: false, message: 'Sold products can only be moved back to Available or Removed.' });
    }

    product.status = status;
    await product.save();
    res.status(200).json({ success: true, message: `Product status updated to ${status.replace('_', ' ')}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product status.', error: error.message });
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
