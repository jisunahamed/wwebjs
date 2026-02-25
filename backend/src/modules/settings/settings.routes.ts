import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateSettingsSchema } from './settings.schema';

const router = Router();
const controller = new SettingsController();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get current anti-block settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current settings with recommended defaults
 */
router.get('/', authMiddleware, controller.get);

/**
 * @swagger
 * /settings:
 *   patch:
 *     summary: Update anti-block settings
 *     description: Returns warnings if settings are risky. Set riskAcknowledged=true to override.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minDelayBetweenMsgs:
 *                 type: integer
 *                 example: 3000
 *               maxMsgsPerMinute:
 *                 type: integer
 *                 example: 12
 *               typingDelay:
 *                 type: boolean
 *               riskAcknowledged:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated
 *       400:
 *         description: Risky settings detected, requires acknowledgment
 */
router.patch('/', authMiddleware, validate(updateSettingsSchema), controller.update);

/**
 * @swagger
 * /settings/reset:
 *   post:
 *     summary: Reset settings to recommended defaults
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset to defaults
 */
router.post('/reset', authMiddleware, controller.reset);

/**
 * @swagger
 * /settings/defaults:
 *   get:
 *     summary: Get recommended defaults and risk thresholds
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Default values and risk thresholds
 */
router.get('/defaults', controller.getDefaults);

export default router;
