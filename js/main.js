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

hamburger?.addEventListener('click', () => {
  const open = navLinksEl.style.display === 'flex';

  if (open) {
    navLinksEl.style.display = '';
    navCtaEl.style.display   = '';
    hamburger.style.transform = '';
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
  }
});

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 1024) {
      navLinksEl.style.display   = '';
      navCtaEl.style.display     = '';
      if (hamburger) hamburger.style.transform = '';
    }
  });
});

// --- Newsletter form (placeholder — replace with Kit embed) ---
document.getElementById('newsletter-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ You\'re on the list!';
  btn.style.background = 'var(--teal)';
  btn.disabled = true;
  // TODO: Replace with Kit (ConvertKit) form action URL
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
