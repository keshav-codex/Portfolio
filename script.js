/* ==========================================================
   ELEMENTS
========================================================== */
const menuBtn   = document.querySelector(".menu-btn");
const navMenu   = document.querySelector(".nav-menu");
const navLinks  = document.querySelectorAll(".nav-link");
const sections  = document.querySelectorAll("main section, footer");
const skillsGrid   = document.getElementById("skillsGrid");
const skillPrevBtn = document.querySelector(".skill-prev");
const skillNextBtn = document.querySelector(".skill-next");
const skillsDots    = document.getElementById("skillsDots");

/* ==========================================================
   MOBILE MENU
========================================================== */
if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", function () {
    const isActive = navMenu.classList.toggle("active");
    menuBtn.classList.toggle("active", isActive);
    menuBtn.setAttribute("aria-expanded", isActive);
  });
}

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (navMenu) navMenu.classList.remove("active");
    if (menuBtn) {
      menuBtn.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("click", function (event) {
  if (
    navMenu && menuBtn &&
    navMenu.classList.contains("active") &&
    !navMenu.contains(event.target) &&
    !menuBtn.contains(event.target)
  ) {
    navMenu.classList.remove("active");
    menuBtn.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
    menuBtn.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ==========================================================
   ACTIVE NAV ON SCROLL
========================================================== */
function updateActiveSection() {
  let current = "";
  sections.forEach(function (section) {
    const top = section.offsetTop - 140;
    const bottom = top + section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) current = section.id;
  });
  navLinks.forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}
window.addEventListener("scroll", updateActiveSection);
window.addEventListener("load", updateActiveSection);

/* ==========================================================
   REVEAL ON SCROLL — staggered within each parent group
========================================================== */
const revealItems = document.querySelectorAll("[data-reveal]");

// group siblings so cards in the same row/grid stagger in sequence
const revealGroups = new Map();
revealItems.forEach(function (item) {
  const parent = item.parentElement;
  if (!revealGroups.has(parent)) revealGroups.set(parent, []);
  const group = revealGroups.get(parent);
  item.dataset.staggerIndex = group.length;
  group.push(item);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const delay = Math.min(parseInt(entry.target.dataset.staggerIndex || 0, 10), 6) * 90;
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealItems.forEach(function (item) { revealObserver.observe(item); });
} else {
  revealItems.forEach(function (item) { item.classList.add("is-visible"); });
}

/* ==========================================================
   SKILLS SLIDER — card-by-card nav + dot indicators
========================================================== */
if (skillsGrid) {
  const cards = Array.from(skillsGrid.children);

  cards.forEach(function (_, i) {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", "Go to skill card " + (i + 1));
    dot.addEventListener("click", function () { scrollToCard(i); });
    skillsDots.appendChild(dot);
  });
  const dots = Array.from(skillsDots.children);

  function currentIndex() {
    const cardWidth = cards[0].getBoundingClientRect().width + 20;
    return Math.round(skillsGrid.scrollLeft / cardWidth);
  }

  function scrollToCard(i) {
    const cardWidth = cards[0].getBoundingClientRect().width + 20;
    skillsGrid.scrollTo({ left: i * cardWidth, behavior: "smooth" });
  }

  function refreshSliderState() {
    const idx = Math.max(0, Math.min(cards.length - 1, currentIndex()));
    dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });

    const maxScroll = skillsGrid.scrollWidth - skillsGrid.clientWidth - 4;
    if (skillPrevBtn) skillPrevBtn.disabled = skillsGrid.scrollLeft <= 4;
    if (skillNextBtn) skillNextBtn.disabled = skillsGrid.scrollLeft >= maxScroll;
  }

  if (skillPrevBtn) skillPrevBtn.addEventListener("click", function () {
    scrollToCard(Math.max(0, currentIndex() - 1));
  });
  if (skillNextBtn) skillNextBtn.addEventListener("click", function () {
    scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
  });

  let scrollTimer;
  skillsGrid.addEventListener("scroll", function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(refreshSliderState, 80);
  });
  window.addEventListener("resize", refreshSliderState);
  window.addEventListener("load", refreshSliderState);
  refreshSliderState();
}

/* ==========================================================
   HIGHLIGHTS — LifeChronicle / DevForge tab toggle
   + animated count-up for the stat numbers
========================================================== */
const highlightTabs   = document.querySelector(".highlight-tabs");
const highlightIndicator = document.querySelector(".tab-indicator");

function animateCount(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = "true";
  const target = parseInt(el.getAttribute("data-count"), 10) || 0;
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (progress === 1 ? suffix : "");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function countUpPanel(panel) {
  if (!panel) return;
  panel.querySelectorAll("[data-count]").forEach(function (el) { animateCount(el); });
}

if (highlightTabs) {
  const tabButtons = Array.from(highlightTabs.querySelectorAll(".tab-btn"));

  function positionIndicator(btn) {
    if (!highlightIndicator || !btn) return;
    highlightIndicator.style.width = btn.offsetWidth + "px";
    highlightIndicator.style.transform = "translateX(" + btn.offsetLeft + "px)";
  }

  function activateTab(target) {
    tabButtons.forEach(function (btn) {
      const isActive = btn.getAttribute("data-target") === target;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
      if (isActive) positionIndicator(btn);
    });
    document.querySelectorAll(".highlight-panel").forEach(function (panel) {
      const isActive = panel.getAttribute("data-panel") === target;
      panel.classList.toggle("active", isActive);
      if (isActive) countUpPanel(panel);
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { activateTab(btn.getAttribute("data-target")); });
  });

  window.addEventListener("load", function () {
    const activeBtn = highlightTabs.querySelector(".tab-btn.active") || tabButtons[0];
    positionIndicator(activeBtn);
  });
  window.addEventListener("resize", function () {
    const activeBtn = highlightTabs.querySelector(".tab-btn.active");
    positionIndicator(activeBtn);
  });
}

// count up the first (default-visible) panel once it scrolls into view
if ("IntersectionObserver" in window) {
  const firstPanel = document.querySelector(".highlight-panel.active");
  if (firstPanel) {
    const countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUpPanel(entry.target);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    countObserver.observe(firstPanel);
  }
}

/* ==========================================================
   IMAGE FALLBACK — generates an inline placeholder so a
   missing/renamed file never breaks the layout.
========================================================== */
function placeholderFor(label) {
  const text = (label || "image").slice(0, 24);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="100%" height="100%" fill="#DDE1F5"/>
      <text x="50%" y="50%" font-family="monospace" font-size="16" fill="#4F46E5"
            text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/* ==========================================================
   DYNAMIC IMAGE-FOLDER LOADER
   Convention: files are named 1.jpg / 1.jpeg / 1.png, then
   2, 3, 4 … with no gaps. Adding or removing numbered files
   in the folder needs no code change — this probes for them.
   Handles any count (including 15+ per folder).
========================================================== */
const IMG_EXTENSIONS = ["jpg", "jpeg", "png"];

function testImage(url) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () { resolve(url); };
    img.onerror = function () { resolve(null); };
    img.src = url;
  });
}

