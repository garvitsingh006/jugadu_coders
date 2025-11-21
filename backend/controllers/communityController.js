const Community = require('../models/Community');
const User = require('../models/User');
const { searchCommunities, generateCommunityEmbedding, generateCommunityName } = require('../services/aiService');

// Search communities
exports.searchCommunities = async (req, res) => {
  try {
    const { query, mode, userLocation } = req.body;
    const userId = req.userId;

    const results = await searchCommunities(query, mode, userLocation, userId);

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

// Create community
exports.createCommunity = async (req, res) => {
  try {
    const { name, tags, description, visibility, location, campus } = req.body;
    const userId = req.userId;

    // Generate embedding
    const embedding = await generateCommunityEmbedding(name, tags, description);

    const community = await Community.create({
      name,
      tags,
      description,
      visibility,
      location,
      campus,
      embedding,
      createdBy: userId,
      membersCount: 1
    });

    // Add to user's joined communities
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedCommunities: community._id }
    });

    res.status(201).json({ community });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
};

// Get community by ID
exports.getCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id)
      .populate('createdBy', 'name photo');

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({ community });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Failed to get community' });
  }
};

// Get nearby communities
exports.getNearbyCommunities = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;

    const communities = await Community.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);

    res.json({ communities });
  } catch (error) {
    console.error('Get nearby error:', error);
    res.status(500).json({ error: 'Failed to get nearby communities' });
  }
};

// Get trending communities
exports.getTrendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .sort({ activityScore: -1, membersCount: -1 })
      .limit(20);

    res.json({ communities });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to get trending communities' });
  }
};

// Join community
exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const community = await Community.findByIdAndUpdate(
      id,
      { 
        $inc: { membersCount: 1 },
        lastActive: new Date()
      },
      { new: true }
    );

    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedCommunities: id }
    });

    res.json({ community });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};

// AI suggest community
exports.suggestCommunity = async (req, res) => {
  try {
    const { query, tags } = req.body;

    const suggestion = await generateCommunityName(query, tags);

    res.json({ suggestion });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
};
