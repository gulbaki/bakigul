import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findPreset,
  recommendationMarkup,
  selectionState,
  tagListMarkup,
  serviceListMarkup,
  numberedListMarkup,
  heroTitleMarkup,
  blogCardsMarkup,
  problemContactValue,
  resolveContactEndpoint,
  resolveTurnstileSiteKey,
  contactPayloadFromEntries
} from '../assets/app.js';

test('findPreset falls back to the first preset', () => {
  assert.equal(findPreset('missing').id, 'baslangic');
});

test('recommendationMarkup includes all recommendation fields', () => {
  const html = recommendationMarkup(findPreset('rag-agent'));
  assert.match(html, /Architecture Review/);
  assert.match(html, /retrieval/i);
  assert.match(html, /ölçülebilir/i);
});

test('selectionState marks only one button pressed', () => {
  assert.deepEqual(selectionState(['a', 'b', 'c'], 'b'), [false, true, false]);
});

test('problemContactValue carries the selected problem into the form', () => {
  assert.equal(
    problemContactValue(findPreset('ekip')),
    'Ekibimiz Yapay Zeka araçlarından yeterince verim alamıyor. — Kurumsal Yapay Zeka Workshop'
  );
});

test('resolveContactEndpoint uses the local Worker during development', () => {
  assert.equal(resolveContactEndpoint('https://api.bakigul.com/contact', 'localhost'), 'http://localhost:8787/contact');
  assert.equal(resolveContactEndpoint('https://api.bakigul.com/contact', 'bakigul.com'), 'https://api.bakigul.com/contact');
  assert.throws(() => resolveContactEndpoint('http://api.example.com/contact', 'bakigul.com'), /HTTPS/);
});

test('resolveTurnstileSiteKey uses Cloudflare test credentials only on localhost', () => {
  assert.equal(resolveTurnstileSiteKey('production-key', 'localhost'), '1x00000000000000000000AA');
  assert.equal(resolveTurnstileSiteKey('production-key', 'bakigul.com'), 'production-key');
  assert.equal(resolveTurnstileSiteKey('', 'bakigul.com'), '');
});

test('contactPayloadFromEntries keeps only expected form fields', () => {
  const payload = contactPayloadFromEntries([
    ['fullName', 'Baki Gül'],
    ['email', 'baki@example.com'],
    ['cf-turnstile-response', 'verified-token'],
    ['unknown', 'ignored']
  ]);
  assert.equal(payload.fullName, 'Baki Gül');
  assert.equal(payload.email, 'baki@example.com');
  assert.equal(payload.turnstileToken, 'verified-token');
  assert.equal('unknown' in payload, false);
});


test('tagListMarkup renders every expertise tag', () => {
  const html = tagListMarkup(['RAG', 'AI Agent']);
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
  assert.match(html, /AI Agent/);
});

test('serviceListMarkup renders numbered service copy', () => {
  const html = serviceListMarkup([{ number: '01', title: 'AI Yol Haritası', description: 'Önceliklendirme.' }]);
  assert.match(html, /service-number/);
  assert.match(html, /AI Yol Haritası/);
  assert.match(html, /Önceliklendirme/);
});

test('numberedListMarkup renders indexed use cases', () => {
  const html = numberedListMarkup(['Doküman asistanı', 'E-posta agentı']);
  assert.match(html, /01/);
  assert.match(html, /02/);
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
});


test('heroTitleMarkup preserves the editorial emphasis', () => {
  const html = heroTitleMarkup({ titleLead: 'Şirketinizde', titleEmphasis: 'nerede', titleTail: 'buluyorum.' });
  assert.match(html, /Şirketinizde/);
  assert.match(html, /<em>nerede<\/em>/);
  assert.match(html, /buluyorum\./);
});


test('blogCardsMarkup renders one featured and three compact article cards', () => {
  const html = blogCardsMarkup([
    { category: 'Agent', title: 'Öne çıkan', excerpt: 'Açıklama', label: 'Son yazı', url: 'https://example.com/1', featured: true },
    { category: 'RAG', title: 'İkinci', excerpt: 'Açıklama', label: 'Okuma notu', url: 'https://example.com/2', featured: false },
    { category: 'Araçlar', title: 'Üçüncü', excerpt: 'Açıklama', label: 'Rehber', url: 'https://example.com/3', featured: false },
    { category: 'Strateji', title: 'Dördüncü', excerpt: 'Açıklama', label: 'Not', url: 'https://example.com/4', featured: false }
  ]);
  assert.equal((html.match(/<article class="article-card/g) ?? []).length, 4);
  assert.equal((html.match(/article-card--featured/g) ?? []).length, 1);
  assert.match(html, /Öne çıkan/);
  assert.match(html, /Üçüncü/);
});

test('blogCardsMarkup escapes article copy and rejects unsafe link schemes', () => {
  const html = blogCardsMarkup([
    { category: '<b>AI</b>', title: '<script>alert(1)</script>', excerpt: 'A & B', label: 'Yeni', url: 'javascript:alert(1)', featured: true }
  ]);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /A &amp; B/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /href="#blog"/);
});
