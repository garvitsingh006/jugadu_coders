const Pod = require('../models/Pod');
const Community = require('../models/Community');

// Create pod
exports.createPod = async (req, res) => {
  try {
    const { communityId, type, title, duration, location } = req.body;
    const userId = req.userId;

    const podDuration = duration || 1; // Default 1 hour
    const expiresAt = new Date(Date.now() + podDuration * 60 * 60 * 1000);

    const pod = await Pod.create({
      communityId,
      createdBy: userId,
      type,
      title,
      duration: podDuration,
      expiresAt,
      members: [userId],
      location,
      active: true,
      lastActivity: new Date()
    });

    // Update community activity
    await Community.findByIdAndUpdate(communityId, {
      lastActive: new Date(),
      $inc: { activityScore: 1 }
    });

    res.status(201).json({ pod });
  } catch (error) {
    console.error('Create pod error:', error);
    res.status(500).json({ error: 'Failed to create pod' });
  }
};

// Join pod
exports.joinPod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const pod = await Pod.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name photo');

    if (!pod || !pod.active || pod.expiresAt < new Date()) {
      return res.status(404).json({ error: 'Pod not available' });
    }

    res.json({ pod });
  } catch (error) {
    console.error('Join pod error:', error);
    res.status(500).json({ error: 'Failed to join pod' });
  }
};

// Get active pods
exports.getActivePods = async (req, res) => {
  try {
    const { communityId } = req.query;

    const query = {
      active: true,
      expiresAt: { $gt: new Date() }
    };

    if (communityId) {
      query.communityId = communityId;
    }

    const pods = await Pod.find(query)
      .populate('createdBy', 'name photo')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json({ pods });
  } catch (error) {
    console.error('Get active pods error:', error);
    res.status(500).json({ error: 'Failed to get active pods' });
  }
};

// Get pod by ID
exports.getPod = async (req, res) => {
  try {
    const { id } = req.params;

    const pod = await Pod.findById(id)
      .populate('members', 'name photo')
      .populate('createdBy', 'name photo')
      .populate('communityId', 'name')
      .populate('chat.sender', 'name photo');

    if (!pod) {
      return res.status(404).json({ error: 'Pod not found' });
    }

    res.json({ pod });
  } catch (error) {
    console.error('Get pod error:', error);
    res.status(500).json({ error: 'Failed to get pod' });
  }
};
