# Deployagram Node.js Emailer Demo

A minimal Node.js 22 / TypeScript HTTP service, built with only the Node standard library, and a
service test suite. It is the Node.js port of
[`deployagram-java-emailer-demo`](../../java/deployagram-java-emailer-demo) at commit `1491c58`
("Built app"). The application is unchanged; the tests are instrumented with Deployagram (see below).

The application plays the part of an **Emailer**: it accepts a request to send an email and logs
it. It does not actually send anything.

## What it does

The application listens on port `8080` for one request:

```
POST /Emailer/email
Accept: application/json
Content-Type: application/json

{
  "email": "random@anemail.com",
  "subject": "Any subject is valid",
  "body": "Plain text body for an email"
}
```

| Situation                | Response                                           |
|--------------------------|----------------------------------------------------|
| Valid request            | `204 No Content`, `Content-Type: application/json` |
| Body is not valid JSON   | `400 Bad Request`                                  |
| Any method except `POST` | `405 Method Not Allowed`                           |
| Any other path           | `404 Not Found`                                    |

On a valid request it writes a line to the console:

```
Received email for random@anemail.com with subject "Any subject is valid": Plain text body for an email
```

## Tech

* Node.js 22+, TypeScript (strict mode), compiled with `tsc`
* `node:http` for the server (no framework), built-in `fetch` for the tests
* Vitest for the service tests

## Project layout

```
src/
    main.ts                   starts the Emailer on port 8080
    emailer-application.ts    HTTP server, routing, start/stop
    email-handler.ts          handles POST /Emailer/email
    email.ts                  the request body type and its parser
test/
    receive-email.test.ts                 service test for a valid request
    reject-invalid-email-request.test.ts  service test for the 400 and 405 responses
```

## Run the application

```bash
npm install
npm run build
npm start
```

Then, from another terminal:

```bash
curl -i -X POST http://localhost:8080/Emailer/email \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"email":"test@deployagram.com","subject":"Hello","body":"World"}'
```

## Run the tests

```bash
npm test
```

Both test files are black-box service tests. Each starts `EmailerApplication` in-process on port
`8080`, and calls it over HTTP through the Deployagram HTTP Proxy. The files run one after another (`fileParallelism: false` in
`vitest.config.ts`) because they share that port. Log output is not asserted.

* `receive-email.test.ts` POSTs a valid email and asserts a `204` with a JSON `Content-Type`.
* `reject-invalid-email-request.test.ts` asserts a `400` for a body that is not valid JSON, and a
  `405` for a request that is not a `POST`.

The tests follow the same Gherkin-style structure as the Java originals: each test is a `when...`
step followed by `then...` steps, each a small named helper.

## Notes on the port

The Java original uses Jackson. Its behaviour is reproduced in `src/email.ts`:

* A body that is not a JSON object is rejected with `400`.
* Unknown properties are rejected with `400` (Jackson's default).
* Missing fields are read as `null`.
* Numbers and booleans are coerced to strings; objects and arrays are rejected with `400`.

One deliberate difference: Java throws an unhandled exception (no response) for a body of `null`.
Here it is a `400`.

## Deployagram instrumentation

The tests are instrumented with `@deployagram/vitest` (in the `node` monorepo). The test
traffic goes through the Deployagram HTTP Proxy, and the Collector records it.

```
  ReceiveEmailTest ──► Deployagram HTTP Proxy (Docker) ──► EmailerApplication
  (plays "EmailClient")                                    (test process, port 8080)
                                  │
                                  ▼
                              Collector ──► Deployagram Cloud (when flushed)
```

* `test/receive-email.test.ts` and `test/reject-invalid-email-request.test.ts` call
  `useDeployagram({ name, proxyConfig })`. The config (`test/environment.ts`) names the caller
  `EmailClient` and the callee `Emailer`.
* `test/deployagram.global-setup.ts` starts the environment once per run and stops what it started
  at the end.
* The environment is found or started by `@deployagram/environment`: a configured URL first, then a
  running container, then a new one.

### Running

Requirements: Docker, the Proxy and Collector images, and the licence. `.env` and `.deployagram`
are read from this directory and are kept out of git.

```bash
npm install
npm test
```

`npm test` loads `.env` with `node --env-file-if-exists`. A Collector already running on
`DEPLOYAGRAM_LOGGER_URL` (or in Docker) is reused, and the Proxy is started if none is running.

### Packages

`@deployagram/vitest` (and the packages it depends on) are installed from npm. Source is in the
`node` monorepo.
