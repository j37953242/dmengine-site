/* DM Engine site UI: cookie choice banner + accessibility button.
 *
 * COOKIES. This site sets no tracking or advertising cookies today. The banner
 * still asks first, so anything added later (analytics, an ad pixel) can be
 * gated on the answer: check window.dmeCookieChoice === 'granted', or listen
 * for the 'dme-cookie-choice' event. Deny is as easy as Accept, and either
 * choice can be changed with any element carrying data-cookie-choices (the
 * "Cookie choices" footer link). The answer is kept in this browser's
 * localStorage, never sent anywhere.
 *
 * ACCESSIBILITY. A fixed, keyboard-reachable link to the accessibility page in
 * the page's language. It is a link, not an overlay widget: overlays do not fix
 * a site and are not a legal defence.
 */
(function () {
  'use strict';
  var KEY = 'dme_cookie_choice';
  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var L = lang.indexOf('zh') === 0 ? 'zh' : lang.indexOf('es') === 0 ? 'es' : 'en';

  var COPY = {
    en: {
      title: 'Cookies',
      body: 'This site uses no tracking or advertising cookies right now. If we ever add analytics, it will only run if you accept. You can change your choice anytime under Cookie choices at the bottom of the page.',
      accept: 'Accept', deny: 'Deny', privacy: 'Privacy policy',
      a11y: 'Accessibility', a11yHref: '/accessibility/'
    },
    es: {
      title: 'Cookies',
      body: 'Este sitio no usa cookies de seguimiento ni de publicidad por ahora. Si algún día añadimos analíticas, solo funcionarán si aceptas. Puedes cambiar tu elección cuando quieras en Preferencias de cookies, al final de la página.',
      accept: 'Aceptar', deny: 'Rechazar', privacy: 'Política de privacidad',
      a11y: 'Accesibilidad', a11yHref: '/es/accessibility/'
    },
    zh: {
      title: 'Cookie',
      body: '本網站目前沒有使用任何追蹤或廣告 Cookie。如果日後加入分析工具，只有在你同意後才會啟用。你可以隨時在頁面底部的「Cookie 設定」更改選擇。',
      accept: '接受', deny: '拒絕', privacy: '隱私權政策',
      a11y: '無障礙', a11yHref: '/zh/accessibility/'
    }
  }[L];

  function read() {
    try { var v = window.localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; }
    catch (e) { return null; }
  }
  function save(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* private window: choice lasts this page only */ }
    window.dmeCookieChoice = v;
    try { window.dispatchEvent(new CustomEvent('dme-cookie-choice', { detail: v })); } catch (e) {}
  }
  window.dmeCookieChoice = read();

  var css =
    '.dme-a11y{position:fixed;left:16px;bottom:16px;z-index:900;width:48px;height:48px;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;background:#C9A84C;color:#0A0A0C;' +
    'box-shadow:0 4px 18px rgba(0,0,0,.45);transition:bottom .2s,transform .2s}' +
    '.dme-a11y:hover{transform:translateY(-2px)}' +
    '.dme-a11y:focus-visible,.dme-cookie button:focus-visible,.dme-cookie a:focus-visible{outline:3px solid #EDEAE2;outline-offset:3px}' +
    '.dme-a11y svg{width:28px;height:28px}' +
    '.dme-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:950;max-width:720px;margin:0 auto;' +
    'background:#16140F;border:1px solid rgba(201,168,76,.45);border-radius:16px;padding:18px 20px;' +
    'color:#EDEAE2;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
    'box-shadow:0 10px 40px rgba(0,0,0,.6);display:flex;gap:16px;align-items:center;flex-wrap:wrap}' +
    '.dme-cookie p{flex:1 1 320px;margin:0;color:#D6D2C8}' +
    '.dme-cookie strong{color:#C9A84C;display:block;font-size:13px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px}' +
    '.dme-cookie a{color:#C9A84C;text-decoration:underline;text-underline-offset:3px}' +
    '.dme-cookie .dme-btns{display:flex;gap:10px;flex:0 0 auto}' +
    '.dme-cookie button{font:600 15px/1 inherit;font-family:inherit;padding:12px 22px;border-radius:999px;cursor:pointer;min-width:110px;border:1px solid #C9A84C}' +
    '.dme-cookie .dme-accept{background:#C9A84C;color:#0A0A0C}' +
    '.dme-cookie .dme-deny{background:#C9A84C;color:#0A0A0C}' +
    'body.dme-cookie-open .dme-a11y{bottom:calc(16px + var(--dme-cookie-h,140px))}' +
    '@media (max-width:560px){.dme-cookie .dme-btns{width:100%}.dme-cookie button{flex:1}}' +
    '@media (prefers-reduced-motion:reduce){.dme-a11y{transition:none}}';

  // The international symbol of access, drawn as a person with open arms.
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4.2" r="2" fill="currentColor"/>' +
    '<path fill="currentColor" d="M4.5 7.6a1 1 0 0 1 1.2-.7c2 .5 4.1.8 6.3.8s4.3-.3 6.3-.8a1 1 0 1 1 .5 1.9c-1.5.4-3 .6-4.6.8v3.1l1.9 6.7a1 1 0 1 1-1.9.6L12.5 14h-1l-1.7 6a1 1 0 1 1-1.9-.6l1.9-6.7V9.6c-1.6-.2-3.1-.4-4.6-.8a1 1 0 0 1-.7-1.2z"/></svg>';

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var a11y = document.createElement('a');
    a11y.className = 'dme-a11y';
    a11y.href = COPY.a11yHref;
    a11y.setAttribute('aria-label', COPY.a11y);
    a11y.title = COPY.a11y;
    a11y.innerHTML = ICON;
    document.body.appendChild(a11y);

    var banner = null;
    function close() {
      if (!banner) return;
      banner.remove(); banner = null;
      document.body.classList.remove('dme-cookie-open');
    }
    function open() {
      if (banner) return;
      banner = document.createElement('div');
      banner.className = 'dme-cookie';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', COPY.title);
      var p = document.createElement('p');
      var t = document.createElement('strong'); t.textContent = COPY.title;
      p.appendChild(t);
      p.appendChild(document.createTextNode(COPY.body + ' '));
      var link = document.createElement('a');
      link.href = 'https://j37953242.github.io/dmengine-legal/#privacy';
      link.textContent = COPY.privacy;
      p.appendChild(link);
      var btns = document.createElement('div'); btns.className = 'dme-btns';
      var deny = document.createElement('button'); deny.type = 'button'; deny.className = 'dme-deny'; deny.textContent = COPY.deny;
      var accept = document.createElement('button'); accept.type = 'button'; accept.className = 'dme-accept'; accept.textContent = COPY.accept;
      deny.addEventListener('click', function () { save('denied'); close(); });
      accept.addEventListener('click', function () { save('granted'); close(); });
      btns.appendChild(deny); btns.appendChild(accept);
      banner.appendChild(p); banner.appendChild(btns);
      document.body.appendChild(banner);
      document.body.classList.add('dme-cookie-open');
      document.body.style.setProperty('--dme-cookie-h', (banner.offsetHeight + 12) + 'px');
    }

    if (!window.dmeCookieChoice) open();
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-cookie-choices]');
      if (!el) return;
      e.preventDefault();
      open();
      var first = banner && banner.querySelector('button');
      if (first) first.focus();
    });
  });
})();
