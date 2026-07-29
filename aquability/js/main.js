/* ==========================================================================
   AQUABILITY - BRAND GUIDE
   Behaviour
   --------------------------------------------------------------------------
   01. Utilities
   02. Clipboard + toast
   03. Reading progress
   04. Scrollspy
   05. Mobile navigation
   06. Scroll reveal
   07. Contrast engine (WCAG 2.1)
   08. Contrast tool
   09. Contrast matrix
   10. Motion demos
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     01. UTILITIES
     ====================================================================== */

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================================
     02. CLIPBOARD + TOAST
     ====================================================================== */

  var toast = $('#toast');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1600);
  }

  function copy(text, message) {
    var done = function () { showToast(message || ('Copied ' + text)); };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { showToast('Copy failed - select manually'); }
    document.body.removeChild(ta);
  }

  // Colour swatches
  $$('.swatch').forEach(function (sw) {
    sw.setAttribute('type', 'button');
    sw.addEventListener('click', function () {
      var hex = sw.getAttribute('data-hex');
      copy(hex, hex + ' copied');
    });
  });

  // Token block
  var copyTokens = $('#copyTokens');
  if (copyTokens) {
    copyTokens.addEventListener('click', function () {
      var block = $('#tokenBlock');
      if (block) copy(block.textContent, 'Tokens copied');
    });
  }

  /* ======================================================================
     03. READING PROGRESS
     ====================================================================== */

  var progress = $('#progress');

  function updateProgress() {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
  }

  /* ======================================================================
     04. SCROLLSPY
     ====================================================================== */

  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
    .filter(Boolean);

  var activeIndex = -1;

  function updateSpy() {
    var probe = window.scrollY + window.innerHeight * 0.28;
    var next = 0;

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) next = i;
    }

    // Pin the final section once the page is scrolled to the bottom.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      next = sections.length - 1;
    }

    if (next === activeIndex) return;
    activeIndex = next;

    navLinks.forEach(function (link, i) {
      link.classList.toggle('is-active', i === next);
    });
  }

  /* --- one rAF-throttled scroll handler for progress + spy --- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateProgress();
      updateSpy();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateProgress();
  updateSpy();

  /* ======================================================================
     05. MOBILE NAVIGATION
     ====================================================================== */

  var nav = $('#nav');
  var navToggle = $('#navToggle');
  var navToggleLabel = $('#navToggleLabel');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (navToggleLabel) navToggleLabel.textContent = 'Index';
    document.body.style.overflow = '';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (navToggleLabel) navToggleLabel.textContent = open ? 'Close' : 'Index';
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ======================================================================
     06. SCROLL REVEAL
     ====================================================================== */

  var revealables = $$('.reveal');
  var sweep = function () {};

  function revealNow(el) { el.classList.add('is-visible'); }

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealables.forEach(revealNow);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    revealables.forEach(function (el) { revealObserver.observe(el); });

    // Safety net: anything already in the viewport is shown immediately, so a
    // deep link or a refresh part-way down the page never lands on blank space.
    sweep = function () {
      revealables.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) {
          revealNow(el);
          revealObserver.unobserve(el);
        }
      });
    };
    sweep();
    window.addEventListener('load', sweep);
  }

  /* ======================================================================
     06b. DEEP LINKS
     Fonts and images change the page height after the browser has already
     acted on the hash, so a fresh load with #section can land in the wrong
     place - or not move at all. Re-resolve the target once things settle.
     ====================================================================== */

  function jumpToHash(behavior) {
    var id = window.location.hash.slice(1);
    if (!id) return;

    var target = document.getElementById(id);
    if (!target) return;

    var offset = window.matchMedia('(max-width: 1024px)').matches ? 62 : 0;
    window.scrollTo({ top: target.offsetTop - offset, behavior: behavior || 'auto' });
    sweep();
    onScroll();
  }

  if (window.location.hash) {
    window.addEventListener('load', function () {
      jumpToHash('auto');
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { jumpToHash('auto'); });
      }
    });
  }

  // Pasting or editing the hash directly should move the page too.
  window.addEventListener('hashchange', function () { jumpToHash('smooth'); });

  /* ======================================================================
     07. CONTRAST ENGINE - WCAG 2.1
     ====================================================================== */

  function hexToRgb(hex) {
    var h = hex.replace('#', '').trim();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  function luminance(hex) {
    var channels = hexToRgb(hex).map(function (v) {
      var c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastRatio(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    var light = Math.max(la, lb);
    var dark = Math.min(la, lb);
    return (light + 0.05) / (dark + 0.05);
  }

  /* --- Palette is read from the DOM so the swatches stay the single source --- */
  var palette = $$('.swatch').map(function (sw) {
    return {
      name: sw.getAttribute('data-name'),
      hex: sw.getAttribute('data-hex'),
      token: sw.getAttribute('data-token')
    };
  });

  function findColor(name) {
    for (var i = 0; i < palette.length; i++) {
      if (palette[i].name === name) return palette[i];
    }
    return null;
  }

  /* ======================================================================
     08. CONTRAST TOOL
     ====================================================================== */

  var fgSelect = $('#fgSelect');
  var bgSelect = $('#bgSelect');
  var ctPreview = $('#ctPreview');
  var ctRatio = $('#ctRatio');
  var ctVerdict = $('#ctVerdict');
  var ctAA = $('#ctAA');
  var ctAAA = $('#ctAAA');
  var ctAALarge = $('#ctAALarge');
  var ctUI = $('#ctUI');

  function populate(select, selectedName) {
    if (!select) return;
    palette.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.hex;
      opt.textContent = c.name + '  ·  ' + c.hex;
      opt.setAttribute('data-name', c.name);
      if (c.name === selectedName) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function setBadge(el, pass, label) {
    if (!el) return;
    el.className = 'badge ' + (pass ? 'badge--pass' : 'badge--fail');
    el.textContent = (pass ? '✓ ' : '✕ ') + label;
  }

  function updateContrastTool() {
    if (!fgSelect || !bgSelect || !ctPreview) return;

    var fg = fgSelect.value;
    var bg = bgSelect.value;
    var ratio = contrastRatio(fg, bg);
    var rounded = Math.round(ratio * 100) / 100;

    ctPreview.style.background = bg;
    ctPreview.style.color = fg;
    if (ctRatio) ctRatio.textContent = rounded.toFixed(2) + ':1';

    var passAA = ratio >= 4.5;
    var passAAA = ratio >= 7;
    var passLarge = ratio >= 3;
    var passUI = ratio >= 3;

    setBadge(ctAA, passAA, 'AA · Normal');
    setBadge(ctAAA, passAAA, 'AAA · Normal');
    setBadge(ctAALarge, passLarge, 'AA · Large');
    setBadge(ctUI, passUI, 'UI · 3:1');

    if (ctVerdict) {
      var verdict;
      if (passAAA) verdict = 'Safe everywhere, including long-form body copy at any size.';
      else if (passAA) verdict = 'Safe for body copy and headlines. Does not reach AAA.';
      else if (passLarge) verdict = 'Large text (24px+, or 19px bold), icons and borders only. Not for paragraphs.';
      else verdict = 'Do not pair. Fails every threshold, including non-text UI.';
      ctVerdict.textContent = verdict;
    }
  }

  if (fgSelect && bgSelect) {
    populate(fgSelect, 'Deep Water');
    populate(bgSelect, 'Paper');
    fgSelect.addEventListener('change', updateContrastTool);
    bgSelect.addEventListener('change', updateContrastTool);
    updateContrastTool();
  }

  /* ======================================================================
     09. CONTRAST MATRIX
     ====================================================================== */

  var MATRIX_FG = ['Deep Water', 'Surface', 'Abyss', 'Meridian', 'Shallow', 'Ink', 'Slate', 'Concrete', 'Paper'];
  var MATRIX_BG = ['Paper', 'Bone', 'Vapor', 'Limestone', 'Surface', 'Deep Water', 'Abyss'];

  function gradeClass(ratio) {
    if (ratio >= 7) return 'm-aaa';
    if (ratio >= 4.5) return 'm-aa';
    if (ratio >= 3) return 'm-lg';
    return 'm-no';
  }

  function gradeTitle(ratio) {
    if (ratio >= 7) return 'AAA - safe for all text';
    if (ratio >= 4.5) return 'AA - safe for body copy';
    if (ratio >= 3) return 'Large text and UI elements only';
    return 'Fails - do not pair';
  }

  var matrix = $('#matrix');

  if (matrix) {
    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));

    MATRIX_BG.forEach(function (name) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = name;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    matrix.appendChild(thead);

    var tbody = document.createElement('tbody');

    MATRIX_FG.forEach(function (fgName) {
      var fg = findColor(fgName);
      if (!fg) return;

      var row = document.createElement('tr');
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = fgName;
      row.appendChild(th);

      MATRIX_BG.forEach(function (bgName) {
        var bg = findColor(bgName);
        var td = document.createElement('td');

        if (!bg) { row.appendChild(td); return; }

        if (fg.hex.toUpperCase() === bg.hex.toUpperCase()) {
          td.className = 'm-self';
          td.textContent = '-';
        } else {
          var ratio = contrastRatio(fg.hex, bg.hex);
          td.className = gradeClass(ratio);
          td.textContent = (Math.round(ratio * 10) / 10).toFixed(1);
          td.title = fgName + ' on ' + bgName + ' - ' + gradeTitle(ratio);
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    matrix.appendChild(tbody);
  }

  /* ======================================================================
     10. MOTION DEMOS
     ====================================================================== */

  $$('.motion-demo').forEach(function (demo) {
    var ball = $('.motion-demo__ball', demo);

    function play() {
      if (prefersReduced) { showToast('Reduced motion is on'); return; }
      demo.classList.remove('is-playing');
      void demo.offsetWidth;            // force reflow so the animation restarts
      demo.classList.add('is-playing');
    }

    demo.addEventListener('click', play);
    demo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });

    if (ball) {
      ball.addEventListener('animationend', function () {
        demo.classList.remove('is-playing');
      });
    }
  });

})();
