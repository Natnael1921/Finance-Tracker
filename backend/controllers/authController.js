import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    const token = signToken(user._id);
    const { password: _, ...userData } = user.toObject();

    res.json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Register user (superadmin only)
// @route  POST /api/auth/register
// @access Private / Superadmin
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'admin' });
    const token = signToken(user._id);
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
