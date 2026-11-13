/**
 * Ports and URLs shared by the tests. The Proxy's own port is not fixed: each suite reads it from
 * the Deployagram environment, so no port has to be reserved.
 */
export const APP_PORT = 8080;

/**
 * The address the Proxy (in Docker) uses to reach the Emailer (on this machine).
 * host.docker.internal resolves to the host on Docker Desktop.
 */
export const APP_URL_FOR_PROXY = `http://host.docker.internal:${APP_PORT}`;

export const EMAILER_EMAIL_PATH = '/Emailer/email';

/** Proxy settings that route EmailClient -> Emailer through the Proxy. Posted before each test. */
export const PROXY_CONFIG = {
  'proxy.namesOfSourceApps.Emailer/email': 'EmailClient',
  'proxy.proxiedAppNames.Emailer/email': 'Emailer',
  'proxy.proxiedApps.Emailer/email': `${APP_URL_FOR_PROXY}${EMAILER_EMAIL_PATH}`,
};
