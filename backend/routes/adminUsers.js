import express from 'express';
import {
  getAllAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  updateLastLogin,
  searchAdminUsers
} from '../controllers/adminUsersController.js';

const router = express.Router();

/**
 * Admin Users Routes
 * Base path: /api/admin-users
 */

// Search route (must be before /:id to avoid conflicts)
router.get('/search', searchAdminUsers);

// CRUD routes
router.route('/')
  .get(getAllAdminUsers)      // GET /api/admin-users
  .post(createAdminUser);     // POST /api/admin-users

router.route('/:id')
  .get(getAdminUserById)      // GET /api/admin-users/:id
  .put(updateAdminUser)       // PUT /api/admin-users/:id
  .delete(deleteAdminUser);   // DELETE /api/admin-users/:id

// Special routes
router.patch('/:id/last-login', updateLastLogin);  // PATCH /api/admin-users/:id/last-login

export default router;