async function resolveNumberedImage(basePath, index) {
  for (const ext of IMG_EXTENSIONS) {
    const found = await testImage(`${basePath}/${index}.${ext}`);
    if (found) return found;
  }
  return null;
}

async function loadImageFolder(basePath, maxCount = 200) {
  const urls = [];
  for (let i = 1; i <= maxCount; i++) {
    const url = await resolveNumberedImage(basePath, i);
    if (!url) break;
    urls.push(url);
  }
  return urls;
}

/* ---- Personal gallery (About section, if present) ---- */
(async function initPersonalGallery() {
  const gallery = document.getElementById("personal-gallery");
  if (!gallery) return;
  const urls = await loadImageFolder("images/Projects/personal");
  gallery.innerHTML = "";
  if (urls.length === 0) {
    gallery.innerHTML = '<p class="gallery-loading">No images found in images/Projects/personal yet.</p>';
    return;
  }
  urls.forEach(function (url, i) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Keshav — personal photo " + (i + 1);
    img.loading = "lazy";
    img.onerror = function () { img.src = placeholderFor("photo " + (i + 1)); };
    gallery.appendChild(img);
  });
})();

/* ---- Project cards: first image + ping-pong marquee of the rest ----
   Marquee distance is measured in real pixels from the rendered track,
   so it works correctly whether a folder has 3 images or 30+. ---- */
async function initProjectMedia(card) {
  const folder = card.getAttribute("data-folder");
  const label = card.getAttribute("data-project") || "project";
  if (!folder) return;

  const urls = await loadImageFolder(folder);
  const firstImgEl = card.querySelector("[data-first-image]");
  const track = card.querySelector("[data-marquee]");

  if (firstImgEl) {
    firstImgEl.src = urls[0] || placeholderFor(label);
    firstImgEl.onerror = function () { firstImgEl.src = placeholderFor(label); };
  }

  if (!track) return;
  const viewport = track.parentElement; // .marquee-viewport
  const rest = urls.slice(1);

  if (rest.length === 0) {
    if (viewport) viewport.classList.add("is-empty");
    return;
  }

  // duplicate the set so the ping-pong sweep always has content to show,
  // no matter how few or how many images the folder holds
  const sequence = rest.length < 6 ? rest.concat(rest) : rest;
  sequence.forEach(function (url, i) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = label + " screenshot " + ((i % rest.length) + 2);
    img.loading = "lazy";
    img.onerror = function () { img.src = placeholderFor(label + " " + (i + 1)); };
    track.appendChild(img);
  });

  // measure real pixel widths once images have laid out, so the sweep
  // always travels the exact distance needed — correct for any image count
  function calibrate() {
    if (!viewport) return;
    const trackWidth = track.scrollWidth;
    const viewportWidth = viewport.clientWidth;
    const distance = Math.max(trackWidth - viewportWidth, 0);
    if (distance <= 0) {
      track.style.animation = "none";
      return;
    }
    track.style.setProperty("--marquee-distance", `-${distance}px`);
    // slower, steadier pace for longer strips so it never feels frantic
    const duration = Math.min(60, Math.max(10, sequence.length * 2.2));
    track.style.animationDuration = duration + "s";
  }

  const allLoaded = Array.from(track.querySelectorAll("img")).map(function (img) {
    return img.complete ? Promise.resolve() : new Promise(function (res) {
      img.addEventListener("load", res, { once: true });
      img.addEventListener("error", res, { once: true });
    });
  });
  await Promise.all(allLoaded);
  calibrate();
  window.addEventListener("resize", calibrate);
}

document.querySelectorAll("[data-folder]").forEach(function (card) {
  initProjectMedia(card);
});