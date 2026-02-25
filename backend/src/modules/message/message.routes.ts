import { Router } from 'express';
import { MessageController } from './message.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new MessageController();

/**
 * @swagger
 * /messages/stats:
 *   get:
 *     summary: Get message statistics for current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Message count by status
 */
router.get('/stats', authMiddleware, controller.getStats);

/**
 * @swagger
 * /messages/session/{sessionId}:
 *   get:
 *     summary: List messages for a session
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [QUEUED, PROCESSING, SENT, DELIVERED, READ, FAILED]
 *     responses:
 *       200:
 *         description: Paginated list of messages
 */
router.get('/session/:sessionId', authMiddleware, controller.listBySession);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Get message details
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message details
 */
router.get('/:id', authMiddleware, controller.getById);

export default router;
