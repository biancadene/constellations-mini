let currentStory = null;
let pageFlip = null;
let selectedConstellation = null;

function buildBrowsingLeftHTML() {
  const buttons = Object.keys(constellationLanguage).map(constellation =>
    `<button class="lang-btn" data-constellation="${constellation}">${constellationLanguage[constellation]}</button>`
  ).join('');
  return `<div class="flip-page-browsing-left" data-density="soft">
    <div class="banner-title"><span>Choose Your Constellation</span></div>
    <div class="left-page-zone">${buttons}</div>
  </div>`;
}

function buildBrowsingRightHTML() {
  return `<div class="flip-page-browsing-right" data-density="soft">
    <div class="right-page-circle" id="storyZone">
      <div class="empty-state">No culture selected</div>
    </div>
  </div>`;
}

function buildTitlePageHTML(story) {
  // Storybook-style title page: culture label, star divider, title,
  // optional place/year line, and the cover art as a small vignette.
  const tint = (starPositions[story.constellation] || {}).tint || '#6b4f28';
  return `<div class="flip-page book-left" data-density="soft" data-constellation="${story.constellation}">
    <div class="title-page-inner" style="--tint:${tint}">
      <div class="title-culture">${story.constellation}</div>
      <div class="title-star" aria-hidden="true">✦</div>
      <h1>${story.title}</h1>
      ${story.setting ? `<div class="title-setting">${story.setting}</div>` : ''}
      ${story.coverImage ? `<img class="title-vignette" src="${story.coverImage}" alt="" />` : ''}
    </div>
  </div>`;
}

function buildStoryPagesHTML(story) {
  return story.pages.map((pageData, idx) => {
    const pageNumber = idx + 1;
    const hasImage = story.imagePages[pageNumber];
    const hasDualText = story.languageLabel && pageData.local;
    // Pages listed in story.imageFraming share one fixed frame (same size on
    // every page); the value is the crop focus point, e.g. 'center 30%'.
    const framing = story.imageFraming && story.imageFraming[pageNumber];
    let imgClass = hasDualText ? 'flip-page-img flip-page-img-compact' : 'flip-page-img';
    if (framing) imgClass += ' flip-page-img-framed';
    const imgStyle = framing ? ` style="object-position:${framing}"` : '';
    // The title page sits on the left half of the open book, so story page 1 is on the right.
    const side = idx % 2 === 0 ? 'book-right' : 'book-left';
    return `
      <div class="flip-page ${side}" data-density="soft" data-constellation="${story.constellation}">
        <div class="page-inner">
          <div class="english-text"><p>${pageData.english}</p></div>
          ${hasDualText ? `<div class="local-text"><p>${pageData.local}</p></div>` : ''}
          ${hasImage ? `<img class="${imgClass}"${imgStyle} src="${story.images[pageNumber]}" alt="Page ${pageNumber}" />` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function wireBrowsingInteractions() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const constellation = btn.dataset.constellation;
      selectedConstellation = constellation;
      const constellationStories = stories.filter(s => s.constellation === constellation);
      const storyZone = document.getElementById('storyZone');
      storyZone.innerHTML = `<div class="story-row">${constellationStories.map(s => {
        const cover = s.coverImage || (s.images && s.images[1]) || constellationHero[s.constellation];
        return `<div class="story-thumb" title="${s.title}" data-id="${s.id}"><img src="${cover}" alt="${s.title}"></div>`;
      }).join('')}</div>`;
      storyZone.querySelectorAll('.story-thumb').forEach(thumb => {
        thumb.onclick = () => openStory(thumb.dataset.id);
      });
    };
  });
}

function buildAndLoadPageFlip(pagesHTMLArray) {
  const flipElement = document.getElementById('flipbookRoot');
  flipElement.innerHTML = pagesHTMLArray.join('');

  pageFlip = new St.PageFlip(flipElement, {
    width: 500,
    height: 560,
    size: 'stretch',
    minWidth: 240,
    maxWidth: 615,
    minHeight: 269,
    maxHeight: 689,
    showCover: false,
    maxShadowOpacity: 0.2,
    showPageCorners: false,
    mobileScrollSupport: true,
    flippingTime: 700
  });

  pageFlip.loadFromHTML(flipElement.querySelectorAll('.flip-page-browsing-left, .flip-page-browsing-right, .flip-page'));

  const backBtn = document.getElementById('backBtn');
  const prevBtn = document.getElementById('flipPrevBtn');
  const nextBtn = document.getElementById('flipNextBtn');

  pageFlip.on('flip', (e) => {
    const idx = e.data;
    backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
  });

  prevBtn.onclick = () => pageFlip.flipPrev();
  nextBtn.onclick = () => pageFlip.flipNext();
  backBtn.onclick = () => pageFlip.flip(0);
  backBtn.style.visibility = 'hidden';
}

function initBook() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="book-viewport" id="bookViewport" style="opacity:0;">
      <div class="flipbook-topbar">
        <button id="backBtn">← Back</button>
      </div>
      <div class="book-frame"><div id="flipbookRoot" class="unified-flipbook"></div></div>
      <div class="flipbook-controls">
        <button id="flipPrevBtn">← Prev</button>
        <button id="flipNextBtn">Next →</button>
      </div>
    </div>
  `;
  buildAndLoadPageFlip([buildBrowsingLeftHTML(), buildBrowsingRightHTML()]);
  wireBrowsingInteractions();

  const viewport = document.getElementById('bookViewport');
  viewport.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => { viewport.style.opacity = '1'; });
}

function openStory(storyId) {
  currentStory = stories.find(s => s.id === storyId);

  const pages = [
    buildBrowsingLeftHTML(),
    buildBrowsingRightHTML(),
    buildTitlePageHTML(currentStory),
    buildStoryPagesHTML(currentStory)
  ];

  buildAndLoadPageFlip(pages);
  wireBrowsingInteractions();

  if (selectedConstellation) {
    const btn = document.querySelector(`.lang-btn[data-constellation="${selectedConstellation}"]`);
    if (btn) btn.click();
  }

  setTimeout(() => pageFlip.flipNext(), 80);
}

function renderCoverScreen() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="browsing-view">
      <div class="cover-stage" id="coverStage">
        <img class="cover-img" src="cover_isolated.png" alt="Constellations">
        <div class="cover-title"><span>Constellations</span></div>
        <div class="cover-hint">Tap to open</div>
      </div>
    </div>
  `;
  document.getElementById('coverStage').onclick = () => {
    const stage = document.getElementById('coverStage');
    stage.style.transition = 'opacity 0.5s ease';
    stage.style.opacity = '0';
    setTimeout(() => initBook(), 500);
  };
}

renderCoverScreen();