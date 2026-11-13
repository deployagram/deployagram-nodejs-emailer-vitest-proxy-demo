import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { useDeployagram } from '@deployagram/vitest';
import { EmailerApplication } from '../src/emailer-application.js';
import { EMAILER_EMAIL_PATH, PROXY_CONFIG } from './environment.js';

const EMAIL_JSON = `{
  "email": "eddie@eddie.com",
  "subject": "Test email subject in here",
  "body": "Simple text email body"
}`;

describe('ReceiveEmailTest', () => {
  const deployagram = useDeployagram({ name: 'ReceiveEmailTest', proxyConfig: PROXY_CONFIG });

  let application: EmailerApplication;
  let response: Response;

  beforeAll(async () => {
    application = new EmailerApplication();
    await application.start();
  });

  afterAll(async () => {
    await application?.stop();
  });

  it('acceptsAnEmailRequest', async () => {
    await whenTheEmailIsPosted();

    thenTheResponseIsNoContent();
    thenTheResponseIsJson();
  });

  async function whenTheEmailIsPosted(): Promise<void> {
    response = await fetch(deployagram.proxyUrl + EMAILER_EMAIL_PATH, {
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
