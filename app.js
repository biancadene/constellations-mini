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
  const pagesHTML = story.pages.map((pageData, idx) => {
    const pageNumber = idx + 1;
    const hasImage = story.imagePages[pageNumber];
    const hasDualText = story.languageLabel && pageData.local;
    // Pages listed in story.imageFraming share one fixed frame (same size on
    // every page); the value is the crop focus point, e.g. 'center 30%'.
    const framing = story.imageFraming && story.imageFraming[pageNumber];
    // The title page sits on the left half of the open book, so story page 1 is on the right.
    const side = idx % 2 === 0 ? 'book-right' : 'book-left';
    // The picture sits at the top of the page, toward the outer edge,
    // and the text flows around it and on below it.
    let imgClass = side === 'book-right' ? 'flip-page-img float-right' : 'flip-page-img float-left';
    if (hasDualText) imgClass += ' flip-page-img-compact';
    if (framing) imgClass += ' flip-page-img-framed';
    const imgStyle = framing ? ` style="object-position:${framing}"` : '';
    return `
      <div class="flip-page ${side}" data-density="soft" data-constellation="${story.constellation}">
        <div class="page-inner">
          <div class="page-flow">
            ${hasImage ? `<img class="${imgClass}"${imgStyle} src="${story.images[pageNumber]}" alt="Page ${pageNumber}" />` : ''}
            <div class="english-text"><p>${pageData.english}</p></div>
            ${hasDualText ? `<div class="local-text"><p>${pageData.local}</p></div>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  // If the story ends on a left-hand page, add a blank right-hand page
  // so the book closes on a full open spread instead of half a book.
  const lastSide = (story.pages.length - 1) % 2 === 0 ? 'book-right' : 'book-left';
  if (lastSide === 'book-left') {
    pagesHTML.push(`
      <div class="flip-page book-right end-page" data-density="soft" data-constellation="${story.constellation}">
        <div class="page-inner"></div>
      </div>
    `);
  }
  return pagesHTML.join('');
}

/* Keep every page of a story at one text size, small enough that the
   longest page still fits between the ornaments, so no page ever needs a
   scroll bar. Pages not on screen have no size of their own, so each is
   measured, invisibly, at the size of the page that is showing. */
function fitPageText() {
  const ref = [...document.querySelectorAll('.flip-page, .flip-page-browsing-left, .flip-page-browsing-right')]
    .find(p => p.offsetWidth > 0);
  if (!ref) return;
  const W = ref.offsetWidth, H = ref.offsetHeight;

  const items = [...document.querySelectorAll('.flip-page .page-inner')]
    .map(inner => ({ inner, flow: inner.querySelector('.page-flow'), page: inner.closest('.flip-page') }))
    .filter(x => x.flow);
  const texts = x => [...x.flow.querySelectorAll('.english-text p, .local-text p')];
  const show = x => {
    x.saved = x.page.getAttribute('style');
    x.off = x.page.offsetWidth === 0;
    if (x.off) x.page.style.cssText = `display:block;position:absolute;visibility:hidden;left:0;top:0;width:${W}px;height:${H}px;`;
  };
  const hide = x => {
    if (!x.off) return;
    if (x.saved === null) x.page.removeAttribute('style'); else x.page.setAttribute('style', x.saved);
  };
  const apply = (x, scale) => texts(x).forEach((p, i) => {
    p.style.fontSize = scale < 1 ? (x.base[i] * scale) + 'px' : '';
  });

  items.forEach(x => {
    show(x);
    texts(x).forEach(p => { p.style.fontSize = ''; });
    x.base = texts(x).map(p => parseFloat(getComputedStyle(p).fontSize));
    hide(x);
  });

  let scale = 1;
  items.forEach(x => {
    show(x);
    apply(x, scale);
    while (x.flow.offsetHeight > x.inner.clientHeight && scale > 0.6) {
      scale -= 0.03;
      apply(x, scale);
    }
    hide(x);
  });
  items.forEach(x => apply(x, scale));
}

function scheduleFit() {
  requestAnimationFrame(() => requestAnimationFrame(fitPageText));
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

  // Re-fit text once pictures have loaded, since they change how much room is left.
  flipElement.querySelectorAll('.page-inner img').forEach(img => {
    if (!img.complete) img.addEventListener('load', scheduleFit, { once: true });
  });
  scheduleFit();

  const backBtn = document.getElementById('backBtn');
  const prevBtn = document.getElementById('flipPrevBtn');
  const nextBtn = document.getElementById('flipNextBtn');

  pageFlip.on('flip', (e) => {
    const idx = e.data;
    backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
  });
  pageFlip.on('changeOrientation', scheduleFit);

  prevBtn.onclick = () => pageFlip.flipPrev();
  nextBtn.onclick = () => pageFlip.flipNext();
  backBtn.onclick = () => pageFlip.flip(0);
  backBtn.style.visibility = 'hidden';
}

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scheduleFit, 200);
});

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
