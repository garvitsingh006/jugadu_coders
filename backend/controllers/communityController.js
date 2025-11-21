const Community = require('../models/Community');
const User = require('../models/User');
const { searchCommunities, generateCommunityEmbedding, generateCommunityName } = require('../services/aiService');
const lyzrAiService = require('../services/lyzrAiService');
const { getLocationFromIP } = require('../services/geoService');

// Search communities with AI enhancement
exports.searchCommunities = async (req, res) => {
  try {
    const { query, mode, userLocation } = req.body;
    const userId = req.userId;

    // Generate AI keywords for enhanced search
    const keywords = await lyzrAiService.generateKeywords(query, userId);
    
    // Use AI keywords to filter communities
    const results = await searchCommunities(query, mode, userLocation, userId, keywords);
    
    // If no match found, regenerate suggestion with AI keywords
    if (!results.found && results.suggestion) {
      const { generateCommunityName } = require('../services/aiService');
      results.suggestion = await generateCommunityName(query, keywords);
    }

    res.json({ ...results, aiKeywords: keywords });
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

    // Capture creator/admin IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                null;

    // If no explicit location provided, try to resolve from IP
    let finalLocation = location;
    if ((!location || !location.coordinates || location.coordinates.length !== 2) && ip) {
      const geo = await getLocationFromIP(ip);
      finalLocation = {
        type: 'Point',
        coordinates: [geo.lng || 0, geo.lat || 0]
      };
    }

    const community = await Community.create({
      name,
      tags,
      description,
      visibility,
      location: finalLocation,
      campus,
      embedding,
      createdBy: userId,
      membersCount: 1,
      adminIp: ip
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

    // If requester is authenticated, indicate if they have joined
    let isMember = false;
    try {
      const userId = req.userId;
      if (userId) {
        const user = await User.findById(userId).select('joinedCommunities');
        if (user) {
          isMember = user.joinedCommunities.some(cid => cid.equals(community._id));
        }
      }
    } catch (err) {
      // non-fatal
      console.error('Error checking membership:', err.message || err);
    }

    res.json({ community, isMember });
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

// Get nearby communities and users based on requester's IP
exports.getNearbyByIP = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                null;

    if (!ip) {
      return res.status(400).json({ error: 'Unable to determine client IP' });
    }

    const geo = await getLocationFromIP(ip);
    const lng = parseFloat(geo.lng || 0);
    const lat = parseFloat(geo.lat || 0);
    const maxDistance = parseInt(req.query.maxDistance || 50000); // 50km radius

    // Find nearby users first
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    }).select('_id name photo campus location').limit(100);

    const nearbyUserIds = nearbyUsers.map(user => user._id);

    // Find communities created by nearby users
    const communitiesByNearbyUsers = await Community.find({
      createdBy: { $in: nearbyUserIds }
    }).populate('createdBy', 'name photo location');

    // Also find communities with adminIp in the same area
    const communitiesNoLoc = await Community.find({
      adminIp: { $exists: true, $ne: null },
      createdBy: { $nin: nearbyUserIds } // Avoid duplicates
    }).limit(100).populate('createdBy', 'name photo');

    const additionalCommunities = [];
    
    // Helper: compute haversine distance in meters
    function haversineDistance(lat1, lon1, lat2, lon2) {
      function toRad(x) { return x * Math.PI / 180; }
      const R = 6371000; // meters
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // Check communities by IP proximity
    for (const c of communitiesNoLoc) {
      try {
        const adminIp = c.adminIp;
        if (!adminIp) continue;
        const cg = await getLocationFromIP(adminIp);
        if (!cg || cg.lat === undefined || cg.lng === undefined) continue;
        const dist = haversineDistance(lat, lng, parseFloat(cg.lat), parseFloat(cg.lng));
        if (dist <= maxDistance) {
          additionalCommunities.push(c);
        }
      } catch (err) {
        console.error('Error resolving adminIp for community', c._id, err.message || err);
      }
    }

    // Combine and sort by creation date
    const allCommunities = [...communitiesByNearbyUsers, ...additionalCommunities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ 
      ip, 
      geo, 
      communities: allCommunities.slice(0, 20),
      users: nearbyUsers.slice(0, 20)
    });
  } catch (error) {
    console.error('Get nearby by IP error:', error);
    res.status(500).json({ error: 'Failed to get nearby results' });
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

    // Get user IP for location tracking
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                null;

    // Ensure community exists
    const communityDoc = await Community.findById(id);
    if (!communityDoc) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Fetch user and check membership
    const user = await User.findById(userId).select('joinedCommunities location');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user location if IP available and no location set
    if (ip && (!user.location || !user.location.coordinates)) {
      try {
        const geo = await getLocationFromIP(ip);
        if (geo && geo.lat && geo.lng) {
          await User.findByIdAndUpdate(userId, {
            location: {
              type: 'Point',
              coordinates: [parseFloat(geo.lng), parseFloat(geo.lat)]
            }
          });
        }
      } catch (err) {
        console.error('Failed to update user location:', err);
      }
    }

    const alreadyJoined = user.joinedCommunities.some(cid => cid.equals(id));
    if (alreadyJoined) {
      return res.json({ community: communityDoc, alreadyJoined: true });
    }

    // Add user to community and increment membersCount
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

    res.json({ community, alreadyJoined: false });
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

// Leave community
exports.leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Ensure community exists
    const communityDoc = await Community.findById(id);
    if (!communityDoc) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Fetch user and check membership
    const user = await User.findById(userId).select('joinedCommunities');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMember = user.joinedCommunities.some(cid => cid.equals(id));
    if (!isMember) {
      // User is not a member; nothing to do
      return res.json({ community: communityDoc, alreadyLeft: true });
    }

    // Remove user from community and decrement membersCount
    const community = await Community.findByIdAndUpdate(
      id,
      {
        $inc: { membersCount: -1 },
        lastActive: new Date()
      },
      { new: true }
    );

    // Prevent negative counts
    if (community.membersCount < 0) {
      await Community.findByIdAndUpdate(id, { membersCount: 0 });
      community.membersCount = 0;
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { joinedCommunities: id }
    });

    res.json({ community, alreadyLeft: false });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
};
