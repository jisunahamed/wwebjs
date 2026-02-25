import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { prisma } from './config/database';

// Import workers to start them
import './workers/message.worker';
import './workers/webhook.worker';
import './workers/session.worker';

const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`📚 Swagger docs: http://localhost:${config.port}/api-docs`);
    logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info('HTTP server closed');

        try {
            await prisma.$disconnect();
            logger.info('Database disconnected');
        } catch (err) {
            logger.error('Error disconnecting database:', err);
        }

        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after 30s timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

export default server;
