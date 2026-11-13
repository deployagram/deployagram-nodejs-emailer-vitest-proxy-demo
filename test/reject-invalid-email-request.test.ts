import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EmailerApplication } from '../src/emailer-application.js';

const BASE_URI = 'http://localhost:8080';
const EMAIL_PATH = '/Emailer/email';
const MALFORMED_JSON = '{"email": "eddie@eddie.com"';

describe('RejectInvalidEmailRequestTest', () => {
  let application: EmailerApplication;
  let response: Response;

  beforeAll(async () => {
    application = new EmailerApplication();
    await application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  it('rejectsAnEmailThatIsNotValidJson', async () => {
    await whenMalformedJsonIsPosted();

    thenTheResponseIsBadRequest();
  });

  it('rejectsAnEmailRequestThatIsNotAPost', async () => {
    await whenTheEmailPathIsRequestedWithGet();

    thenTheResponseIsMethodNotAllowed();
  });

  async function whenMalformedJsonIsPosted(): Promise<void> {
    response = await fetch(BASE_URI + EMAIL_PATH, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: MALFORMED_JSON,
    });
  }

  async function whenTheEmailPathIsRequestedWithGet(): Promise<void> {
    response = await fetch(BASE_URI + EMAIL_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  }

  function thenTheResponseIsBadRequest(): void {
    expect(response.status).toBe(400);
  }

  function thenTheResponseIsMethodNotAllowed(): void {
    expect(response.status).toBe(405);
  }
});
