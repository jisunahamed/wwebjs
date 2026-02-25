import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import apiKeyRoutes from './modules/apiKey/apiKey.routes';
import sessionRoutes from './modules/session/session.routes';
import messageRoutes from './modules/message/message.routes';
import webhookRoutes from './modules/webhook/webhook.routes';
import settingsRoutes from './modules/settings/settings.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ─── Security & Parsing ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
    app.use(morgan('short'));
}
app.use(requestLogger);

// ─── Health Check ────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
    });
});

// ─── Swagger Docs ────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'WP Session Provider API',
}));
app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
});

// ─── API Routes ──────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/api-keys', apiKeyRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/admin', adminRoutes);

// Apply rate limiter to all API routes
app.use('/api/v1', apiRateLimiter, apiRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// ─── Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
