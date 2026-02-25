import { Router } from 'express';
import { SessionController } from './session.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createSessionSchema, sendMessageSchema } from './session.schema';

const router = Router();
const controller = new SessionController();

// ─── Dashboard Routes (JWT Auth) ────────────────────────────────────────

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: List all sessions for current user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/', authMiddleware, controller.list);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new WhatsApp session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Business Line"
 *     responses:
 *       201:
 *         description: Session created, QR will be generated
 *       429:
 *         description: Session limit reached
 */
router.post('/', authMiddleware, validate(createSessionSchema), controller.create);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
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
 *         description: Session details
 */
router.get('/:id', authMiddleware, controller.getById);

/**
 * @swagger
 * /sessions/{id}/qr:
 *   get:
 *     summary: Get QR code for session
 *     tags: [Sessions]
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
 *         description: QR code data
 */
router.get('/:id/qr', authMiddleware, controller.getQrCode);

/**
 * @swagger
 * /sessions/{id}/reconnect:
 *   post:
 *     summary: Reconnect a disconnected session
 *     tags: [Sessions]
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
 *         description: Reconnect initiated
 */
router.post('/:id/reconnect', authMiddleware, controller.reconnect);

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Delete and terminate a session
 *     tags: [Sessions]
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
 *         description: Session deleted
 */
router.delete('/:id', authMiddleware, controller.delete);

// ─── External API Routes (API Key Auth) ─────────────────────────────────

/**
 * @swagger
 * /sessions/api/send:
 *   post:
 *     summary: Send a message via API key
 *     tags: [External API]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, to, body]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *               to:
 *                 type: string
 *                 example: "8801712345678"
 *               body:
 *                 type: string
 *                 example: "Hello from API!"
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, DOCUMENT, VIDEO, AUDIO]
 *               mediaUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Message queued
 *       400:
 *         description: Session not connected
 */
router.post('/api/send', apiKeyMiddleware, validate(sendMessageSchema), controller.sendMessage);

/**
 * @swagger
 * /sessions/api/status/{sessionId}:
 *   get:
 *     summary: Get session status via API key
 *     tags: [External API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status
 */
router.get('/api/status/:sessionId', apiKeyMiddleware, controller.getStatus);

export default router;
