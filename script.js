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

// Simulated download demo
(function () {
  const section = document.getElementById('demo');
  if (!section) return;

  const log = document.getElementById('demo-log');
  const progressBar = document.getElementById('demo-progress-bar');
  const percentEl = document.getElementById('demo-progress-percent');
  const chunksEl = document.getElementById('demo-progress-chunks');
  const statusEl = document.getElementById('demo-status');
  const balanceEl = document.getElementById('demo-balance');
  const seedersEl = document.getElementById('demo-seeders');
  const costEl = document.getElementById('demo-cost');

  const PEERS = ['0x8bc9…4a52', '0x3fd2…0b77', '0x9e51…c2a3', '0x24ab…dd90'];
  const TOTAL_CHUNKS = 512;
  const START_BALANCE = 125.40;
  const COST = 1.28;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let running = false;

  function addLog(text, type) {
    const line = document.createElement('div');
    line.className = 'demo-log-line demo-log-' + (type || 'info');
    line.innerHTML = text;
    log.appendChild(line);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  }

  function reset() {
    log.innerHTML = '';
    progressBar.style.width = '0%';
    percentEl.textContent = '0%';
    chunksEl.textContent = '0 / ' + TOTAL_CHUNKS + ' chunks';
    statusEl.textContent = 'Connecting';
    statusEl.classList.remove('demo-status-complete');
    seedersEl.textContent = 'searching…';
    balanceEl.textContent = START_BALANCE.toFixed(2);
    balanceEl.classList.remove('demo-balance-flash');
    costEl.textContent = COST.toFixed(2);
  }

  function prefix(label) {
    return '<span class="demo-log-prefix">' + label + '</span>';
  }

  async function run() {
    while (running) {
      reset();
      await wait(600);

      addLog(prefix('[dht]') + 'bootstrap complete — 8 peers', 'info');
      await wait(500);
      addLog(prefix('[dht]') + 'lookup Qm7ax…f3d → 3 seeders found', 'info');
      seedersEl.textContent = '3 seeders';
      await wait(500);

      statusEl.textContent = 'Downloading';
      addLog(prefix('[xfer]') + 'opening streams to ' + PEERS.slice(0, 3).join(', '), 'info');
      await wait(400);

      for (let i = 1; i <= TOTAL_CHUNKS; i++) {
        const peer = PEERS[i % PEERS.length];
        if (i === 1 || i === 32 || i === 128 || i === 320 || i === TOTAL_CHUNKS) {
          addLog(
            prefix('[chunk ' + i + '/' + TOTAL_CHUNKS + ']') +
              'from ' + peer + ' — sha-256 ok',
            'chunk'
          );
        }
        const pct = Math.round((i / TOTAL_CHUNKS) * 100);
        progressBar.style.width = pct + '%';
        percentEl.textContent = pct + '%';
        chunksEl.textContent = i + ' / ' + TOTAL_CHUNKS + ' chunks';
        await wait(14);
      }

      await wait(300);
      addLog(prefix('[hash]') + 'full-file sha-256 verified', 'ok');
      await wait(500);
      addLog(prefix('[tx]') + 'sent ' + COST.toFixed(2) + ' CHI → 0x8bc9…4a52', 'tx');
      balanceEl.textContent = (START_BALANCE - COST).toFixed(2);
      balanceEl.classList.add('demo-balance-flash');
      await wait(500);
      addLog(prefix('[ok]') + 'download complete', 'ok');
      statusEl.textContent = 'Complete';
      statusEl.classList.add('demo-status-complete');

      await wait(5000);
    }
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !running) {
          running = true;
          run();
        } else if (!entry.isIntersecting) {
          running = false;
        }
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(section);
})();
