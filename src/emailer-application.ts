import { createServer, type Server } from 'node:http';
import { handleEmailRequest } from './email-handler.js';

export const APP_PORT = 8080;
export const EMAIL_PATH = '/Emailer/email';

const NOT_FOUND = 404;

/**
 * The Emailer HTTP service. Mirrors the Java EmailerApplication:
 * it listens on port 8080 and serves POST /Emailer/email.
 */
export class EmailerApplication {
  private readonly server: Server;

  constructor() {
    this.server = createServer((req, res) => {
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      if (path !== EMAIL_PATH) {
        res.writeHead(NOT_FOUND);
        res.end();
        return;
      }
      handleEmailRequest(req, res).catch((err: unknown) => {
        console.error('Unexpected error handling email request', err);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(APP_PORT, () => {
        this.server.off('error', reject);
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
      // Drop idle keep-alive connections so close() completes promptly.
      this.server.closeAllConnections();
    });
  }
}
