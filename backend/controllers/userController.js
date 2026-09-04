import User from '../models/User.js';

// @desc   Get all users
// @route  GET /api/users
// @access Private / Superadmin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create new admin user
// @route  POST /api/users
// @access Private / Superadmin
export const createUser = async (req, res) => {
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
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Toggle user active status
// @route  PATCH /api/users/:id/toggle
// @access Private / Superadmin
export const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate superadmin' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Private / Superadmin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot delete superadmin' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
