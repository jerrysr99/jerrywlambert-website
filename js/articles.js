document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('articleList');
  const empty = document.getElementById('articleListEmpty');
  if (!list) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  fetch('manifest.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const fmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
      list.innerHTML = items.map(a => {
        const when = fmt.format(new Date(a.date));
        const statusClass = (a.status || '').toLowerCase() === 'forthcoming'
          ? 'article-badge--forthcoming' : 'article-badge--live';
        const badges = `<span class="article-badge">${esc(a.type)}</span>` +
          (a.status ? `<span class="article-badge ${statusClass}">${esc(a.status)}</span>` : '');
        const sub = a.subtitle ? `<div class="article-list-sub">${esc(a.subtitle)}</div>` : '';
        return `<li class="post-list-item fade-up visible">
          <a href="./${esc(a.slug)}.html" class="post-list-link">
            <div class="article-badges">${badges}<span class="article-list-date">${when}</span></div>
            <h3 class="post-list-title">${esc(a.title)}</h3>
            ${sub}
            <p class="post-list-excerpt">${esc(a.excerpt || '')}</p>
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
