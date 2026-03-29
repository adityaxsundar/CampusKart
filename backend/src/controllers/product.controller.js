const Product = require('../models/product.model');
const { uploadToImageKit } = require('../middleware/upload');

// POST /api/products — handles both fixed and auction listing types
exports.createProduct = async (req, res) => {
  try {
    const { title, description, listingType, askingPrice, startingBid, reservePrice, auctionDurationHours, buyingDate } = req.body;

    // Upload image if provided
    let productPic = '';
    if (req.file) {
      productPic = await uploadToImageKit(req.file);
    }

    // Validate based on listing type before touching the DB
    if (listingType === 'fixed') {
      if (!askingPrice || askingPrice <= 0) {
        return res.status(400).json({ success: false, message: 'A valid asking price is required for fixed listings.' });
      }
    } else if (listingType === 'auction') {
      if (!startingBid || startingBid <= 0) {
        return res.status(400).json({ success: false, message: 'A valid starting bid is required for auction listings.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'listingType must be either "fixed" or "auction".' });
    }

    // Build the product document — shared fields first
    const productData = {
      title,
      description,
      listingType,
      productPic,
      buyingDate: buyingDate || Date.now(),
      seller: req.user._id,
      status: 'pending_approval',
    };

    // Attach type-specific fields
    if (listingType === 'fixed') {
      productData.askingPrice = Number(askingPrice);
    } else {
      productData.startingBid = Number(startingBid);
      productData.currentHighestBid = Number(startingBid); // Start the bidding clock here
      productData.reservePrice = reservePrice ? Number(reservePrice) : null;

      // Default auction length is 24 hours if not specified
      const hours = auctionDurationHours ? Number(auctionDurationHours) : 24;
      productData.auctionEndTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: `${listingType === 'fixed' ? 'Fixed-price listing' : 'Auction'} submitted for admin verification.`,
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create listing.', error: error.message });
  }
};

// GET /api/products — public view of all approved listings
exports.getAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' }).populate('seller', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.', error: error.message });
  }
};

// GET /api/products/auctions — live auctions only
exports.getActiveAuctions = async (req, res) => {
  try {
    const auctions = await Product.find({
      listingType: 'auction',
      status: 'active_auction',
      auctionEndTime: { $gt: new Date() }, // Only return auctions that haven't closed yet
    }).populate('seller', 'name').sort({ auctionEndTime: 1 });

    res.status(200).json({ success: true, data: auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch auctions.', error: error.message });
  }
};

// GET /api/products/my-products — seller's own listings
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your products.', error: error.message });
  }
};

// PUT /api/products/:id — update your own listing
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, askingPrice, buyingDate } = req.body;

    const product = await Product.findOne({ _id: id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });

    // Don't allow editing an auction that already has bids placed
    if (product.listingType === 'auction' && product.currentHighestBid > product.startingBid) {
      return res.status(400).json({ success: false, message: 'Cannot edit an auction with active bids.' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.buyingDate = buyingDate || product.buyingDate;
    if (askingPrice) product.askingPrice = Number(askingPrice);
    if (req.file) product.productPic = await uploadToImageKit(req.file);

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated.', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product.', error: error.message });
  }
};

// DELETE /api/products/:id — remove your own listing
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, seller: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
    res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.', error: error.message });
  }
};

// ── ADMIN ROUTES ────────────────────────────────────────────────────────────

exports.getPendingProducts = async (req, res) => {
  try {
    const pending = await Product.find({ status: 'pending_approval' }).populate('seller', 'name email');
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending products.', error: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (action === 'approve') {
      // Auctions go straight into active bidding when approved
      product.status = product.listingType === 'auction' ? 'active_auction' : 'available';
    } else {
      product.status = 'removed';
    }

    await product.save();
    res.status(200).json({ success: true, message: `Product ${action}d successfully.`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.', error: error.message });
  }
};
