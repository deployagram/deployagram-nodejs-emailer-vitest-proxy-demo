import { EmailerApplication, APP_PORT, EMAIL_PATH } from './emailer-application.js';

const application = new EmailerApplication();
await application.start();
console.info(`Emailer listening on port ${APP_PORT} at ${EMAIL_PATH}`);

const shutdown = (): void => {
  application.stop().finally(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
