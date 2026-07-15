document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('articleList');
  const empty = document.getElementById('articleListEmpty');
  if (!list) return;

  fetch('manifest.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const fmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
      list.innerHTML = items.map(p => {
        const d = new Date(p.date);
        const when = fmt.format(d);
        const iso = d.toISOString();
        return `<li class="post-list-item fade-up visible">
          <a href="./${p.file}" class="post-list-link" target="_blank" rel="noopener">
            <div class="post-list-meta">First published <time datetime="${iso}">${when}</time> &middot; PDF</div>
            <h3 class="post-list-title">${p.title}</h3>
            <p class="post-list-excerpt">${p.excerpt || ''}</p>
          </a>
        </li>`;
      }).join('');
    })
    .catch(() => {
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'Unable to load articles.';
      }
    });
});
