import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createWebhookSchema, updateWebhookSchema } from './webhook.schema';

const router = Router();
const controller = new WebhookController();

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: List all webhooks
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 */
router.get('/', authMiddleware, controller.list);

/**
 * @swagger
 * /webhooks:
 *   post:
 *     summary: Create a webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, events]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://myapp.com/webhook"
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [message.received, message.sent, message.failed, session.connected, session.disconnected, session.qr]
 *     responses:
 *       201:
 *         description: Webhook created with secret
 */
router.post('/', authMiddleware, validate(createWebhookSchema), controller.create);

/**
 * @swagger
 * /webhooks/{id}:
 *   get:
 *     summary: Get webhook details (includes secret)
 *     tags: [Webhooks]
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
 *         description: Webhook details
 */
router.get('/:id', authMiddleware, controller.getById);

/**
 * @swagger
 * /webhooks/{id}:
 *   patch:
 *     summary: Update a webhook
 *     tags: [Webhooks]
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
 *         description: Webhook updated
 */
router.patch('/:id', authMiddleware, validate(updateWebhookSchema), controller.update);

/**
 * @swagger
 * /webhooks/{id}:
 *   delete:
 *     summary: Delete a webhook
 *     tags: [Webhooks]
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
 *         description: Webhook deleted
 */
router.delete('/:id', authMiddleware, controller.delete);

/**
 * @swagger
 * /webhooks/{id}/regenerate-secret:
 *   post:
 *     summary: Regenerate webhook secret
 *     tags: [Webhooks]
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
 *         description: New secret generated
 */
router.post('/:id/regenerate-secret', authMiddleware, controller.regenerateSecret);

export default router;
