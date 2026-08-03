const DEFAULT_ALLOWED_ORIGINS = [
  'https://bakigul.com',
  'https://www.bakigul.com',
  'https://gulbaki.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const MAX_BODY_BYTES = 16 * 1024;
const DEFAULT_TO = 'info@bakigul.com';
const DEFAULT_FROM = 'website@bakigul.com';

function cleanSingleLine(value, maxLength) {
  return String(value ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value, maxLength) {
  return String(value ?? '')
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function configuredOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS);
}

export function isAllowedOrigin(origin, env = {}) {
  return typeof origin === 'string' && configuredOrigins(env).has(origin);
}

export function validateContactPayload(payload) {
  const data = {
    fullName: cleanSingleLine(payload?.fullName, 100),
    email: cleanSingleLine(payload?.email, 254).toLowerCase(),
    company: cleanSingleLine(payload?.company, 120),
    message: cleanMessage(payload?.message, 2000),
    problem: cleanSingleLine(payload?.problem, 240),
    source: cleanSingleLine(payload?.source, 80),
    website: cleanSingleLine(payload?.website, 200)
  };

  const errors = {};
  if (data.fullName.length < 2) errors.fullName = 'Ad soyad en az 2 karakter olmalı.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Geçerli bir e-posta adresi girin.';
  if (data.message.length < 20) errors.message = 'Mesaj en az 20 karakter olmalı.';
  if (data.problem.length === 0) errors.problem = 'Seçilen problem bilgisi eksik.';

  return {
    ok: Object.keys(errors).length === 0,
    data,
    errors,
    isBot: data.website.length > 0
  };
}

function responseHeaders(origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff'
  };

  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin)
  });
}

async function parsePayload(request) {
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return { error: 'Form verisi izin verilen boyutu aşıyor.', status: 413 };
  }

  const contentType = request.headers.get('Content-Type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      return { payload: JSON.parse(rawBody) };
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      return { payload: Object.fromEntries(new URLSearchParams(rawBody)) };
    }
  } catch {
    return { error: 'Form verisi okunamadı.', status: 400 };
  }

  return { error: 'Desteklenmeyen form biçimi.', status: 415 };
}

function emailContent(data) {
  const company = data.company || 'Belirtilmedi';
  const source = data.source || 'Web sitesi';
  const safeMessage = escapeHtml(data.message).replaceAll('\n', '<br />');

  return {
    subject: `[Baki ile AI] ${data.fullName} — yeni iletişim talebi`,
    text: [
      'Yeni iletişim talebi',
      '',
      `Ad soyad: ${data.fullName}`,
      `E-posta: ${data.email}`,
      `Şirket: ${company}`,
      `Seçilen konu: ${data.problem}`,
      `Kaynak: ${source}`,
      '',
      'Mesaj:',
      data.message
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#2f2925">
        <div style="padding:24px;background:#2f2925;color:#fffaf2">
          <p style="margin:0 0 6px;color:#e8b7a1;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Baki ile AI</p>
          <h1 style="margin:0;font-size:26px">Yeni iletişim talebi</h1>
        </div>
        <div style="padding:24px;background:#fff8ea">
          <p><strong>Ad soyad:</strong> ${escapeHtml(data.fullName)}</p>
          <p><strong>E-posta:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Şirket:</strong> ${escapeHtml(company)}</p>
          <p><strong>Seçilen konu:</strong> ${escapeHtml(data.problem)}</p>
          <p><strong>Kaynak:</strong> ${escapeHtml(source)}</p>
          <hr style="border:0;border-top:1px solid #d8c7b5;margin:24px 0" />
          <p style="line-height:1.7">${safeMessage}</p>
        </div>
      </div>`
  };
}

async function sendContactEmail(env, data) {
  if (!env.EMAIL?.send) throw new Error('Email binding is not configured.');

  const content = emailContent(data);
  return env.EMAIL.send({
    to: env.CONTACT_TO || DEFAULT_TO,
    from: {
      email: env.CONTACT_FROM || DEFAULT_FROM,
      name: 'Baki ile AI Web Sitesi'
    },
    replyTo: {
      email: data.email,
      name: data.fullName
    },
    subject: content.subject,
    text: content.text,
    html: content.html
  });
}

export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (request.method === 'GET' && url.pathname === '/health') {
    return jsonResponse({ ok: true, service: 'baki-contact-api' }, 200, null);
  }

  if (url.pathname !== '/contact') {
    return jsonResponse({ ok: false, message: 'Endpoint bulunamadı.' }, 404, null);
  }

  const originAllowed = isAllowedOrigin(origin, env);

  if (request.method === 'OPTIONS') {
    if (!originAllowed) return jsonResponse({ ok: false, message: 'Origin reddedildi.' }, 403, null);

    const headers = responseHeaders(origin);
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Yalnızca POST desteklenir.' }, 405, originAllowed ? origin : null);
  }

  if (!originAllowed) {
    return jsonResponse({ ok: false, message: 'Bu kaynaktan gönderime izin verilmiyor.' }, 403, null);
  }

  if (env.CONTACT_RATE_LIMITER?.limit) {
    const rateLimit = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${origin}` });
    if (!rateLimit.success) {
      return jsonResponse(
        { ok: false, message: 'Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin.' },
        429,
        origin
      );
    }
  }

  const parsed = await parsePayload(request);
  if (parsed.error) return jsonResponse({ ok: false, message: parsed.error }, parsed.status, origin);

  const validation = validateContactPayload(parsed.payload);

  // Botlara başarılı cevap verilir; e-posta gönderilmez.
  if (validation.isBot) return jsonResponse({ ok: true }, 202, origin);

  if (!validation.ok) {
    return jsonResponse(
      { ok: false, message: 'Form alanlarını kontrol edin.', errors: validation.errors },
      422,
      origin
    );
  }

  try {
    const result = await sendContactEmail(env, validation.data);
    return jsonResponse({ ok: true, messageId: result?.messageId }, 202, origin);
  } catch (error) {
    console.error('Contact email delivery failed', {
      code: error?.code ?? 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return jsonResponse(
      { ok: false, message: 'Mesaj şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin.' },
      502,
      origin
    );
  }
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  }
};
