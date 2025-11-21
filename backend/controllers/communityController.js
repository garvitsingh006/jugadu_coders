const Community = require('../models/Community');
const User = require('../models/User');
const { searchCommunities, generateCommunityEmbedding, generateCommunityName } = require('../services/aiService');
const { getLocationFromIP } = require('../services/geoService');

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
    const maxDistance = parseInt(req.query.maxDistance || 10000);

    // Find communities with valid locations near the requester
    const communitiesNear = await Community.find({
      'location.coordinates': { $ne: [0, 0] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(20).populate('createdBy', 'name photo');

    // Find communities that don't have a useful location but have adminIp
    const communitiesNoLoc = await Community.find({
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates.0': 0, 'location.coordinates.1': 0 },
      ],
      adminIp: { $exists: true, $ne: null }
    }).limit(200).populate('createdBy', 'name photo');

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

    for (const c of communitiesNoLoc) {
      try {
        const ip = c.adminIp;
        if (!ip) continue;
        const cg = await getLocationFromIP(ip);
        if (!cg || cg.lat === undefined || cg.lng === undefined) continue;
        const dist = haversineDistance(lat, lng, parseFloat(cg.latitude || cg.lat), parseFloat(cg.longitude || cg.lng) );
        if (dist <= maxDistance) {
          // Backfill community location so it will be found faster next time
          try {
            await Community.findByIdAndUpdate(c._id, {
              location: { type: 'Point', coordinates: [parseFloat(cg.longitude || cg.lng), parseFloat(cg.latitude || cg.lat)] }
            });
          } catch (err) {
            console.error('Failed to backfill community location:', err.message || err);
          }
          additionalCommunities.push(Object.assign({}, c.toObject(), { location: { type: 'Point', coordinates: [parseFloat(cg.longitude || cg.lng), parseFloat(cg.latitude || cg.lat)] } }));
        }
      } catch (err) {
        // ignore per-community errors
        console.error('Error resolving adminIp for community', c._id, err.message || err);
      }
    }

    // Combine lists, avoiding duplicates
    const communities = communitiesNear.slice();
    const existingIds = new Set(communities.map(cc => String(cc._id)));
    for (const ac of additionalCommunities) {
      if (!existingIds.has(String(ac._id))) communities.push(ac);
    }

    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    }).select('name photo campus location').limit(20);

    res.json({ ip, geo, communities, users });
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

    const alreadyJoined = user.joinedCommunities.some(cid => cid.equals(id));
    if (alreadyJoined) {
      // Return community without incrementing membersCount
      return res.json({ community: communityDoc, alreadyJoined: true });
    }

    // Add user to community (idempotent) and increment membersCount
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
