  /* ===== GAMES LOGIC ===== */
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (!img.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '150px' });

  let gameData = [];
  async function initGames() {
    const grid = document.getElementById('game-grid');
    const ZONES_URL = 'https://gist.githubusercontent.com/Dave-031/bb96a99fc2db2f13aa07d14802015431/raw/zones.json';
    const COVER_URL = 'https://cdn.jsdelivr.net/gh/Dave-031/covers@latest/';
    try {
      const res = await fetch(`${ZONES_URL}?t=${ts()}`);
      gameData = await res.json();
      renderGames(gameData);
    } catch (e) { console.error(e); }

    function renderGames(arr) {
      grid.innerHTML = '';
      arr.forEach(z => {
        const card = document.createElement('div');
        card.className = 'widget-card';
        const cover = z.cover ? (z.cover.includes('{COVER_URL}') ? z.cover.replace('{COVER_URL}', COVER_URL) : z.cover) : '';
        card.innerHTML = `<img class="widget-img lazy-img" data-src="${cover}"><div class="widget-info"><div class="widget-name">${z.name}</div></div>`;
        card.onclick = () => launchGame(z);
        grid.appendChild(card);
        const img = card.querySelector('.lazy-img');
        imageObserver.observe(img);
      });
    }

    async function launchGame(z) {
      const loader = document.getElementById('widget-global-loader');
      loader.style.display = 'flex';
      try {
        const freshRes = await fetch(`${ZONES_URL}?t=${ts()}`);
        const freshData = await freshRes.json();
        const current = freshData.find(item => item.name === z.name);
        const commit = (current && current.LatestCommitID) ? current.LatestCommitID : 'main';
        const finalUrl = `https://cdn.jsdelivr.net/gh/Dave-031/bazinga-games@${commit}/single-html/${encodeURIComponent(z.name.trim())}.html`;
        const gameReq = await fetch(finalUrl);
        const html = await gameReq.text();
        const t = window.open('about:blank', '_blank');
        t.document.write(html);
        t.document.close();
      } catch (e) { alert('Failed to load.'); }
      loader.style.display = 'none';
    }
    document.getElementById('game-search').oninput = (e) => {
      const term = e.target.value.toLowerCase();
      renderGames(gameData.filter(g => g.name.toLowerCase().includes(term)));
    };
  }