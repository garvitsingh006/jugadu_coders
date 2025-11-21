const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['local', 'global'],
    default: 'global'
  },
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
  campus: {
    type: String,
    trim: true
  },
  membersCount: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    default: []
  },
  adminIp: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  activityScore: {
    type: Number,
    default: 0
  }
});

// Indexes
communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ tags: 1 });
communitySchema.index({ location: '2dsphere' });
communitySchema.index({ createdAt: -1 });
communitySchema.index({ activityScore: -1 });

module.exports = mongoose.model('Community', communitySchema);
