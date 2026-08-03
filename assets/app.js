import { problemPresets, siteData } from './site-data.js';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export function findPreset(id) {
  return problemPresets.find((preset) => preset.id === id) ?? problemPresets[0];
}

export function recommendationMarkup(preset) {
  return `
    <p class="recommendation-kicker">Önerilen çalışma</p>
    <h3>${escapeHtml(preset.engagement)}</h3>
    <div class="recommendation-detail">
      <span>Neye bakarız?</span>
      <p>${escapeHtml(preset.examines)}</p>
    </div>
    <div class="recommendation-detail">
      <span>İlk adım</span>
      <p>${escapeHtml(preset.firstStep)}</p>
    </div>
  `;
}

export function selectionState(ids, activeId) {
  return ids.map((id) => id === activeId);
}

export function heroTitleMarkup(hero) {
  return `${escapeHtml(hero.titleLead)} <em>${escapeHtml(hero.titleEmphasis)}</em> ${escapeHtml(hero.titleTail)}`;
}

export function tagListMarkup(tags) {
  return tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('');
}

export function serviceListMarkup(services) {
  return services
    .map(
      (service) => `
        <li>
          <span class="service-number">${escapeHtml(service.number)}</span>
          <div>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
          </div>
        </li>`
    )
    .join('');
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' ? url.href : '#blog';
  } catch {
    return '#blog';
  }
}

export function blogCardsMarkup(posts) {
  return posts
    .map((post) => {
      const featuredClass = post.featured ? ' article-card--featured' : '';
      return `
        <article class="article-card${featuredClass}">
          <div class="article-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${escapeHtml(post.label)}</span>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <a href="${safeExternalUrl(post.url)}" target="_blank" rel="noreferrer">
            Yazıyı oku <span aria-hidden="true">↗</span>
          </a>
        </article>`;
    })
    .join('');
}

export function numberedListMarkup(items) {
  return items
    .map(
      (item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span> ${escapeHtml(item)}</li>`
    )
    .join('');
}

function setText(binding, value) {
  for (const element of document.querySelectorAll(`[data-bind="${binding}"]`)) {
    element.textContent = value;
  }
}

function setList(binding, markup) {
  const element = document.querySelector(`[data-bind-list="${binding}"]`);
  if (element) element.innerHTML = markup;
}

function setLink(binding, href) {
  for (const element of document.querySelectorAll(`[data-link="${binding}"]`)) {
    element.setAttribute('href', href);
  }
}

function hydrateSiteCopy() {
  setText('brand', siteData.brand);
  setText('hero-description', siteData.hero.description);
  setText('hero-cta', siteData.hero.cta);
  setText('credibility-title', siteData.credibility.title);
  setText('credibility-description', siteData.credibility.description);
  setText('contact-title', siteData.contact.title);
  setText('contact-description', siteData.contact.description);

  const heroTitle = document.querySelector('[data-bind-html="hero-title"]');
  if (heroTitle) heroTitle.innerHTML = heroTitleMarkup(siteData.hero);

  setList('hero-tags', tagListMarkup(siteData.hero.tags));
  setList('services', serviceListMarkup(siteData.services));
  setList('use-cases', numberedListMarkup(siteData.useCases));
  setList('credibility-signals', tagListMarkup(siteData.credibility.signals));
  setList('blog-posts', blogCardsMarkup(siteData.blog.posts));
  setText('blog-title', siteData.blog.title);
  setText('blog-description', siteData.blog.description);

  for (const [name, href] of Object.entries(siteData.links)) {
    setLink(name, href);
  }
}

function initializeProblemSelector() {
  const buttons = [...document.querySelectorAll('[data-problem-button]')];
  const recommendation = document.querySelector('[data-recommendation]');

  if (buttons.length === 0 || !recommendation) return;

  const selectProblem = (id) => {
    const activePreset = findPreset(id);
    recommendation.innerHTML = recommendationMarkup(activePreset);

    for (const button of buttons) {
      const isActive = button.dataset.problemButton === activePreset.id;
      button.setAttribute('aria-pressed', String(isActive));
    }

    recommendation.setAttribute('aria-live', 'polite');
  };

  for (const button of buttons) {
    button.addEventListener('click', () => selectProblem(button.dataset.problemButton));
  }

  const initiallyPressed = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
  selectProblem(initiallyPressed?.dataset.problemButton ?? problemPresets[0].id);
}

if (typeof document !== 'undefined') {
  hydrateSiteCopy();
  initializeProblemSelector();
}
