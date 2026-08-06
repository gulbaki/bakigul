import { problemPresets, siteData } from './site-data.js';

const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileApiPromise;

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
    <button class="recommendation-cta" type="button" data-checkup-contact-cta>
      İletişime geç <span aria-hidden="true">↓</span>
    </button>
  `;
}

export function selectionState(ids, activeId) {
  return ids.map((id) => id === activeId);
}

export function problemContactValue(preset) {
  return `${preset.label} — ${preset.engagement}`;
}

export function problemContactMessage(preset) {
  return `Seçtiğim konu: ${preset.label}\nÖnerilen çalışma: ${preset.engagement}\n\nBu konuda görüşmek istiyorum.`;
}

export function resolveContactEndpoint(configuredEndpoint, hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:8787/contact`;
  }

  const endpoint = new URL(configuredEndpoint);
  if (endpoint.protocol !== 'https:') throw new Error('Contact endpoint must use HTTPS.');
  return endpoint.href;
}

export function resolveTurnstileSiteKey(configuredSiteKey, hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return TURNSTILE_TEST_SITE_KEY;
  }

  return String(configuredSiteKey ?? '').trim();
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
    website: String(values.website ?? ''),
    turnstileToken: String(values['cf-turnstile-response'] ?? '')
  };
}

function loadTurnstileApi() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileApiPromise) return turnstileApiPromise;

  turnstileApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('[data-turnstile-api]');
    const onLoad = () => window.turnstile
      ? resolve(window.turnstile)
      : reject(new Error('Turnstile yüklenemedi.'));
    const onError = () => reject(new Error('Turnstile yüklenemedi.'));

    if (existingScript) {
      existingScript.addEventListener('load', onLoad, { once: true });
      existingScript.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.turnstileApi = '';
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.head.append(script);
  });

  return turnstileApiPromise;
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
  setText('eyebrow', siteData.eyebrow);
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
  setText('credibility-linkedin-prompt', siteData.credibility.linkedinPrompt);
  setText('credibility-linkedin-cta', siteData.credibility.linkedinCta);
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
  const turnstileContainer = form.querySelector('[data-turnstile]');
  const turnstileSiteKey = resolveTurnstileSiteKey(
    siteData.contact.turnstileSiteKey,
    window.location.hostname
  );
  let turnstileApi;
  let turnstileWidgetId;
  let turnstileToken = '';

  const setCaptchaState = (token = '') => {
    turnstileToken = token;
    submitButton.disabled = turnstileToken.length === 0;
  };

  const resetCaptcha = () => {
    setCaptchaState();
    if (turnstileApi && turnstileWidgetId !== undefined) {
      turnstileApi.reset(turnstileWidgetId);
    }
  };

  setCaptchaState();

  if (!turnstileSiteKey) {
    status.textContent = window.location.protocol === 'file:'
      ? 'Güvenlik doğrulaması için siteyi localhost üzerinden açın.'
      : 'Güvenlik doğrulaması henüz yapılandırılmadı.';
    status.dataset.state = 'error';
  } else if (turnstileContainer) {
    turnstileContainer.hidden = false;
    loadTurnstileApi()
      .then((api) => {
        turnstileApi = api;
        turnstileWidgetId = api.render(turnstileContainer, {
          sitekey: turnstileSiteKey,
          action: 'contact_form',
          appearance: 'always',
          language: 'tr',
          retry: 'auto',
          size: 'flexible',
          theme: 'light',
          callback: (token) => {
            setCaptchaState(token);
            if (status.dataset.captchaError === 'true') {
              status.textContent = '';
              delete status.dataset.captchaError;
              delete status.dataset.state;
            }
          },
          'expired-callback': () => setCaptchaState(),
          'timeout-callback': () => setCaptchaState(),
          'error-callback': (errorCode) => {
            setCaptchaState();
            status.textContent = `Güvenlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin. (Kod: ${errorCode})`;
            status.dataset.state = 'error';
            status.dataset.captchaError = 'true';
          }
        });
      })
      .catch(() => {
        status.textContent = 'Güvenlik doğrulaması yüklenemedi. Lütfen sayfayı yenileyin.';
        status.dataset.state = 'error';
      });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!turnstileToken) {
      status.textContent = 'Lütfen güvenlik doğrulamasının tamamlanmasını bekleyin.';
      status.dataset.state = 'error';
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
      resetCaptcha();
      status.textContent = 'Notunuz ulaştı. En kısa sürede size dönüş yapacağım.';
      status.dataset.state = 'success';
    } catch (error) {
      resetCaptcha();
      status.textContent = error instanceof Error
        ? error.message
        : 'Mesaj gönderilemedi. Lütfen biraz sonra tekrar deneyin.';
      status.dataset.state = 'error';
    } finally {
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Notu gönder';
      submitButton.disabled = turnstileToken.length === 0;
    }
  });
}

function initializeProblemSelector() {
  const buttons = [...document.querySelectorAll('[data-problem-button]')];
  const recommendation = document.querySelector('[data-recommendation]');

  if (buttons.length === 0 || !recommendation) return;

  let activePreset = problemPresets[0];

  const selectProblem = (id) => {
    activePreset = findPreset(id);
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

  recommendation.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-checkup-contact-cta]')
      : null;
    if (!target) return;

    const form = document.querySelector('[data-contact-form]');
    const message = form?.querySelector('[name="message"]');
    if (message) message.value = problemContactMessage(activePreset);

    for (const name of ['fullName', 'email', 'company']) {
      const field = form?.querySelector(`[name="${name}"]`);
      if (field) field.value = '';
    }

    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const initiallyPressed = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
  selectProblem(initiallyPressed?.dataset.problemButton ?? problemPresets[0].id);
}

if (typeof document !== 'undefined') {
  hydrateSiteCopy();
  initializeContactForm();
  initializeProblemSelector();
}
