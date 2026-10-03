(function () {
  'use strict';

  // ID счётчика Яндекс Метрики. Пусто — аналитика не подключается.
  var METRIKA_ID = '';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Год в подвале ----------
  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  // ---------- Мобильное меню ----------
  var burger = $('.burger');
  var nav = $('#nav');
  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // ---------- Видео на первом экране: только без экономии трафика и без reduced motion ----------
  var video = $('.hero-video');
  if (video) {
    var reduce = reduceMotion;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save) { video.removeAttribute('autoplay'); video.pause(); }
    else { video.preload = 'auto'; var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  }


  // ---------- Появление блоков при прокрутке ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      // соседние карточки появляются с небольшой задержкой
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Прогресс прокрутки, линия шагов, липкая кнопка ----------
  var bar = document.querySelector('.scroll-progress');
  var steps = $('#steps');
  var sticky = $('.sticky-cta');
  var hero = $('.hero');
  var lead = $('#lead');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (h.scrollTop / max).toFixed(4) : 0);
    if (steps) {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var f = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      steps.style.setProperty('--fill', f.toFixed(3));
    }
    if (sticky && hero && lead) {
      var pastHero = hero.getBoundingClientRect().bottom < 0;
      var lr = lead.getBoundingClientRect();
      var atForm = lr.top < window.innerHeight && lr.bottom > 0;
      sticky.classList.toggle('show', pastHero && !atForm);
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---------- Подсветка карточек за курсором ----------
  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ---------- Виджет сроков доставки ----------
  var ROUTES = {
    'vilnius': { route: 'LT · Вильнюс → RU · Москва', days: '14–21', unit: 'день', from: 14, to: 21, note: 'Склад для грузов из Германии, Польши и других стран ЕС' },
    'rimini':  { route: 'IT · Римини → RU · Москва', days: '18–25', unit: 'дней', from: 18, to: 25, note: 'Мебель Пезаро, плитка Сассуоло, обувь Марке — забираем с фабрик сами' },
    'gz-auto': { route: 'CN · Гуанчжоу → RU · Москва · авто', days: '25–30', unit: 'дней', from: 25, to: 30, note: 'Автодоставка из Китая' },
    'gz-rail': { route: 'CN · Гуанчжоу → RU · Москва · ЖД', days: '35–45', unit: 'дней', from: 35, to: 45, note: 'Железнодорожная доставка из Китая' },
    'gz-air':  { route: 'CN · Гуанчжоу → RU · Москва · авиа', days: 'Авиа', unit: 'по запросу', from: 0, to: 0, note: 'Организуем авиадоставку — срок назовёт менеджер при расчёте' }
  };
  var MAX_DAYS = 45;
  var tabs = document.querySelectorAll('.eta-tabs [role=tab]');
  function showRoute(key) {
    var r = ROUTES[key];
    if (!r) return;
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-route') === key;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $('#eta-route').textContent = r.route;
    $('#eta-days').textContent = r.days;
    $('#eta-unit').textContent = r.unit;
    $('#eta-note').textContent = r.note;
    var fill = $('#eta-bar');
    if (r.to) { fill.style.left = (r.from / MAX_DAYS * 100) + '%'; fill.style.width = ((r.to - r.from) / MAX_DAYS * 100) + '%'; }
    else { fill.style.left = '0%'; fill.style.width = '8%'; }
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { showRoute(b.getAttribute('data-route')); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus();
      showRoute(n.getAttribute('data-route'));
    });
  });
  if (tabs.length) showRoute('vilnius');

  // ---------- Cookie и аналитика (загружается только после согласия) ----------
  var COOKIE_KEY = 'cookie_consent_v1';
  var store = {
    get: function () { try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(COOKIE_KEY, v); } catch (e) {} }
  };
  function loadMetrika() {
    if (!METRIKA_ID || window.ym) return;
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(METRIKA_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  var banner = $('#cookie');
  var choice = store.get();
  if (choice === 'all') loadMetrika();
  if (!choice && banner) {
    banner.hidden = false;
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      var v = b.getAttribute('data-cookie');
      store.set(v);
      banner.hidden = true;
      if (v === 'all') loadMetrika();
    });
  }

  // ---------- Форма заявки ----------
  var form = $('#lead-form');
  if (!form) return;
  var ts = $('#f-ts');
  if (ts) ts.value = String(Date.now());
  var status = $('#form-status');
  var phone = $('#f-phone');

  // Маска телефона для российских номеров; иностранные номера (+ не 7) не трогаем
  phone.addEventListener('input', function () {
    var v = phone.value;
    if (/^\+(?!7)/.test(v)) return;
    var d = v.replace(/\D/g, '');
    if (!d) { phone.value = ''; return; }
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    phone.value = out;
  });

  function setError(id, msg) {
    var input = $('#' + id);
    var err = $('#' + id + '-err');
    var field = input.closest('.field');
    if (field) field.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg || ''; input.setAttribute('aria-describedby', id + '-err'); }
    return !msg;
  }

  function validate() {
    var ok = true;
    var name = $('#f-name').value.trim();
    var ph = phone.value.replace(/\D/g, '');
    var email = $('#f-email').value.trim();
    ok = setError('f-name', name.length < 2 ? 'Укажите имя' : '') && ok;
    ok = setError('f-phone', ph.length < 10 ? 'Укажите номер телефона' : '') && ok;
    ok = setError('f-email', email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Проверьте e-mail' : '') && ok;
    ok = setError('f-consent', !$('#f-consent').checked ? 'Нужно согласие на обработку персональных данных' : '') && ok;
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    if (!validate()) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { j.status = r.status; return j; }); })
      .then(function (j) {
        if (j.ok) {
          form.reset();
          if (ts) ts.value = String(Date.now());
          status.className = 'form-status ok';
          status.textContent = 'Спасибо! Заявка отправлена — менеджер свяжется с вами в рабочее время.';
          if (window.ym && METRIKA_ID) window.ym(METRIKA_ID, 'reachGoal', 'lead');
        } else {
          status.className = 'form-status err';
          status.textContent = j.error || 'Не удалось отправить заявку. Позвоните нам или попробуйте ещё раз.';
        }
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Нет соединения. Проверьте интернет и попробуйте ещё раз.';
      })
      .then(function () { btn.disabled = false; btn.textContent = 'Получить расчёт'; });
  });
})();
