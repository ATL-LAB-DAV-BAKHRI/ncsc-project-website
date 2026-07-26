document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. LOADER
  --------------------------------------------------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hide');
    }, 500);
  });

  /* ---------------------------------------------------------
     2. THEME TOGGLE
  --------------------------------------------------------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      root.removeAttribute('data-theme');
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    updateChartsTheme();
  }

  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('agrisense-theme') || 'light'; } catch (e) {}
  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('agrisense-theme', next); } catch (e) {}
  });

  /* ---------------------------------------------------------
     3. SCROLL PROGRESS + NAV SHADOW + SCROLLSPY + BACK TO TOP
  --------------------------------------------------------- */
  const scrollProgress = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks)
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';

    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    if (window.scrollY > 500) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');

    let currentId = sections[0] ? sections[0].id : null;
    const scrollPos = window.scrollY + 160;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------------------------------------------------
     4. MOBILE MENU
  --------------------------------------------------------- */
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  /* ---------------------------------------------------------
     5. SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     6. ANIMATED COUNTERS
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1400;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------------------------------------------------------
     7. LIVE FIELD READOUT (hero terminal)
  --------------------------------------------------------- */
  const soilEl = document.getElementById('t-soil');
  const tempEl = document.getElementById('t-temp');
  const humEl = document.getElementById('t-hum');
  const riskEl = document.getElementById('t-risk');
  if (soilEl) {
    setInterval(() => {
      const soil = (38 + Math.random() * 10).toFixed(0);
      const temp = (26 + Math.random() * 3).toFixed(1);
      const hum = (62 + Math.random() * 12).toFixed(0);
      const riskVal = Math.round(8 + Math.random() * 14);
      soilEl.textContent = soil + '%';
      tempEl.textContent = temp + '°C';
      humEl.textContent = hum + '%';
      riskEl.textContent = 'LOW · ' + riskVal + '%';
    }, 3200);
  }

  /* ---------------------------------------------------------
     8. FLOATING BACKGROUND FIELD (canvas — leaves, chips, wifi)
  --------------------------------------------------------- */
  const canvas = document.getElementById('field-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (ctx && !prefersReducedMotion) {
    let w, h, particles;
    const ICONS = ['leaf', 'chip', 'wifi', 'drop'];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function makeParticles() {
      const count = Math.max(10, Math.min(18, Math.floor(window.innerWidth / 110)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 10 + Math.random() * 10,
        speed: 0.08 + Math.random() * 0.14,
        drift: (Math.random() - 0.5) * 0.25,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.004,
        opacity: 0.05 + Math.random() * 0.08,
        icon: ICONS[Math.floor(Math.random() * ICONS.length)]
      }));
    }

    function drawLeaf(size) {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size, -size * 0.4, 0, size);
      ctx.quadraticCurveTo(-size, -size * 0.4, 0, -size);
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(0, size * 0.7);
      ctx.stroke();
    }
    function drawChip(size) {
      ctx.strokeRect(-size * 0.5, -size * 0.5, size, size);
      const pins = 3;
      for (let i = 0; i < pins; i++) {
        const off = (-1 + i) * (size * 0.35);
        ctx.beginPath();
        ctx.moveTo(off, -size * 0.5); ctx.lineTo(off, -size * 0.75);
        ctx.moveTo(off, size * 0.5); ctx.lineTo(off, size * 0.75);
        ctx.stroke();
      }
    }
    function drawWifi(size) {
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(0, size * 0.4, (size * 0.32) * i, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, size * 0.4, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    function drawDrop(size) {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size, size * 0.4, 0, size);
      ctx.quadraticCurveTo(-size, size * 0.4, 0, -size);
      ctx.stroke();
    }

    function paint() {
      ctx.clearRect(0, 0, w, h);
      const isDark = root.getAttribute('data-theme') === 'dark';
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.01) * p.drift;
        p.angle += p.spin;
        if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; }
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.strokeStyle = isDark
          ? `rgba(127, 187, 156, ${p.opacity + 0.03})`
          : `rgba(31, 92, 69, ${p.opacity})`;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1.3;

        if (p.icon === 'leaf') drawLeaf(p.size);
        else if (p.icon === 'chip') drawChip(p.size);
        else if (p.icon === 'wifi') drawWifi(p.size);
        else drawDrop(p.size);

        ctx.restore();
      });
      requestAnimationFrame(paint);
    }

    resize();
    makeParticles();
    paint();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  }

  /* ---------------------------------------------------------
     9. CHARTS
  --------------------------------------------------------- */
  initCharts();
});

let surveyPieChart = null;
let surveyBarChart = null;

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#EAF3EC' : '#4B564F',
    grid: isDark ? 'rgba(234,243,236,0.08)' : 'rgba(22,33,27,0.06)'
  };
}

function initCharts() {
  const pieCtx = document.getElementById('surveyPieChart');
  const barCtx = document.getElementById('surveyBarChart');
  if (typeof Chart === 'undefined' || !pieCtx || !barCtx) return;

  const { text, grid } = getChartColors();

  surveyPieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: ['Detected late', 'Detected early (AI)', 'Not detected'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: ['#C1502E', '#4B9C77', '#CFE3D6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom', labels: { color: text, font: { family: 'IBM Plex Mono', size: 11 } } } }
    }
  });

  surveyBarChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Wheat', 'Rice', 'Tomato', 'Potato'],
      datasets: [{
        label: 'Disease incidence (%)',
        data: [45, 30, 60, 40],
        backgroundColor: '#3E7CB1',
        borderRadius: 6,
        maxBarThickness: 42
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: true, ticks: { color: text, font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: grid } },
        x: { ticks: { color: text, font: { family: 'IBM Plex Mono', size: 10 } }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: text, font: { family: 'IBM Plex Mono', size: 11 } } } }
    }
  });
}

function updateChartsTheme() {
  if (!surveyPieChart || !surveyBarChart) return;
  const { text, grid } = getChartColors();

  surveyPieChart.options.plugins.legend.labels.color = text;
  surveyPieChart.update();

  surveyBarChart.options.plugins.legend.labels.color = text;
  surveyBarChart.options.scales.x.ticks.color = text;
  surveyBarChart.options.scales.y.ticks.color = text;
  surveyBarChart.options.scales.y.grid.color = grid;
  surveyBarChart.update();
}