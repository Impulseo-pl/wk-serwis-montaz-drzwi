/* Wk Serwis - skrypt układu wzorowanego na klindworthroofing.com (20.10.2026). */

/* menu pełnoekranowe pod pigułką */
(function () {
  var b = document.querySelector('.menu-pill');
  if (!b) return;
  b.addEventListener('click', function () {
    var on = document.body.classList.toggle('menu-open');
    b.setAttribute('aria-expanded', on ? 'true' : 'false');
  });
  document.querySelectorAll('.menu a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.body.classList.remove('menu-open');
  });
})();

/* pojawianie się sekcji */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

/* karuzela usług: strzałki + pasek postępu */
(function () {
  document.querySelectorAll('.carousel').forEach(function (c) {
    var t = c.querySelector('.car-track'), bar = c.querySelector('.car-bar i');
    if (!t) return;
    function krok() { var k = t.querySelector('.svc'); return k ? k.getBoundingClientRect().width + 40 : 300; }
    c.querySelectorAll('.car-btn').forEach(function (b) {
      b.addEventListener('click', function () { t.scrollBy({ left: krok() * (+b.dataset.dir), behavior: 'smooth' }); });
    });
    function pasek() {
      if (!bar) return;
      var max = t.scrollWidth - t.clientWidth, w = Math.max(12, t.clientWidth / t.scrollWidth * 100);
      bar.style.width = w + '%';
      bar.style.left = (max > 0 ? t.scrollLeft / max : 0) * (100 - w) + '%';
    }
    t.addEventListener('scroll', pasek, { passive: true });
    window.addEventListener('resize', pasek);
    pasek();
  });
})();

/* proces: slider kroków z licznikiem 01 / 04 */
(function () {
  var box = document.querySelector('.proces-os');
  if (!box) return;
  var s = box.querySelectorAll('.proc-slide'), im = box.querySelectorAll('.proc-imgs img'),
      cur = box.querySelector('.pc-cur'), i = 0, n = s.length, timer;
  function pokaz(k) {
    i = (k + n) % n;
    s.forEach(function (e, j) { e.classList.toggle('on', j === i); });
    im.forEach(function (e, j) { e.classList.toggle('on', j === i); });
    if (cur) cur.textContent = (i < 9 ? '0' : '') + (i + 1);
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { pokaz(i + 1); }, 6500); }
  box.querySelectorAll('.car-btn').forEach(function (b) {
    b.addEventListener('click', function () { pokaz(i + (+b.dataset.dir)); auto(); });
  });
  pokaz(0); auto();
})();

/* pas z nieruchomym zdjęciem: tło (fixed) istnieje tylko, gdy pas jest w kadrze */
(function () {
  var s = document.querySelectorAll('.stopklatka');
  if (!s.length) return;
  if (!('IntersectionObserver' in window)) { s.forEach(function (e) { e.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { x.target.classList.toggle('on', x.isIntersecting); });
  }, { rootMargin: '200px 0px 200px 0px' });
  s.forEach(function (e) { io.observe(e); });
})();

/* dolny pasek mobile chowa się przy stopce */
(function () {
  var p = document.querySelector('.sticky-reserve'), f = document.querySelector('footer');
  if (!p || !f || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (en) {
    p.classList.toggle('is-hidden', en[0].isIntersecting);
  }).observe(f);
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();

(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
