const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Dynamic Vite origins fix applied to sockets
    methods: ['GET', 'POST'],
  },
});

const Message = require('./src/models/message.model');

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a specific product chat or auction room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle new bids in an auction
  socket.on('place_bid', (data) => {
    io.to(data.auctionId).emit('update_bid', data);
  });

  // Handle real-time chat messages and persist them securely
  socket.on('send_message', async (data) => {
    try {
      // Create message in DB natively
      const message = await Message.create({
        sender: data.senderId,
        content: data.text,
        isAudio: data.isAudio || false,
      });
      // Append sender details before emitting
      const populatedMsg = await message.populate('sender', 'name');
      io.to(data.roomId).emit('receive_message', populatedMsg);
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
