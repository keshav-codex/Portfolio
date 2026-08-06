/* ==========================================================
   ELEMENTS
========================================================== */
const menuBtn   = document.querySelector(".menu-btn");
const navMenu   = document.querySelector(".nav-menu");
const navLinks  = document.querySelectorAll(".nav-link");
const sections  = document.querySelectorAll("main section, footer");
const skillsGrid    = document.querySelector(".skills-grid");
const nextSkillBtn  = document.querySelector(".skill-next");
const prevSkillBtn  = document.querySelector(".skill-prev");

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
   REVEAL ON SCROLL
========================================================== */
const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
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
   SKILLS SLIDER
========================================================== */
function scrollSkills(direction) {
  if (!skillsGrid) return;
  const amount = Math.min(skillsGrid.clientWidth * 0.8, 360);
  skillsGrid.scrollBy({ left: direction * amount, behavior: "smooth" });
}
if (nextSkillBtn) nextSkillBtn.addEventListener("click", function () { scrollSkills(1); });
if (prevSkillBtn) prevSkillBtn.addEventListener("click", function () { scrollSkills(-1); });

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

async function loadImageFolder(basePath, maxCount = 60) {
  const urls = [];
  for (let i = 1; i <= maxCount; i++) {
    const url = await resolveNumberedImage(basePath, i);
    if (!url) break;
    urls.push(url);
  }
  return urls;
}

/* ---- Personal gallery (About section) ---- */
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

/* ---- Project cards: first image + marquee of the rest ---- */
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

  if (track) {
    const rest = urls.slice(1);
    if (rest.length === 0) {
      track.closest(".marquee-strip, .flagship-strip")?.classList.add("is-empty");
      const wrap = track.parentElement;
      if (wrap) wrap.style.display = "none";
      return;
    }
    // duplicate the set once so the ping-pong sweep always has content
    const sequence = rest.concat(rest);
    sequence.forEach(function (url, i) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = label + " screenshot " + ((i % rest.length) + 2);
      img.loading = "lazy";
      img.onerror = function () { img.src = placeholderFor(label + " " + (i + 1)); };
      track.appendChild(img);
    });
    // travel distance scales with content so longer strips still ping-pong nicely
    const distance = Math.min(70, 20 + rest.length * 6);
    track.style.setProperty("--marquee-distance", `-${distance}%`);
    track.style.animationDuration = Math.max(10, rest.length * 3) + "s";
  }
}

document.querySelectorAll("[data-folder]").forEach(function (card) {
  initProjectMedia(card);
});