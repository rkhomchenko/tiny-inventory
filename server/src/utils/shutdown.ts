import { DatabaseService } from '../config/database.js';
import type { App } from '../app.js';

let isShuttingDown = false;

export async function gracefulShutdown(app: App, signal: string) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.info(`${signal} received. Gracefully shutting down.`);

    // Wait 30 seconds for existing connections to finish
    const timeout = setTimeout(() => {
        console.warn('Forcefully shutting down after 20 seconds.');
        process.exit(1); // Exit with a non-zero code to indicate an issue on shutdown
    }, 10000);

    timeout.unref();

    // Stop accepting new connections
    await app.close();
    await DatabaseService.close();

    console.log('Closed out remaining connections.');
    clearTimeout(timeout);

    process.exit(0);
}
