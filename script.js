// Chiral Network — Launch Site Scripts

// Countdown Timer
(function () {
  const target = new Date('2026-05-07T00:00:00Z').getTime();

  function update() {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
})();

// Navbar scroll effect
(function () {
  const nav = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// Scroll-triggered fade-in animations
(function () {
  const elements = document.querySelectorAll(
    '.feature-card, .step, .tech-card, .stat-card, .chain-spec'
  );

  elements.forEach(function (el) {
    el.classList.add('fade-in');
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Simulated Download page demo
(function () {
  const section = document.getElementById('demo');
  if (!section) return;

  const $ = (id) => document.getElementById(id);
  const input = $('demo-search-input');
  const caret = $('demo-caret');
  const searchBtn = $('demo-search-btn');
  const searchLabel = $('demo-search-label');
  const resultCard = $('demo-result-card');
  const seederList = $('demo-seeder-list');
  const downloadBtn = $('demo-download-btn');
  const downloadLabel = $('demo-download-label');
  const activeCard = $('demo-active-card');
  const progressBar = $('demo-progress-bar');
  const percentEl = $('demo-progress-percent');
  const chunksEl = $('demo-progress-chunks');
  const speedEl = $('demo-speed');
  const etaEl = $('demo-eta');
  const statusBadge = $('demo-status-badge');
  const balanceEl = $('demo-balance');
  const activeCountEl = $('demo-active-count');

  const HASH = '7ax3f4b29c81d0e5a6f7b4c2d1e8f9a0b3c5d7e9f1a2b4c6d8e0f7ax3f4b2c9d2f3d';
  const TOTAL_CHUNKS = 512;
  const START_BALANCE = 125.40;
  const DOWNLOAD_COST = 1.28;
  const SEEDER_PRICE = 0.001;

  // Seeders sorted by "best" (Elo desc, then price asc)
  const SEEDERS = [
    { peer: '12D3KooW…f3Ab', wallet: '0x8bc94a…4a52', elo: 87, ok: 142, fail: 3, price: '0.001' },
    { peer: '12D3KooW…x2Pq', wallet: '0x3fd20b…0b77', elo: 72, ok: 58,  fail: 4, price: '0.001' },
    { peer: '12D3KooW…m9Kv', wallet: '0x9e51c2…c2a3', elo: 64, ok: 31,  fail: 2, price: '0.001' }
  ];

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let running = false;
  let gen = 0; // generation id — invalidates an in-flight run when we reset

  function reset() {
    input.value = '';
    input.placeholder = 'Enter SHA-256 hash (64 characters)';
    caret.classList.remove('demo-caret-visible');
    searchLabel.textContent = 'Search';
    searchBtn.disabled = false;
    resultCard.hidden = true;
    seederList.innerHTML = '';
    downloadLabel.textContent = 'Download';
    downloadBtn.classList.remove('demo-btn-disabled');
    activeCard.hidden = true;
    progressBar.style.width = '0%';
    percentEl.textContent = '0%';
    chunksEl.textContent = '0 / ' + TOTAL_CHUNKS + ' chunks';
    speedEl.textContent = '—';
    etaEl.textContent = '—';
    statusBadge.textContent = 'downloading';
    statusBadge.className = 'demo-status-badge demo-status-downloading';
    balanceEl.textContent = START_BALANCE.toFixed(2);
    balanceEl.classList.remove('demo-balance-flash');
    activeCountEl.textContent = '1 active';
  }

  async function typeHash(myGen) {
    caret.classList.add('demo-caret-visible');
    for (let i = 0; i < HASH.length; i++) {
      if (myGen !== gen) return;
      input.value = HASH.slice(0, i + 1);
      await wait(22);
    }
    caret.classList.remove('demo-caret-visible');
  }

  function renderSeeders() {
    seederList.innerHTML = '';
    SEEDERS.forEach((s, idx) => {
      const row = document.createElement('div');
      row.className = 'demo-seeder' + (idx === 0 ? ' demo-seeder-selected' : '');
      row.style.animationDelay = (idx * 80) + 'ms';
      row.innerHTML = `
        <div class="demo-seeder-left">
          <span class="demo-seeder-peer">${s.peer}</span>
          <span class="demo-seeder-wallet">${s.wallet} · <span class="demo-pill-rep-ok">${s.ok}&nbsp;✓</span> <span class="demo-pill-rep-fail">${s.fail}&nbsp;✗</span></span>
        </div>
        <div class="demo-seeder-right">
          <span class="demo-pill demo-pill-elo">Elo ${s.elo}</span>
          <span class="demo-pill demo-pill-price">${s.price} CHI</span>
        </div>`;
      seederList.appendChild(row);
    });
  }

  async function simulateProgress(myGen) {
    const startMs = Date.now();
    const totalBytes = 128 * 1024 * 1024;
    for (let i = 1; i <= TOTAL_CHUNKS; i++) {
      if (myGen !== gen) return;
      const pct = Math.round((i / TOTAL_CHUNKS) * 100);
      progressBar.style.width = pct + '%';
      percentEl.textContent = pct + '%';
      chunksEl.textContent = i + ' / ' + TOTAL_CHUNKS + ' chunks';

      const elapsed = (Date.now() - startMs) / 1000;
      const bytesDone = (i / TOTAL_CHUNKS) * totalBytes;
      const bps = bytesDone / Math.max(elapsed, 0.001);
      speedEl.textContent = formatSpeed(bps);
      const remaining = (totalBytes - bytesDone) / bps;
      etaEl.textContent = formatEta(remaining) + ' remaining';
      await wait(14);
    }
  }

  function formatSpeed(bps) {
    if (bps > 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + ' MB/s';
    if (bps > 1024) return (bps / 1024).toFixed(0) + ' KB/s';
    return Math.round(bps) + ' B/s';
  }

  function formatEta(sec) {
    if (!isFinite(sec) || sec < 0) return '—';
    if (sec < 60) return Math.ceil(sec) + 's';
    return Math.ceil(sec / 60) + 'm';
  }

  async function run(myGen) {
    // 1. Idle → type hash into search
    reset();
    await wait(800);
    if (myGen !== gen) return;

    await typeHash(myGen);
    if (myGen !== gen) return;
    await wait(400);

    // 2. Click Search → searching state
    searchLabel.textContent = 'Searching…';
    searchBtn.disabled = true;
    await wait(900);
    if (myGen !== gen) return;

    // 3. Result card appears with seeder list
    searchLabel.textContent = 'Search';
    searchBtn.disabled = false;
    resultCard.hidden = false;
    renderSeeders();
    await wait(1800);
    if (myGen !== gen) return;

    // 4. Click Download → processing payment
    downloadLabel.textContent = 'Processing…';
    downloadBtn.classList.add('demo-btn-disabled');
    await wait(1100);
    if (myGen !== gen) return;

    // 5. Payment settles: 99.5% burn + 0.5% platform, balance drops
    balanceEl.textContent = (START_BALANCE - DOWNLOAD_COST - SEEDER_PRICE).toFixed(2);
    balanceEl.classList.add('demo-balance-flash');
    downloadLabel.textContent = 'Download';

    // 6. Active download card appears, progress ticks
    activeCard.hidden = false;
    await simulateProgress(myGen);
    if (myGen !== gen) return;

    // 7. Completed: badge flips green, speed/eta cleared
    statusBadge.textContent = 'completed';
    statusBadge.className = 'demo-status-badge demo-status-completed';
    activeCountEl.textContent = '1 completed';
    speedEl.textContent = '—';
    etaEl.textContent = 'done';

    await wait(5500);
    if (myGen !== gen) return;
    run(myGen); // loop
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !running) {
          running = true;
          gen += 1;
          run(gen);
        } else if (!entry.isIntersecting && running) {
          running = false;
          gen += 1; // invalidate in-flight run
        }
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(section);
})();
