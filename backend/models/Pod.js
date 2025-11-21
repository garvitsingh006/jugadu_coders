const mongoose = require('mongoose');

const podSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'hangout', 'study', 'game', 'other'],
    default: 'chat'
  },
  title: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chat: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    time: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
podSchema.index({ location: '2dsphere' });
podSchema.index({ expiresAt: 1 });
podSchema.index({ active: 1 });

module.exports = mongoose.model('Pod', podSchema);
