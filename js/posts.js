document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('postList');
  const empty = document.getElementById('postListEmpty');
  if (!list) return;

  const src = list.dataset.src || 'manifest.json';
  const hrefPrefix = list.dataset.hrefPrefix || './';
  const limit = parseInt(list.dataset.limit, 10);

  fetch(src, { cache: 'no-store' })
    .then(r => r.json())
    .then(posts => {
      if (!Array.isArray(posts) || posts.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const shown = (Number.isFinite(limit) && limit > 0) ? posts.slice(0, limit) : posts;
      const fmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
      list.innerHTML = shown.map(p => {
        const when = fmt.format(new Date(p.date));
        return `<li class="post-list-item fade-up visible">
          <a href="${hrefPrefix}${p.slug}.html" class="post-list-link">
            <div class="post-list-meta">${when}</div>
            <h3 class="post-list-title">${p.title}</h3>
            <p class="post-list-excerpt">${p.excerpt || ''}</p>
          </a>
        </li>`;
      }).join('');
    })
    .catch(() => {
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'Unable to load posts.';
      }
    });
});
