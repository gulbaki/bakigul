import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleRequest,
  isAllowedOrigin,
  validateContactPayload
} from '../worker/src/index.js';

const origin = 'https://bakigul.com';
const validPayload = {
  fullName: 'Baki Gül',
  email: 'baki@example.com',
  company: 'Baki ile AI',
  message: 'Kurumsal ekibimiz için bir AI yol haritası hazırlamak istiyoruz.',
  problem: 'Nereden başlayacağımızı bilmiyoruz. — Yapay Zeka Yol Haritası',
  source: 'AI check-up',
  website: '',
  turnstileToken: 'verified-token'
};

function postRequest(payload = validPayload, headers = {}) {
  return new Request('https://api.bakigul.com/contact', {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

function createEnv(overrides = {}) {
  const sent = [];
  return {
    sent,
    env: {
      CONTACT_TO: 'info@bakigul.com',
      CONTACT_FROM: 'website@bakigul.com',
      TURNSTILE_SECRET_KEY: 'test-secret',
      async TURNSTILE_FETCH() {
        return Response.json({
          success: true,
          hostname: 'bakigul.com',
          action: 'contact_form'
        });
      },
      EMAIL: {
        async send(message) {
          sent.push(message);
          return { messageId: 'message-123' };
        }
      },
      CONTACT_RATE_LIMITER: {
        async limit() {
          return { success: true };
        }
      },
      ...overrides
    }
  };
}

test('allows only configured website origins', () => {
  assert.equal(isAllowedOrigin('https://bakigul.com'), true);
  assert.equal(isAllowedOrigin('http://localhost:4173'), true);
  assert.equal(isAllowedOrigin('https://attacker.example'), false);
});

test('validates and normalizes contact fields', () => {
  const result = validateContactPayload({
    ...validPayload,
    fullName: '  Baki\nGül  ',
    email: ' BAKI@EXAMPLE.COM '
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.fullName, 'Baki Gül');
  assert.equal(result.data.email, 'baki@example.com');
});

test('rejects invalid contact fields', () => {
  const result = validateContactPayload({ fullName: 'A', email: 'yanlış', message: 'kısa', problem: '' });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['email', 'fullName', 'message', 'problem']);
});

test('health endpoint is public and does not expose configuration', async () => {
  const response = await handleRequest(new Request('https://api.bakigul.com/health'), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: 'baki-contact-api' });
});

test('preflight returns restricted CORS headers', async () => {
  const response = await handleRequest(
    new Request('https://api.bakigul.com/contact', { method: 'OPTIONS', headers: { Origin: origin } }),
    {}
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
});

test('rejects form submissions from unknown origins', async () => {
  const response = await handleRequest(
    postRequest(validPayload, { Origin: 'https://attacker.example' }),
    createEnv().env
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('sends a validated email with a safe reply-to address', async () => {
  const { env, sent } = createEnv();
  const response = await handleRequest(
    postRequest({ ...validPayload, message: 'Merhaba <script>alert(1)</script> yol haritası konuşalım.' }),
    env
  );

  assert.equal(response.status, 202);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'info@bakigul.com');
  assert.equal(sent[0].from.email, 'website@bakigul.com');
  assert.equal(sent[0].replyTo.email, 'baki@example.com');
  assert.doesNotMatch(sent[0].html, /<script>/);
  assert.match(sent[0].html, /&lt;script&gt;/);
});

test('prefers the private delivery target over the public alias', async () => {
  const { env, sent } = createEnv({ CONTACT_DELIVERY_TO: 'verified@example.com' });
  const response = await handleRequest(postRequest(), env);

  assert.equal(response.status, 202);
  assert.equal(sent[0].to, 'verified@example.com');
});

test('silently accepts honeypot submissions without sending email', async () => {
  const { env, sent } = createEnv();
  const response = await handleRequest(postRequest({ ...validPayload, website: 'spam.example' }), env);

  assert.equal(response.status, 202);
  assert.equal(sent.length, 0);
});

test('rejects submissions without a Turnstile token', async () => {
  const { env, sent } = createEnv();
  const response = await handleRequest(postRequest({ ...validPayload, turnstileToken: '' }), env);

  assert.equal(response.status, 403);
  assert.equal(sent.length, 0);
});

test('rejects tokens that fail Turnstile verification', async () => {
  const { env, sent } = createEnv({
    async TURNSTILE_FETCH() {
      return Response.json({ success: false, hostname: 'bakigul.com', action: 'contact_form' });
    }
  });
  const response = await handleRequest(postRequest(), env);

  assert.equal(response.status, 403);
  assert.equal(sent.length, 0);
});

test('accepts Cloudflare dummy validation responses only with the official local test secret', async () => {
  const { env, sent } = createEnv({
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
    async TURNSTILE_FETCH() {
      return Response.json({ success: true, hostname: 'localhost', action: 'test' });
    }
  });
  const response = await handleRequest(
    postRequest(validPayload, { Origin: 'http://localhost:4173' }),
    env
  );

  assert.equal(response.status, 202);
  assert.equal(sent.length, 1);
});

test('keeps hostname and action checks strict for production credentials', async () => {
  const { env, sent } = createEnv({
    async TURNSTILE_FETCH() {
      return Response.json({ success: true, hostname: 'attacker.example', action: 'test' });
    }
  });
  const response = await handleRequest(postRequest(), env);

  assert.equal(response.status, 403);
  assert.equal(sent.length, 0);
});

test('fails closed when the Turnstile secret is missing', async () => {
  const { env, sent } = createEnv({ TURNSTILE_SECRET_KEY: '' });
  const response = await handleRequest(postRequest(), env);

  assert.equal(response.status, 503);
  assert.equal(sent.length, 0);
});

test('stops requests when the Cloudflare rate limiter denies them', async () => {
  const { env, sent } = createEnv({
    CONTACT_RATE_LIMITER: {
      async limit() {
        return { success: false };
      }
    }
  });
  const response = await handleRequest(postRequest(), env);

  assert.equal(response.status, 429);
  assert.equal(sent.length, 0);
});

test('accepts native urlencoded form submissions', async () => {
  const { env, sent } = createEnv();
  const response = await handleRequest(
    new Request('https://api.bakigul.com/contact', {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(validPayload)
    }),
    env
  );

  assert.equal(response.status, 202);
  assert.equal(sent.length, 1);
});
