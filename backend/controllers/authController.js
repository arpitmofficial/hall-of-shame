const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, password, role, adminPasscode } = req.body;
    
    // Check passcode if they want to be an admin
    if (role === 'admin') {
      if (adminPasscode !== 'cheetah') {
        return res.status(403).json({ success: false, error: 'Invalid Council Passcode!' });
      }
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Bro, this number is already registered. Stop trying to smurf!' });
    }
    const user = await User.create({ name, phone, password, role: role || 'bro' });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: { _id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'New phone who dis? Number not found. Go register first!' });
    }
    
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Wrong password! Stop trying to hack your roommate.' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      data: { _id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc  Get logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc  Get all users (for player selection in match/competition creation)
// @route GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { register, login, getMe, getUsers };
