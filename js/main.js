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

// --- Hero scene: storm clears and ship reaches the lighthouse as you scroll ---
const heroEl = document.getElementById('hero');
if (heroEl) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  function updateHeroScene() {
    ticking = false;
    const rect = heroEl.getBoundingClientRect();
    // The scene occupies a fixed 100vh band regardless of how tall the hero
    // grows on small screens (stacked cards push its actual height well past 100vh).
    const heroHeight = Math.min(rect.height || window.innerHeight, window.innerHeight);
    const scrolled = Math.min(Math.max(-rect.top, 0), heroHeight);
    const progress = heroHeight ? scrolled / (heroHeight * 0.85) : 0;
    heroEl.style.setProperty('--p', Math.min(Math.max(progress, 0), 1).toFixed(3));
  }

  updateHeroScene();
  if (reduceMotion) {
    heroEl.style.setProperty('--p', 1);
  } else {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeroScene);
      }
    }, { passive: true });
    window.addEventListener('resize', updateHeroScene);
  }
}

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
