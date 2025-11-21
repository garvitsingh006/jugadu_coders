const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { getLocationFromIP } = require('../services/geoService');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Send OTP for registration
exports.sendOTP = async (req, res) => {
  try {
    console.log('📧 Send OTP request received:', { email: req.body.email, name: req.body.name });
    const { name, email, password, campus } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP for', email, ':', otp);

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save OTP and user data
    await OTP.create({
      email,
      otp,
      userData: { name, email, password, campus }
    });
    console.log('💾 OTP saved to database');

    // Send OTP email
    console.log('📤 Sending OTP email...');
    await emailService.sendOTP(email, otp, name);
    console.log('✅ OTP email sent successfully');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { name, password, campus } = otpRecord.userData;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      campus
    });

    // Set location from IP
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.connection.remoteAddress ||
                  req.socket.remoteAddress ||
                  null;
      if (ip) {
        user.lastIp = ip;
        const geo = await getLocationFromIP(ip);
        if (geo && geo.lat !== undefined && geo.lng !== undefined) {
          user.location = {
            type: 'Point',
            coordinates: [geo.lng, geo.lat]
          };
        }
        await user.save();
      }
    } catch (err) {
      console.error('Failed to set user location from IP:', err.message || err);
    }

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus
      },
      token
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update user's lastIp and location from IP on login
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.connection.remoteAddress ||
                  req.socket.remoteAddress ||
                  null;
      if (ip) {
        const geo = await getLocationFromIP(ip);
        const update = { lastIp: ip };
        if (geo && geo.lat !== undefined && geo.lng !== undefined) {
          update.location = {
            type: 'Point',
            coordinates: [geo.lng, geo.lat]
          };
        }
        await User.findByIdAndUpdate(user._id, update);
      }
    } catch (err) {
      console.error('Failed to update user location from IP:', err.message || err);
    }

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    let user = await User.findById(req.userId)
      .select('-password')
      .populate({
        path: 'joinedCommunities',
        select: 'name tags membersCount visibility createdBy',
        populate: { path: 'createdBy', select: 'name' }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert to plain object so we can add isAdmin flag per community
    const userObj = user.toObject();
    userObj.joinedCommunities = (userObj.joinedCommunities || []).map((c) => ({
      ...c,
      isAdmin: c.createdBy && String(c.createdBy._id) === String(userObj._id)
    }));

    res.json({ user: userObj });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
