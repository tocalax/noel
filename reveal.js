const intro = document.querySelector(".intro");
const discover = intro.querySelector(".intro-cta");
const letter = intro.querySelector(".portal-letter");
const gift = document.getElementById("ps5");
const page = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

discover.addEventListener("click", (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (reducedMotion.matches || !CSS.supports("mask-image", "radial-gradient(transparent, black)")) return;

  event.preventDefault();
  if (page.classList.contains("is-opening-gift")) return;

  const introBounds = intro.getBoundingClientRect();
  const contentBounds = letter.closest(".intro-content").getBoundingClientRect();
  const letterBounds = letter.getBoundingClientRect();
  const font = getComputedStyle(letter);
  const fontSize = parseFloat(font.fontSize);
  let startX = letterBounds.left + letterBounds.width / 2;
  let startY = letterBounds.top + letterBounds.height * .59;
  let radiusX = fontSize * .11;
  let radiusY = fontSize * .15;

  // The baseline marker keeps the opening centred in the glyph across fonts and screen sizes.
  const text = document.createElement("canvas").getContext("2d");
  if (text) {
    text.font = font.fontSize + " " + font.fontFamily;
    const glyph = text.measureText("o");
    const glyphWidth = glyph.actualBoundingBoxLeft + glyph.actualBoundingBoxRight;
    const glyphHeight = glyph.actualBoundingBoxAscent + glyph.actualBoundingBoxDescent;
    const baseline = letter.querySelector(".portal-baseline").getBoundingClientRect().top;

    if (glyphWidth > 0 && glyphHeight > 0) {
      startX = letterBounds.left + (glyph.actualBoundingBoxRight - glyph.actualBoundingBoxLeft) / 2;
      startY = baseline + (glyph.actualBoundingBoxDescent - glyph.actualBoundingBoxAscent) / 2;
      radiusX = glyphWidth * .29;
      radiusY = glyphHeight * .36;
    }
  }

  const centerX = page.clientWidth / 2;
  const centerY = page.clientHeight / 2;
  const finalScale = Math.hypot(centerX / radiusX, centerY / radiusY) * 1.17;
  const transition = document.createElement("div");
  transition.className = "portal-transition";
  transition.setAttribute("aria-hidden", "true");

  const cover = intro.cloneNode(true);
  cover.inert = true;
  cover.removeAttribute("id");
  cover.removeAttribute("aria-labelledby");
  cover.querySelector("h1").removeAttribute("id");
  Object.assign(cover.style, {
    left: introBounds.left + "px",
    top: introBounds.top + "px",
    width: introBounds.width + "px",
    height: introBounds.height + "px",
  });

  const content = cover.querySelector(".intro-content");
  const coverButton = cover.querySelector(".intro-cta");
  content.style.transformOrigin = (startX - contentBounds.left) + "px " + (startY - contentBounds.top) + "px";
  transition.append(cover);
  document.body.append(transition);

  page.classList.add("is-opening-gift");
  if (window.location.hash !== discover.hash) window.history.pushState(null, "", discover.hash);
  gift.scrollIntoView({ block: "start", behavior: "instant" });

  const startedAt = performance.now();
  const duration = 1030;

  function zoomIntoLetter(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const onGiftScreen = window.location.hash === discover.hash;
    if (progress === 1 || reducedMotion.matches || !onGiftScreen) {
      transition.remove();
      page.classList.remove("is-opening-gift");
      if (onGiftScreen) {
        gift.scrollIntoView({ block: "start", behavior: "instant" });
        gift.focus({ preventScroll: true });
      }
      return;
    }

    const eased = progress * progress * (3 - 2 * progress);
    const scale = finalScale ** eased;
    const travel = Math.min(1, eased * 1.45);
    const offsetX = (centerX - startX) * travel;
    const offsetY = (centerY - startY) * travel;
    const centerOpacity = 1 - Math.min(1, Math.max(0, (eased - .16) / .28));

    coverButton.style.opacity = String(Math.max(0, 1 - progress * 4));
    content.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    transition.style.maskImage = `radial-gradient(
      ellipse ${radiusX * scale}px ${radiusY * scale}px at ${startX + offsetX}px ${startY + offsetY}px,
      rgb(0 0 0 / ${centerOpacity}) 83%, black 100%
    )`;

    requestAnimationFrame(zoomIntoLetter);
  }

  requestAnimationFrame(zoomIntoLetter);
});

const scrollLinks = document.querySelectorAll('a[href^="#"]:not(.intro-cta)');

for (const link of scrollLinks) {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reducedMotion.matches) return;

    const target = document.getElementById(link.hash.slice(1));
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const focusTarget = document.getElementById(link.dataset.returnFocus) ?? target;
    focusTarget.focus({ preventScroll: true });
    const highlight = document.getElementById(link.dataset.scrollHighlight ?? link.dataset.returnFocus);
    if (highlight) animateScrollLink(link, highlight);
  });
}

let returnAnimation;

function animateScrollLink(link, destination) {
  returnAnimation?.abort();
  const pending = new AbortController();
  returnAnimation = pending;
  link.querySelector("span").animate([
    { transform: "translateY(0)" },
    { transform: link.dataset.returnFocus ? "translateY(-7px)" : "translateY(7px)", offset: .48 },
    { transform: "translateY(0)" }
  ], { duration: 360, easing: "ease-out" });

  function highlightDestination() {
    if (pending.signal.aborted) return;
    pending.abort();
    if (reducedMotion.matches || location.hash !== link.hash) return;

    const bounds = destination.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > window.innerHeight) return;
    if (link.dataset.scrollHighlight) {
      const title = destination.querySelector("span") ?? destination;
      title.animate([
        { textShadow: "0 0 18px #f6bacfbd" },
        { textShadow: "0 0 24px #f6bacf00" }
      ], { duration: 720, easing: "ease-out" });
      return;
    }
    destination.animate([
      { boxShadow: "0 0 0 0 #a9caffb0" },
      { boxShadow: "0 0 0 12px #a9caff00" }
    ], { duration: 720, easing: "ease-out" });
  }

  document.addEventListener("scrollend", highlightDestination, { once: true, signal: pending.signal });
  window.setTimeout(highlightDestination, 850);
}

const consoleLightbox = document.querySelector(".console-lightbox");
const enlargedConsole = consoleLightbox.querySelector("img");

for (const link of document.querySelectorAll(".console-zoom")) {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof consoleLightbox.showModal !== "function") return;
    event.preventDefault();
    enlargedConsole.src = link.href;
    enlargedConsole.alt = link.querySelector("img").alt;
    consoleLightbox.showModal();
  });
}

consoleLightbox.addEventListener("click", (event) => {
  if (event.target === consoleLightbox) consoleLightbox.close();
});
