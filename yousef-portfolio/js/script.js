/* Portfolio interactions — vanilla JavaScript */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)], h = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- typing roles ---------- */
  const roles = {
    ar: ['مدرّس علوم شرعية 🕌', 'مدرّس قرآن وتجويد 📖', 'مدرّس لغة عربية ✍️'],
    en: ['Islamic Sciences Teacher 🕌', 'Quran & Tajweed Teacher 📖', 'Arabic Language Teacher ✍️']
  };
  let rt;
  function startRoles() {
    clearTimeout(rt);
    const el = $('#role'), list = roles[h.lang].map(w => Array.from(w));
    let i = 0, j = 0, del = false;
    (function tick() {
      const w = list[i];
      el.textContent = w.slice(0, j).join('');
      if (!del && j === w.length) { del = true; rt = setTimeout(tick, 1400); return; }
      if (del && j === 0) { del = false; i = (i + 1) % list.length; }
      j += del ? -1 : 1;
      rt = setTimeout(tick, del ? 35 : 80);
    })();
  }

  /* ---------- language + theme ---------- */
  function setLang(l) {
    h.lang = l; h.dir = l === 'ar' ? 'rtl' : 'ltr';
    $('#lb').textContent = l === 'ar' ? 'English' : 'العربية';
    $$('[data-ar]').forEach(e => { e.textContent = e.dataset[l]; });
    $$('[data-ph-ar]').forEach(e => { e.placeholder = l === 'ar' ? e.dataset.phAr : e.dataset.phEn; });
    store.set('lang', l); startRoles();
  }
  function setTheme(t) { h.dataset.theme = t; $('#tb').textContent = t === 'dark' ? '☀️' : '🌙'; store.set('theme', t); }
  $('#lb').onclick = () => setLang(h.lang === 'ar' ? 'en' : 'ar');
  $('#tb').onclick = () => setTheme(h.dataset.theme === 'dark' ? 'light' : 'dark');

  /* ---------- reveal on scroll + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('vis'); setTimeout(() => { el.style.transitionDelay = ''; }, 1600);
    el.querySelectorAll('[data-n]').forEach(c => {
      const n = +c.dataset.n, s = c.dataset.s || '', st = performance.now();
      (function f(t) {
        const k = Math.min(1, (t - st) / 1500);
        c.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + s;
        if (k < 1) requestAnimationFrame(f);
      })(st);
    });
    io.unobserve(el);
  }), { threshold: .15 });
  $$('section,.card,.step,.stats div,details').forEach(e => { e.classList.add('rv'); e.style.transitionDelay = ([...e.parentNode.children].indexOf(e) % 4 * 0.12) + 's'; io.observe(e); });

  /* ---------- 3D tilt on cards ---------- */
  $$('.card').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });

  /* ---------- ripple on buttons ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('.cta,.lang,.th,.contact a,.fab,.send'); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'rip';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 600);
  });

  /* ---------- booking modal -> WhatsApp ---------- */
  const m = $('#modal');
  function openM(i) { if (i != null) $('#sub').selectedIndex = i; m.classList.add('show'); setTimeout(() => $('#nm').focus(), 200); }
  function closeM() { m.classList.remove('show'); }
  $$('[data-open]').forEach(b => b.addEventListener('click', () => openM()));
  $$('.card').forEach((c, i) => c.addEventListener('click', () => openM(i)));
  $('#x').onclick = closeM;
  m.addEventListener('click', e => { if (e.target === m) closeM(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeM(); });
  $('#bk').addEventListener('submit', e => {
    e.preventDefault();
    const s = $('#sub'), sub = s.options[s.selectedIndex].textContent, n = $('#nm').value, p = $('#ph').value;
    const txt = h.lang === 'ar'
      ? `مرحبًا، أنا ${n} وأريد حجز حصة تجريبية في: ${sub}. رقمي: ${p}`
      : `Hello, I'm ${n} and I'd like to book a trial lesson in: ${sub}. My number: ${p}`;
    window.open('https://wa.me/201550349085?text=' + encodeURIComponent(txt), '_blank');
    closeM(); e.target.reset();
    const t = $('#toast'); t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600);
  });

  /* ---------- scroll progress + back to top ---------- */
  addEventListener('scroll', () => {
    const y = scrollY, hh = h.scrollHeight - innerHeight;
    $('#bar').style.width = (hh > 0 ? y / hh * 100 : 0) + '%';
    $('#up').classList.toggle('show', y > 600);
  }, { passive: true });
  $('#up').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  /* ---------- animated star field ---------- */
  const cv = $('#stars'), cx = cv.getContext('2d'); let W, H, st = [];
  function rs() {
    W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
    st = Array.from({ length: Math.min(90, W / 10) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, p: Math.random() * 6.3, v: Math.random() * .02 + .005 }));
  }
  function dr() {
    cx.clearRect(0, 0, W, H);
    st.forEach(s => {
      s.p += s.v; cx.globalAlpha = .4 + .6 * Math.abs(Math.sin(s.p)); cx.fillStyle = '#fff3c9';
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.3); cx.fill();
      s.y -= .08; if (s.y < 0) s.y = H;
    });
    requestAnimationFrame(dr);
  }
  rs(); addEventListener('resize', rs); if (!reduce) dr();

  /* ---------- init ---------- */
  setTheme(store.get('theme') || 'dark');
  setLang(store.get('lang') || 'ar');
})();

/* motion.js — parallax, magnetic buttons, cursor glow, scrollspy, mobile menu */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;

  /* mobile menu */
  const nav = $('nav');
  $('#bg').addEventListener('click', e => {
    nav.classList.toggle('open');
    e.currentTarget.textContent = nav.classList.contains('open') ? '✖' : '☰';
  });
  $$('nav .links a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); $('#bg').textContent = '☰'; }));

  /* scrollspy */
  const links = $$('nav .links a'), spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => spy.observe(s));

  if (reduce || !fine) return;

  /* cursor glow */
  const g = $('#glow');
  addEventListener('mousemove', e => { g.style.opacity = 1; g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; });
  document.addEventListener('mouseleave', () => { g.style.opacity = 0; });

  /* hero parallax (uses the independent `translate` property so CSS animations keep working) */
  const hero = $('.hero'), arch = $('.arch'), fl = $$('.fl');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    arch.style.translate = `${x * -26}px ${y * -20}px`;
    fl.forEach((el, i) => { const d = 18 + i * 14; el.style.translate = `${x * d}px ${y * d}px`; });
  });
  hero.addEventListener('mouseleave', () => { arch.style.translate = ''; fl.forEach(el => { el.style.translate = ''; }); });

  /* magnetic buttons */
  $$('.cta,.contact a').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
    });
    b.addEventListener('mouseleave', () => { b.style.translate = ''; });
  });
})();
