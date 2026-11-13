/**
 * The request body accepted by the Emailer.
 * Mirrors the Java `Email` record: a missing or null field is kept as null.
 */
export interface Email {
  email: string | null;
  subject: string | null;
  body: string | null;
}

/** Thrown when a request body cannot be read as an Email. */
export class MalformedEmailError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'MalformedEmailError';
  }
}

const FIELDS = ['email', 'subject', 'body'] as const;

/**
 * Parses a raw request body into an Email.
 *
 * Follows the Jackson behaviour of the Java original:
 * - the body must be valid JSON and a JSON object;
 * - unknown properties are rejected;
 * - missing fields become null;
 * - strings and null are accepted; numbers and booleans are coerced to strings;
 *   objects and arrays are rejected.
 */
export function parseEmail(rawBody: string): Email {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch (e) {
    throw new MalformedEmailError(e instanceof Error ? e.message : 'invalid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new MalformedEmailError('expected a JSON object');
  }

  const fields = parsed as Record<string, unknown>;
  for (const key of Object.keys(fields)) {
    if (!(FIELDS as readonly string[]).includes(key)) {
      throw new MalformedEmailError(`unrecognised property "${key}"`);
    }
  }

  return {
    email: toNullableString(fields.email, 'email'),
    subject: toNullableString(fields.subject, 'subject'),
    body: toNullableString(fields.body, 'body'),
  };
}

function toNullableString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  throw new MalformedEmailError(`property "${field}" must be a scalar value`);
}
