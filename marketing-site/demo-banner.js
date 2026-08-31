// Dismissible "demonstration site" banner. Shared across every page so the
// dismissal (localStorage) persists as someone browses between pages.
(function () {
  var KEY = 'gc_demo_banner_dismissed';
  var banner = document.getElementById('demo-banner');
  if (!banner) return;

  var dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}

  if (dismissed) {
    banner.style.display = 'none';
    return;
  }

  var closeBtn = document.getElementById('demo-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      banner.style.display = 'none';
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
    });
  }
})();
