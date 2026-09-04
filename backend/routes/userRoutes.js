import express from 'express';
import { getUsers, createUser, deleteUser, toggleUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('superadmin')); // All user management requires superadmin

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/toggle', toggleUser);
router.delete('/:id', deleteUser);

export default router;
