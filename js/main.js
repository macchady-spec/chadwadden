/* ============================================
   CHAD WADDEN — main.js
   ============================================ */

// --- Tab switching ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById('tab-' + target)?.classList.add('active');
  });
});

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(13, 27, 46, 0.99)';
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.background = 'rgba(13, 27, 46, 0.97)';
    navbar.style.boxShadow = 'none';
  }
}, { passive: true });

// --- Active nav link on scroll ---
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// --- Mobile hamburger ---
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.querySelector('.nav-links');
const navCtaEl   = document.querySelector('.nav-cta');

hamburger?.setAttribute('aria-expanded', 'false');

hamburger?.addEventListener('click', () => {
  const open = navLinksEl.style.display === 'flex';

  if (open) {
    navLinksEl.style.display = '';
    navCtaEl.style.display   = '';
    hamburger.style.transform = '';
    hamburger.setAttribute('aria-expanded', 'false');
  } else {
    // Mobile: show nav vertically
    navLinksEl.style.cssText = `
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 68px; left: 0; right: 0;
      background: rgba(13,27,46,0.98);
      backdrop-filter: blur(12px);
      padding: 20px 24px 24px;
      gap: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      z-index: 999;
    `;
    navCtaEl.style.cssText = `
      display: block;
      position: fixed;
      top: auto;
      left: 0; right: 0;
      background: rgba(13,27,46,0.98);
      padding: 0 24px 24px;
      z-index: 999;
    `;
    hamburger.style.transform = 'rotate(90deg)';
    hamburger.setAttribute('aria-expanded', 'true');
  }
});

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 1024) {
      navLinksEl.style.display   = '';
      navCtaEl.style.display     = '';
      if (hamburger) {
        hamburger.style.transform = '';
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Kit injects its form asynchronously. Correct the current published headline
// typo without changing future copy if the form is fixed at the source.
const normalizeKitFormCopy = () => {
  document.querySelectorAll('form[data-uid="70f50cb4b3"] .formkit-header h2').forEach(heading => {
    if (heading.textContent.trim().toLowerCase() === "join the the teacher's ai toolkit") {
      heading.textContent = "Join the Teacher's AI Toolkit";
    }
  });
};

normalizeKitFormCopy();
const kitFormObserver = new MutationObserver(normalizeKitFormCopy);
kitFormObserver.observe(document.body, { childList: true, subtree: true });

// --- Privacy-safe campaign and funnel analytics ---
// GA4 receives interaction labels and campaign context only. Never send email
// addresses, student work, form field values, or other personal information.
// Form values and email addresses are never read by this site script.
const analyticsContext = {
  campaign_name: document.body.dataset.campaign || 'site',
  content_id: document.body.dataset.contentId || document.title,
};

const trackSiteEvent = (name, parameters = {}) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, { ...analyticsContext, ...parameters });
};

document.querySelectorAll('[data-track-event]').forEach(element => {
  const eventName = element.dataset.trackEvent;
  const location = element.dataset.trackLocation || 'website';

  if (eventName === 'newsletter_form_view') {
    trackSiteEvent(eventName, { campaign_id: 'trace_teacher_pack', content_id: location });
  }

  element.addEventListener('click', () => {
    if (eventName !== 'newsletter_form_view') {
      trackSiteEvent(eventName, { campaign_id: 'trace_teacher_pack', content_id: location });
    }
  });
});

document.querySelectorAll('[data-track-action]').forEach(link => {
  link.addEventListener('click', () => trackSiteEvent(link.dataset.trackAction, {
    placement: link.dataset.trackPlacement || 'unknown',
    destination_host: (() => { try { return new URL(link.href).hostname; } catch { return 'unknown'; } })(),
  }));
});

if (document.body.dataset.campaign) {
  const search = new URLSearchParams(window.location.search);
  trackSiteEvent('campaign_landing_view', {
    source: search.get('utm_source') || 'direct',
    medium: search.get('utm_medium') || 'none',
    creative: search.get('utm_content') || 'unspecified',
  });

  const reached = new Set();
  const trackArticleDepth = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percent = height > 0 ? Math.round((window.scrollY / height) * 100) : 100;
    [25, 50, 75, 90].forEach(milestone => {
      if (percent >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        trackSiteEvent('article_progress', { percent: milestone });
      }
    });
  };
  window.addEventListener('scroll', trackArticleDepth, { passive: true });
  window.setTimeout(() => trackSiteEvent('article_engaged_60s'), 60000);
}

document.querySelectorAll('video[data-demo-id]').forEach(video => {
  const milestones = new Set();
  const details = { demo_id: video.dataset.demoId, demo_title: video.dataset.demoTitle };
  video.addEventListener('play', () => {
    if (!milestones.has('start')) { milestones.add('start'); trackSiteEvent('demo_start', details); }
  });
  video.addEventListener('timeupdate', () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const percent = Math.floor((video.currentTime / video.duration) * 100);
    [25, 50, 75].forEach(milestone => {
      if (percent >= milestone && !milestones.has(milestone)) {
        milestones.add(milestone);
        trackSiteEvent('demo_progress', { ...details, percent: milestone });
      }
    });
  });
  video.addEventListener('ended', () => trackSiteEvent('demo_complete', { ...details, percent: 100 }));
});

const instrumentKitForm = form => {
  if (form.dataset.analyticsReady === 'true') return;
  form.dataset.analyticsReady = 'true';
  let started = false;
  form.addEventListener('focusin', () => {
    if (!started) { started = true; trackSiteEvent('newsletter_form_start', { placement: 'article_signup' }); }
  });
  form.addEventListener('submit', () => trackSiteEvent('newsletter_form_submit', {
    placement: 'article_signup',
    note: 'intent_only_confirmed_lead_is_recorded_after_email_confirmation',
  }));
};

const instrumentKitForms = () => document.querySelectorAll('form[data-uid="70f50cb4b3"]').forEach(instrumentKitForm);
instrumentKitForms();
const kitAnalyticsObserver = new MutationObserver(instrumentKitForms);
kitAnalyticsObserver.observe(document.body, { childList: true, subtree: true });

// Blog category filters are deliberately small and client-side: four real
// articles do not need a heavier content system.
const blogFilterButtons = document.querySelectorAll('[data-filter]');
const blogPosts = document.querySelectorAll('.blog-list [data-category]');

blogFilterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;

    blogFilterButtons.forEach(candidate => {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });

    blogPosts.forEach(post => {
      post.hidden = selected !== 'all' && post.dataset.category !== selected;
    });
  });
});

// Application screenshots open in a keyboard-accessible, dismissible lightbox.
// The original image remains a normal page asset; this only enlarges it for inspection.
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

if (lightboxTriggers.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Enlarged application image">
      <button class="image-lightbox-close" type="button" aria-label="Close enlarged image">×</button>
      <img alt="">
      <p class="image-lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(lightbox);

  const enlargedImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.image-lightbox-caption');
  const closeButton = lightbox.querySelector('.image-lightbox-close');
  let lastTrigger = null;

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    enlargedImage.removeAttribute('src');
    lastTrigger?.focus();
  };

  lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const previewImage = trigger.querySelector('img');
      lastTrigger = trigger;
      enlargedImage.src = trigger.dataset.fullsrc || previewImage?.src || '';
      enlargedImage.alt = previewImage?.alt || 'Enlarged application image';
      caption.textContent = trigger.dataset.caption || '';
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      closeButton.focus();
      trackSiteEvent('evidence_image_open', { image_name: (trigger.dataset.fullsrc || '').split('/').pop() || 'unknown' });
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}
