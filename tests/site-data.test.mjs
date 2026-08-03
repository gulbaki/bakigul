import test from 'node:test';
import assert from 'node:assert/strict';
import { problemPresets, siteData } from '../assets/site-data.js';

test('provides exactly three unique problem presets', () => {
  assert.equal(problemPresets.length, 3);
  assert.equal(new Set(problemPresets.map(({ id }) => id)).size, 3);
});

test('each preset contains complete recommendation copy', () => {
  for (const preset of problemPresets) {
    for (const key of ['id', 'label', 'engagement', 'examines', 'firstStep']) {
      assert.equal(typeof preset[key], 'string');
      assert.ok(preset[key].trim().length > 0);
    }
  }
});

test('site links use https URLs', () => {
  for (const url of Object.values(siteData.links)) {
    assert.match(url, /^https:\/\//);
  }
});


test('defines four notebook blog posts with one featured article', () => {
  assert.equal(siteData.blog.posts.length, 4);
  assert.equal(siteData.blog.posts.filter(({ featured }) => featured).length, 1);
  assert.equal(siteData.blog.title, 'Baki ile AI');
});

test('every blog article has safe configurable metadata and an https link', () => {
  for (const post of siteData.blog.posts) {
    for (const key of ['category', 'title', 'excerpt', 'label', 'url']) {
      assert.equal(typeof post[key], 'string');
      assert.ok(post[key].trim().length > 0);
    }
    assert.match(post.url, /^https:\/\//);
  }
});


test('blog section uses Baki ile AI article titles and direct Substack post URLs', () => {
  const expected = new Map([
    ['CLAUDE SİLMELİSİN.', 'https://bakigul.substack.com/p/claude-silmelisin'],
    ['Fable 5’i Yanlış Kullanıyorsun: Boşa Token Yakan Workflow Yerine Bunu Kur', 'https://bakigul.substack.com/p/fable-5i-yanls-kullanyorsun-bosa'],
    ['Claude Cowork’u Kurmadan Yapay Zeka Kullanıyorum Deme', 'https://bakigul.substack.com/p/claude-coworku-kurmadan-yapay-zeka'],
    ['Claude 101: Hiç Kullanmadıysan Buradan Başla', 'https://bakigul.substack.com/p/claude-101-hic-kullanmadysan-buradan']
  ]);
  assert.deepEqual(new Map(siteData.blog.posts.map(({ title, url }) => [title, url])), expected);
});
