import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EmailerApplication } from '../src/emailer-application.js';

const BASE_URI = 'http://localhost:8080';
const EMAIL_PATH = '/Emailer/email';
const EMAIL_JSON = `{
  "email": "eddie@eddie.com",
  "subject": "Test email subject in here",
  "body": "Simple text email body"
}`;

describe('ReceiveEmailTest', () => {
  let application: EmailerApplication;
  let response: Response;

  beforeAll(async () => {
    application = new EmailerApplication();
    await application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  it('acceptsAnEmailRequest', async () => {
    await whenTheEmailIsPosted();

    thenTheResponseIsNoContent();
    thenTheResponseIsJson();
  });

  async function whenTheEmailIsPosted(): Promise<void> {
    response = await fetch(BASE_URI + EMAIL_PATH, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: EMAIL_JSON,
    });
  }

  function thenTheResponseIsNoContent(): void {
    expect(response.status).toBe(204);
  }

  function thenTheResponseIsJson(): void {
    expect(response.headers.get('content-type')).toContain('application/json');
  }
});
