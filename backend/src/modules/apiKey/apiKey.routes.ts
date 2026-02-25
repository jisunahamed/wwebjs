import { Router } from 'express';
import { ApiKeyController } from './apiKey.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createApiKeySchema } from './apiKey.schema';

const router = Router();
const controller = new ApiKeyController();

/**
 * @swagger
 * /api-keys:
 *   get:
 *     summary: List all API keys for current user
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys (without the actual key values)
 */
router.get('/', authMiddleware, controller.list);

/**
 * @swagger
 * /api-keys:
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
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
 *                 example: "My Integration Key"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: API key created. Raw key is only returned once.
 */
router.post('/', authMiddleware, validate(createApiKeySchema), controller.create);

/**
 * @swagger
 * /api-keys/{id}/revoke:
 *   patch:
 *     summary: Revoke an API key (deactivate)
 *     tags: [API Keys]
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
 *         description: API key revoked
 */
router.patch('/:id/revoke', authMiddleware, controller.revoke);

/**
 * @swagger
 * /api-keys/{id}:
 *   delete:
 *     summary: Delete an API key permanently
 *     tags: [API Keys]
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
 *         description: API key deleted
 */
router.delete('/:id', authMiddleware, controller.delete);

export default router;
