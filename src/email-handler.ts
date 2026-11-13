import type { IncomingMessage, ServerResponse } from 'node:http';
import { type Email, MalformedEmailError, parseEmail } from './email.js';

const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const METHOD_NOT_ALLOWED = 405;

/**
 * Handles POST /Emailer/email.
 * Mirrors the Java EmailHandler: 204 for a valid email, 400 for a malformed body,
 * 405 for any method other than POST.
 */
export async function handleEmailRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    respondWith(METHOD_NOT_ALLOWED, res);
    return;
  }

  try {
    const email = parseEmail(await readBody(req));
    logReceipt(email);
    respondWith(NO_CONTENT, res);
  } catch (e) {
    if (e instanceof MalformedEmailError) {
      console.warn(`Rejected malformed email request: ${e.message}`);
      respondWith(BAD_REQUEST, res);
      return;
    }
    throw e;
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function logReceipt(email: Email): void {
  console.info(
    `Received email for ${email.email} with subject "${email.subject}": ${email.body}`,
  );
}

function respondWith(statusCode: number, res: ServerResponse): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end();
}
