const Pod = require('../models/Pod');
const Community = require('../models/Community');
const jwt = require('jsonwebtoken');
const lyzrAiService = require('./lyzrAiService');

// Track pod activity for icebreakers
const podActivity = new Map();

// Icebreaker function
async function sendIcebreaker(io, podId) {
  try {
    const pod = await Pod.findById(podId).populate('communityId');
    if (!pod || !pod.communityId) return;

    const icebreaker = await lyzrAiService.generateIcebreaker(pod.communityId.tags);
    
    const aiMessage = {
      sender: null,
      text: icebreaker,
      time: new Date(),
      isAI: true
    };

    pod.chat.push(aiMessage);
    await pod.save();

    io.to(podId).emit('pod-message', aiMessage);
  } catch (error) {
    console.error('Icebreaker error:', error);
  }
}

function initializeSocketHandlers(io) {
  globalIo = io; // Store reference for icebreaker interval
  
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
        const pod = await Pod.findByIdAndUpdate(podId, {
          $push: {
            chat: {
              sender: socket.userId,
              text: message,
              time: new Date()
            }
          },
          lastActivity: new Date()
        }, { new: true });
        
        if (!pod) return;

        // Update activity tracking
        podActivity.set(podId, Date.now());

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

// Store io reference globally
let globalIo = null;

// Check for inactive pods every 5 minutes
setInterval(async () => {
  if (!globalIo) return;
  
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find pods that haven't had activity in 5 minutes
    const inactivePods = await Pod.find({
      active: true,
      expiresAt: { $gt: new Date() },
      lastActivity: { $lt: fiveMinutesAgo },
      'members.1': { $exists: true } // At least 2 members
    }).populate('communityId', 'tags');
    
    for (const pod of inactivePods) {
      // Check if we haven't sent an icebreaker recently
      const lastIcebreaker = pod.chat
        .filter(msg => msg.isAI)
        .sort((a, b) => b.time - a.time)[0];
        
      const shouldSendIcebreaker = !lastIcebreaker || 
        (Date.now() - lastIcebreaker.time.getTime()) > 10 * 60 * 1000; // 10 min since last AI message
        
      if (shouldSendIcebreaker) {
        await sendIcebreaker(globalIo, pod._id.toString());
      }
    }
  } catch (error) {
    console.error('Icebreaker check error:', error);
  }
}, 5 * 60 * 1000);

module.exports = { initializeSocketHandlers };
