import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('superadmin'), register);
router.get('/me', protect, getMe);

export default router;
