import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new AdminController();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats
 */
router.get('/stats', controller.getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (with optional filters)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', controller.listUsers);

/**
 * @swagger
 * /admin/users/{id}/approve:
 *   post:
 *     summary: Approve a pending user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/users/:id/approve', controller.approveUser);

/**
 * @swagger
 * /admin/users/{id}/reject:
 *   delete:
 *     summary: Reject and remove a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/users/:id/reject', controller.rejectUser);

/**
 * @swagger
 * /admin/users/{id}/toggle-active:
 *   patch:
 *     summary: Toggle user active/inactive status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/users/:id/toggle-active', controller.toggleUserActive);

/**
 * @swagger
 * /admin/users/{id}/plan:
 *   patch:
 *     summary: Update user plan and session limit
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/users/:id/plan', controller.updateUserPlan);

export default router;
