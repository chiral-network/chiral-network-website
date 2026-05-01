// Chiral Network — Launch Site Scripts

// Countdown Timer
(function () {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const target = new Date(2026, 4, 22, 0, 0, 0).getTime();

  function update() {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
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
  const downloadItem = $('demo-download-item');
  const progressBar = $('demo-progress-bar');
  const percentEl = $('demo-progress-percent');
  const chunksEl = $('demo-progress-chunks');
  const speedEl = $('demo-speed');
  const etaEl = $('demo-eta');
  const statusBadge = $('demo-status-badge');
  const balanceEl = $('demo-balance');
  const activeCountEl = $('demo-active-count');
  const video = $('demo-video');

  const VIDEO_URL = 'preview-demo.mp4';
  const HASH = '7ax3f4b29c81d0e5a6f7b4c2d1e8f9a0b3c5d7e9f1a2b4c6d8e0f7ax3f4b2c9d2f3d';
  const TOTAL_CHUNKS = 20; // 5 MB / 256 KB
  const START_BALANCE = 125.40;
  const DOWNLOAD_COST = 0.05; // 5 MB × 0.01 CHI/MB
  const SEEDER_PRICE = 0.001;
  let cachedBlobUrl = null;

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
    downloadItem.hidden = false;
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
    video.hidden = true;
    if (video.src && !video.paused) video.pause();
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

  function updateProgress(received, total, startMs) {
    const ratio = total > 0 ? Math.min(received / total, 1) : 0;
    const pct = Math.round(ratio * 100);
    progressBar.style.width = pct + '%';
    percentEl.textContent = pct + '%';
    const chunksDone = Math.min(Math.round(ratio * TOTAL_CHUNKS), TOTAL_CHUNKS);
    chunksEl.textContent = chunksDone + ' / ' + TOTAL_CHUNKS + ' chunks';
    const elapsed = (Date.now() - startMs) / 1000;
    const bps = received / Math.max(elapsed, 0.001);
    speedEl.textContent = formatSpeed(bps);
    if (bps > 0 && total > 0) {
      etaEl.textContent = formatEta((total - received) / bps) + ' remaining';
    }
  }

  const CHUNK_DELAY_MS = 380; // pace UI updates so each chunk is visible

  async function realDownload(myGen) {
    const startMs = Date.now();
    try {
      const resp = await fetch(VIDEO_URL);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const total = +resp.headers.get('Content-Length') || 5 * 1024 * 1024;
      const reader = resp.body.getReader();
      const chunks = [];
      let realReceived = 0;
      let nextUIChunk = 1;

      const advanceUI = async () => {
        while (
          nextUIChunk <= TOTAL_CHUNKS &&
          realReceived / total >= nextUIChunk / TOTAL_CHUNKS
        ) {
          if (myGen !== gen) return;
          const shown = (nextUIChunk / TOTAL_CHUNKS) * total;
          updateProgress(shown, total, startMs);
          nextUIChunk += 1;
          if (nextUIChunk <= TOTAL_CHUNKS) await wait(CHUNK_DELAY_MS);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (myGen !== gen) { reader.cancel(); return null; }
        chunks.push(value);
        realReceived += value.length;
        await advanceUI();
        if (myGen !== gen) return null;
      }
      // Drain any remaining UI chunks if real bytes finished early
      while (nextUIChunk <= TOTAL_CHUNKS) {
        if (myGen !== gen) return null;
        const shown = (nextUIChunk / TOTAL_CHUNKS) * total;
        updateProgress(shown, total, startMs);
        nextUIChunk += 1;
        if (nextUIChunk <= TOTAL_CHUNKS) await wait(CHUNK_DELAY_MS);
      }
      updateProgress(total, total, startMs);
      const blob = new Blob(chunks, { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('demo download failed:', e);
      await fakeProgress(myGen);
      return null;
    }
  }

  async function fakeProgress(myGen) {
    const startMs = Date.now();
    const total = 5 * 1024 * 1024;
    for (let i = 1; i <= TOTAL_CHUNKS; i++) {
      if (myGen !== gen) return;
      updateProgress((i / TOTAL_CHUNKS) * total, total, startMs);
      await wait(CHUNK_DELAY_MS);
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

    // 6. Active download card appears, real fetch streams in
    activeCard.hidden = false;
    let blobUrl;
    if (cachedBlobUrl) {
      // already downloaded once — replay simulated progress for the loop
      await fakeProgress(myGen);
      blobUrl = cachedBlobUrl;
    } else {
      blobUrl = await realDownload(myGen);
      if (blobUrl) cachedBlobUrl = blobUrl;
    }
    if (myGen !== gen) return;

    // 7. Completed: badge flips green, speed/eta cleared
    statusBadge.textContent = 'completed';
    statusBadge.className = 'demo-status-badge demo-status-completed';
    activeCountEl.textContent = '1 completed';
    speedEl.textContent = '—';
    etaEl.textContent = 'done';

    // 8. Play the actual downloaded file inline
    if (blobUrl) {
      await wait(400);
      if (myGen !== gen) return;
      downloadItem.hidden = true;
      video.hidden = false;
      video.muted = true;
      video.playsInline = true;
      if (video.src !== blobUrl) {
        video.src = blobUrl;
        video.load();
        await new Promise((resolve) => {
          const ready = () => resolve();
          video.addEventListener('canplay', ready, { once: true });
          video.addEventListener('error', ready, { once: true });
          setTimeout(ready, 3000);
        });
      } else {
        video.currentTime = 0;
      }
      if (myGen !== gen) return;
      try {
        await video.play();
      } catch (err) {
        console.warn('autoplay blocked:', err && err.message);
      }

      // Wait for video to end (or 15s safety cap), then loop
      await new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        video.addEventListener('ended', finish, { once: true });
        setTimeout(finish, 15000);
      });
    } else {
      await wait(4000);
    }
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
