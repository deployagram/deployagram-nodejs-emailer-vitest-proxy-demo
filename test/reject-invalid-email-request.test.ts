import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { useDeployagram } from '@deployagram/vitest';
import { EmailerApplication } from '../src/emailer-application.js';
import { EMAILER_EMAIL_PATH, PROXY_CONFIG } from './environment.js';

const MALFORMED_JSON = '{"email": "eddie@eddie.com"';

describe('RejectInvalidEmailRequestTest', () => {
  const deployagram = useDeployagram({ name: 'RejectInvalidEmailRequestTest', proxyConfig: PROXY_CONFIG });

  let application: EmailerApplication;
  let response: Response;

  beforeAll(async () => {
    application = new EmailerApplication();
    await application.start();
  });

  afterAll(async () => {
    await application?.stop();
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
    response = await fetch(deployagram.proxyUrl + EMAILER_EMAIL_PATH, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: MALFORMED_JSON,
    });
  }

  async function whenTheEmailPathIsRequestedWithGet(): Promise<void> {
    response = await fetch(deployagram.proxyUrl + EMAILER_EMAIL_PATH, {
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
