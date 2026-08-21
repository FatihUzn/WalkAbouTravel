/* ================================================================
   WALKABOUT TRAVEL — app.js
   Tüm sayfaların ortak davranışı BURADA. Sayfa içi (inline) kopya
   dinleyiciler kaldırıldı; daha önce hamburger menüye iki dinleyici
   bağlandığı için menü hiç açılmıyordu.
   ================================================================ */
(function () {
  'use strict';

  var isDev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function log() { if (isDev) console.log.apply(console, arguments); }

  /* ── PRELOADER ──────────────────────────────────────────────
     ÖNCE: window.load'dan SONRA 3200 ms daha bekliyordu. 6 MB'lık
     video + büyük görsellerle 10 sn+ boş ekran demekti; bir görsel
     yüklenmezse load hiç tetiklenmez ve site kalıcı boş kalırdı.
     ŞİMDİ: DOM hazır olunca 400 ms, üstüne 2.5 sn mutlak güvenlik ağı. */
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var kapandi = false;
    function kapat() {
      if (kapandi) return;
      kapandi = true;
      pre.classList.add('hide');
      setTimeout(function () { if (pre.parentNode) pre.remove(); }, 700);
    }
    setTimeout(kapat, 400);      // normal akış
    setTimeout(kapat, 2500);     // güvenlik ağı: ne olursa olsun site açılır
    window.addEventListener('pageshow', kapat, { once: true });
  }

  /* ── MOBİL MENÜ (tek dinleyici) ─────────────────────────── */
  function initMobileMenu() {
    var toggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
    var links  = document.getElementById('navLinks')   || document.querySelector('.nav-links');
    if (!toggle || !links) return;

    function ayarla(acik) {
      links.classList.toggle('active', acik);
      toggle.setAttribute('aria-expanded', acik ? 'true' : 'false');
      var ic = toggle.querySelector('i');
      if (ic) { ic.classList.toggle('fa-bars', !acik); ic.classList.toggle('fa-times', acik); }
    }
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      ayarla(!links.classList.contains('active'));
    });
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('active')) return;
      if (!e.target.closest('.nav-container')) ayarla(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('active')) { ayarla(false); toggle.focus(); }
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a') && !e.target.closest('.lang-dropdown-content')) ayarla(false);
    });
    log('mobil menü hazır');
  }

  /* ── DİL MENÜSÜ (tek dinleyici, gerçek bağlantılar) ─────── */
  function initLangDropdown() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-dropdown-btn');
      if (btn) {
        e.preventDefault(); e.stopPropagation();
        var dd = btn.closest('.lang-dropdown');
        var acik = dd.classList.toggle('active');
        btn.setAttribute('aria-expanded', acik ? 'true' : 'false');
        return;
      }
      if (e.target.closest('.lang-dropdown-content')) return;   // bağlantıya izin ver
      document.querySelectorAll('.lang-dropdown.active').forEach(function (d) {
        d.classList.remove('active');
        var b = d.querySelector('.lang-dropdown-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.lang-dropdown.active').forEach(function (d) { d.classList.remove('active'); });
    });
  }

  /* ── NAVBAR SCROLL (tek, passive dinleyici) ─────────────── */
  function initNavbarScroll() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    var tik = false;
    window.addEventListener('scroll', function () {
      if (tik) return;
      tik = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 80);
        tik = false;
      });
    }, { passive: true });
  }

  /* ── YUMUŞAK KAYDIRMA ───────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var hash = href.slice(href.indexOf('#'));
      if (hash === '#' || hash === '#!') { e.preventDefault(); return; }
      // Farklı sayfaya giden bağlantıya karışma
      var yol = href.split('#')[0];
      if (yol && yol !== location.pathname && yol !== '.' && !yol.endsWith('/')) return;
      var hedef;
      try { hedef = document.querySelector(hash); } catch (err) { return; }
      if (!hedef) return;
      e.preventDefault();
      var navY = (document.getElementById('navbar') || {}).offsetHeight || 0;
      window.scrollTo({ top: hedef.getBoundingClientRect().top + window.scrollY - navY, behavior: 'smooth' });
      history.replaceState(null, '', hash);
    });
  }

  /* ── YUKARI ÇIK BUTONU ──────────────────────────────────── */
  function initScrollToTop() {
    if (document.querySelector('.scroll-to-top')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'scroll-to-top';
    b.setAttribute('aria-label', 'Yukarı çık');
    b.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    b.style.cssText = 'position:fixed;bottom:100px;right:30px;width:50px;height:50px;' +
      'background:var(--primary,#0c4a6e);color:#fff;border:none;border-radius:50%;cursor:pointer;' +
      'opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;z-index:998;display:flex;' +
      'align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 15px rgba(0,0,0,.25)';
    document.body.appendChild(b);
    var tik = false;
    window.addEventListener('scroll', function () {
      if (tik) return; tik = true;
      requestAnimationFrame(function () {
        var g = window.scrollY > 500;
        b.style.opacity = g ? '1' : '0';
        b.style.visibility = g ? 'visible' : 'hidden';
        tik = false;
      });
    }, { passive: true });
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ── BAŞLAT ─────────────────────────────────────────────── */
  function init() {
    initPreloader();
    initMobileMenu();
    initLangDropdown();
    initNavbarScroll();
    initSmoothScroll();
    initScrollToTop();
    log('app.js hazır');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
