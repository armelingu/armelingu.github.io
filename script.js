document.getElementById('year').textContent = new Date().getFullYear();

// Progress bar
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Mobile menu toggle
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMenuOpen(open) {
  if (!navToggle || !mobileMenu) return;
  mobileMenu.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });
}

// Active nav link highlighting
const navLinkEls = document.querySelectorAll('.nav-links a, .mobile-menu a');
const sectionEls = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sectionEls.forEach((el) => navObserver.observe(el));

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach((el) => io.observe(el));

// Contador animado (respeita prefers-reduced-motion)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if (prefersReducedMotion) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));
