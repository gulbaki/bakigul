import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../assets/styles.css', import.meta.url), 'utf8');

test('defines the exact Claude Notebook palette and typography stacks', () => {
  for (const token of ['#f7f1e7', '#efe4d5', '#2f2925', '#6f6258', '#d97757', '#8f4c37', '#e8b7a1']) {
    assert.match(css.toLowerCase(), new RegExp(token));
  }
  assert.match(css, /--font-handwritten:[^;]*Segoe Print[^;]*Bradley Hand[^;]*Comic Sans MS/i);
  assert.match(css, /--font-editorial:[^;]*Georgia[^;]*Times New Roman/i);
});

test('builds notebook paper, ruled sections, tape, and handwritten annotation treatments', () => {
  assert.match(css, /\.notebook-spread\s*\{/);
  assert.match(css, /\.ruled-section\s*\{/);
  assert.match(css, /repeating-linear-gradient/);
  assert.match(css, /\.tape\s*\{/);
  assert.match(css, /\.handwritten-caption/);
  assert.match(css, /\.margin-note/);
});

test('styles worksheet selected and accessible focus states', () => {
  assert.match(css, /\.problem-button\[aria-pressed="true"\]/);
  assert.match(css, /\.checkbox-mark/);
  assert.match(css, /:focus-visible/);
});

test('styles the check-up contact form and submission states', () => {
  assert.match(css, /\.checkup-contact\s*\{/);
  assert.match(css, /\.contact-form-card\s*\{/);
  assert.match(css, /\.contact-form-submit\s*\{/);
  assert.match(css, /\.form-status\[data-state="success"\]/);
  assert.match(css, /\.form-status\[data-state="error"\]/);
});

test('defines featured blog grid and tear-off contact page', () => {
  assert.match(css, /\.blog-grid\s*\{/);
  assert.match(css, /\.article-card--featured\s*\{[^}]*grid-row:\s*1\s*\/\s*span\s*3/s);
  assert.match(css, /\.tear-off-contact\s*\{/);
  assert.match(css, /\.perforation\s*\{/);
});

test('includes tablet, mobile, reduced-motion, and overflow protections', () => {
  assert.match(css, /overflow-x:\s*(?:hidden|clip)/);
  assert.match(css, /@media\s*\(max-width:\s*960px\)/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
