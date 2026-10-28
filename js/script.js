document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeButtons = document.querySelectorAll('#theme-toggle');
  const savedTheme = localStorage.getItem('storyverse-theme');
  if (savedTheme === 'dark') body.classList.add('dark');
  const updateThemeButtons = () => themeButtons.forEach(btn => btn.textContent = body.classList.contains('dark') ? '☀' : '☾');
  updateThemeButtons();
  themeButtons.forEach(btn => btn.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('storyverse-theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeButtons();
  }));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  document.querySelectorAll('.year-placeholder').forEach(el => el.textContent = new Date().getFullYear());

  const search = document.getElementById('search-input');
  const genre = document.getElementById('genre-filter');
  const grid = document.getElementById('book-grid');
  if (search && genre && grid) {
    const cards = Array.from(grid.querySelectorAll('.book-card'));
    const genres = [...new Set(cards.map(card => card.dataset.genre))].sort();
    genres.forEach(g => {
      const option = document.createElement('option');
      option.value = g;
      option.textContent = g.replace(/\b\w/g, c => c.toUpperCase());
      genre.appendChild(option);
    });
    const filterCards = () => {
      const term = search.value.trim().toLowerCase();
      const chosenGenre = genre.value;
      let visible = 0;
      cards.forEach(card => {
        const text = `${card.dataset.title} ${card.dataset.author} ${card.dataset.genre} ${card.textContent}`.toLowerCase();
        const show = text.includes(term) && (chosenGenre === 'all' || card.dataset.genre === chosenGenre);
        card.hidden = !show;
        if (show) visible++;
      });
      document.getElementById('visible-count').textContent = visible;
      document.getElementById('empty-state').hidden = visible !== 0;
    };
    search.addEventListener('input', filterCards);
    genre.addEventListener('change', filterCards);
  }

  document.querySelectorAll('.synopsis-toggle').forEach(btn => btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const isHidden = target.hidden;
    target.hidden = !isHidden;
    btn.textContent = isHidden ? 'Hide synopsis' : 'Show synopsis';
    btn.setAttribute('aria-expanded', String(isHidden));
  }));

  document.querySelectorAll('.like-button').forEach(btn => {
    const key = 'storyverse-liked-' + btn.closest('.book-card').dataset.title;
    if (localStorage.getItem(key) === 'yes') setLiked(btn, true);
    btn.addEventListener('click', () => {
      const liked = btn.getAttribute('aria-pressed') === 'true';
      setLiked(btn, !liked);
      localStorage.setItem(key, !liked ? 'yes' : 'no');
    });
  });
  function setLiked(btn, liked) {
    btn.setAttribute('aria-pressed', String(liked));
    btn.innerHTML = liked ? '♥ <span>Liked</span>' : '♡ <span>Like</span>';
  }

  const dialog = document.getElementById('details-dialog');
  const dialogContent = document.getElementById('dialog-content');
  if (dialog && dialogContent && window.STORY_DATA) {
    document.querySelectorAll('.details-button').forEach(btn => btn.addEventListener('click', () => {
      const story = window.STORY_DATA[Number(btn.dataset.story)];
      if (!story) return;
      dialogContent.innerHTML = `<div class="dialog-book"><img src="${story.cover}" alt=""><div><span class="genre-tag">${escapeHTML(story.genre)}</span><h2>${escapeHTML(story.title)}</h2><p>by ${escapeHTML(story.author)}</p><p>${escapeHTML(story.synopsis)}</p><a class="button primary" href="${story.url}">Read Story →</a></div></div>`;
      dialog.showModal();
    }));
    document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }

  const readerLike = document.getElementById('reader-like');
  if (readerLike) {
    const pageTitle = document.querySelector('.story-heading h1')?.textContent || location.pathname;
    const key = 'storyverse-liked-' + pageTitle.toLowerCase();
    const update = liked => {
      readerLike.setAttribute('aria-pressed', String(liked));
      readerLike.textContent = liked ? '♥ Liked story' : '♡ Like story';
    };
    update(localStorage.getItem(key) === 'yes');
    readerLike.addEventListener('click', () => {
      const liked = readerLike.getAttribute('aria-pressed') !== 'true';
      localStorage.setItem(key, liked ? 'yes' : 'no');
      update(liked);
    });
  }

  const fontToggle = document.getElementById('font-toggle');
  const storyContent = document.getElementById('story-content');
  if (fontToggle && storyContent) fontToggle.addEventListener('click', () => {
    const larger = storyContent.dataset.large !== 'yes';
    storyContent.dataset.large = larger ? 'yes' : 'no';
    storyContent.style.fontSize = larger ? '20px' : '';
    fontToggle.textContent = larger ? 'A− Normal text' : 'A+ Larger text';
  });

  const progress = document.getElementById('reading-progress');
  const progressLabel = document.getElementById('progress-label');
  if (progress && progressLabel) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max <= 0 ? 100 : Math.min(100, Math.max(0, Math.round(window.scrollY / max * 100)));
      progress.style.width = percent + '%';
      progressLabel.textContent = percent + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
});
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
