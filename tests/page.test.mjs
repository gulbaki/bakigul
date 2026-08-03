import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('page has one primary heading and all notebook section targets', () => {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  for (const id of ['services', 'checkup', 'use-cases', 'about', 'blog', 'contact']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('notebook navigation links to services, check-up, writing, and contact', () => {
  assert.match(html, /href="#services"[^>]*>Çalışma alanları/);
  assert.match(html, /href="#checkup"[^>]*>AI check-up/);
  assert.match(html, /href="#blog"[^>]*>Yazılar/);
  assert.match(html, /href="#contact"[^>]*>İletişim/);
});

test('header uses the Baki ile AI brand logo', () => {
  assert.match(html, /src="\.\/assets\/baki-ile-ai-logo\.png"/);
  assert.match(html, /alt="Baki ile AI"/);
  assert.doesNotMatch(html, /class="brand-monogram"/);
});

test('hero contains a working note with four consulting principles', () => {
  assert.match(html, /class="working-note"/);
  assert.equal((html.match(/class="principle-item"/g) ?? []).length, 4);
  assert.match(html, /Önce problem/);
  assert.match(html, /Ölç, düzelt, büyüt/);
});

test('page exposes three accessible problem choices and a recommendation note', () => {
  assert.equal((html.match(/data-problem-button=/g) ?? []).length, 3);
  assert.equal((html.match(/aria-pressed=/g) ?? []).length, 3);
  assert.match(html, /data-recommendation/);
  assert.match(html, /class="consultant-note"/);
});

test('AI check-up includes an accessible contact form wired to the Worker', () => {
  assert.match(html, /data-contact-form/);
  assert.match(html, /action="https:\/\/api\.bakigul\.com\/contact"/);
  assert.match(html, /name="fullName"[^>]*required/);
  assert.match(html, /name="email"[^>]*required/);
  assert.match(html, /name="message"[^>]*required/);
  assert.match(html, /data-selected-problem-input/);
  assert.match(html, /name="website"[^>]*tabindex="-1"/);
  assert.match(html, /role="status"[^>]*aria-live="polite"/);
});

test('page contains a notebook blog section with fallback article content', () => {
  assert.match(html, /data-bind-list="blog-posts"/);
  assert.match(html, /article-card--featured/);
  assert.equal((html.match(/class="article-card/g) ?? []).length, 4);
  assert.match(html, /CLAUDE SİLMELİSİN\./);
  assert.match(html, /Bütün yazıları gör/);
});

test('contact section exposes the tear-off contact form', () => {
  assert.match(html, /class="tear-off-contact"/);
  assert.match(html, /class="checkup-contact"/);
  assert.match(html, /id="checkup-contact-title"/);
  assert.match(html, /data-contact-form/);
});

test('page includes assets, metadata, and a no-script fallback', () => {
  assert.match(html, /assets\/styles\.css/);
  assert.match(html, /type="module" src="\.\/assets\/app\.js"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /name="theme-color" content="#f7f1e7"/i);
  assert.match(html, /G-7ERQF3DF3M/);
  assert.match(html, /assets\/favicon\.svg/);
});


test('all local page asset references exist', async () => {
  const localRefs = [...html.matchAll(/(?:href|src)="(\.\/assets\/[^"]+)"/g)].map(([, path]) => path);
  assert.ok(localRefs.length >= 2);
  for (const path of localRefs) {
    await access(new URL(`../${path.replace('./', '')}`, import.meta.url));
  }
});
