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

export function problemContactValue(preset) {
  return `${preset.label} — ${preset.engagement}`;
}

export function resolveContactEndpoint(configuredEndpoint, hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:8787/contact`;
  }

  const endpoint = new URL(configuredEndpoint);
  if (endpoint.protocol !== 'https:') throw new Error('Contact endpoint must use HTTPS.');
  return endpoint.href;
}

export function contactPayloadFromEntries(entries) {
  const values = Object.fromEntries(entries);
  return {
    fullName: String(values.fullName ?? ''),
    email: String(values.email ?? ''),
    company: String(values.company ?? ''),
    message: String(values.message ?? ''),
    problem: String(values.problem ?? ''),
    source: String(values.source ?? ''),
    website: String(values.website ?? '')
  };
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

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.dataset.endpoint = siteData.contact.endpoint;
    contactForm.setAttribute('action', siteData.contact.endpoint);
  }
}

function syncContactProblem(preset) {
  const value = problemContactValue(preset);

  for (const element of document.querySelectorAll('[data-selected-problem-label]')) {
    element.textContent = preset.label;
  }

  for (const input of document.querySelectorAll('[data-selected-problem-input]')) {
    input.value = value;
  }
}

function initializeContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const submitButton = form.querySelector('[data-contact-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const status = form.querySelector('[data-form-status]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const selectedProblem = form.querySelector('[data-selected-problem-input]')?.value ?? '';
    const endpoint = resolveContactEndpoint(form.dataset.endpoint, window.location.hostname);
    const payload = contactPayloadFromEntries(new FormData(form).entries());

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Gönderiliyor…';
    status.textContent = '';
    status.dataset.state = 'pending';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Mesaj gönderilemedi. Lütfen biraz sonra tekrar deneyin.');
      }

      form.reset();
      const problemInput = form.querySelector('[data-selected-problem-input]');
      if (problemInput) problemInput.value = selectedProblem;
      status.textContent = 'Notunuz ulaştı. En kısa sürede size dönüş yapacağım.';
      status.dataset.state = 'success';
    } catch (error) {
      status.textContent = error instanceof Error
        ? error.message
        : 'Mesaj gönderilemedi. Lütfen biraz sonra tekrar deneyin.';
      status.dataset.state = 'error';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Notu gönder';
    }
  });
}

function initializeProblemSelector() {
  const buttons = [...document.querySelectorAll('[data-problem-button]')];
  const recommendation = document.querySelector('[data-recommendation]');

  if (buttons.length === 0 || !recommendation) return;

  const selectProblem = (id) => {
    const activePreset = findPreset(id);
    recommendation.innerHTML = recommendationMarkup(activePreset);
    syncContactProblem(activePreset);

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
  initializeContactForm();
  initializeProblemSelector();
}
