const Pod = require('../models/Pod');
const jwt = require('jsonwebtoken');

function initializeSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    socket.on('join-pod', async ({ podId }) => {
      try {
        socket.join(podId);
        socket.currentPod = podId;
        console.log(`User ${socket.userId} joined pod ${podId}`);

        // Notify others
        socket.to(podId).emit('user-joined', { userId: socket.userId });
      } catch (error) {
        console.error('Join pod error:', error);
      }
    });

    socket.on('pod-message', async ({ podId, message }) => {
      try {
        const pod = await Pod.findById(podId);
        if (!pod) return;

        const chatMessage = {
          sender: socket.userId,
          text: message,
          time: new Date()
        };

        pod.chat.push(chatMessage);
        await pod.save();

        // Populate sender info
        await pod.populate('chat.sender', 'name photo');
        const populatedMessage = pod.chat[pod.chat.length - 1];

        io.to(podId).emit('pod-message', populatedMessage);
      } catch (error) {
        console.error('Pod message error:', error);
      }
    });

    socket.on('leave-pod', ({ podId }) => {
      socket.leave(podId);
      socket.to(podId).emit('user-left', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      if (socket.currentPod) {
        socket.to(socket.currentPod).emit('user-left', { userId: socket.userId });
      }
    });
  });
}

module.exports = { initializeSocketHandlers };
