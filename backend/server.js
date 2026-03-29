const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const Message = require('./src/models/message.model');
const Product = require('./src/models/product.model');

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client joins a room keyed by productId — works for both chat and auctions
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // ── Real-time bidding ────────────────────────────────────────────────────
  // Client sends: { productId, bidderId, bidAmount }
  socket.on('place_bid', async (data) => {
    const { productId, bidderId, bidAmount } = data;

    try {
      const product = await Product.findById(productId);

      // Guard: only accept bids on live auctions
      if (!product || product.status !== 'active_auction') {
        socket.emit('bid_error', { message: 'This auction is not active.' });
        return;
      }

      // Guard: check the auction hasn't timed out
      if (new Date() > product.auctionEndTime) {
        product.status = 'unsold';
        await product.save();
        io.to(productId).emit('auction_ended', { productId, message: 'Auction has ended.' });
        return;
      }

      // Guard: new bid must actually beat the current highest
      if (bidAmount <= product.currentHighestBid) {
        socket.emit('bid_error', { message: `Bid must be higher than ₹${product.currentHighestBid}.` });
        return;
      }

      // All checks passed — update the DB
      product.currentHighestBid = bidAmount;
      product.highestBidder = bidderId;
      await product.save();

      // Broadcast the new bid state to everyone watching this auction
      io.to(productId).emit('bid_updated', {
        productId,
        currentHighestBid: product.currentHighestBid,
        highestBidder: bidderId,
      });

    } catch (err) {
      console.error('Bid processing error:', err);
      socket.emit('bid_error', { message: 'Server error while processing bid.' });
    }
  });

  // ── Chat messages ─────────────────────────────────────────────────────────
  socket.on('send_message', async (data) => {
    try {
      const message = await Message.create({
        sender: data.senderId,
        content: data.text,
        isAudio: data.isAudio || false,
      });
      const populated = await message.populate('sender', 'name');
      io.to(data.roomId).emit('receive_message', populated);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Campus Kart is running on port ${PORT}`);
});
