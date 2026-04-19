var App = (function () {
  function init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    var lastClickAt = 0;
    document.addEventListener('click', function (e) {
      var target = e.target.closest('button, [role="button"], .nav-item, .lang-btn');
      if (!target) return;
      var now = Date.now();
      if (now - lastClickAt < 350) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
      }
      lastClickAt = now;
    }, true);

    I18n.applyAll();
    CatchGame.init();
    Collection.init();

    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchScreen(btn.dataset.screen);
        SoundFX.playClick();
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        I18n.setLang(btn.getAttribute('data-lang'));
        SoundFX.playClick();
        var activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-collection') {
          Collection.render();
        }
      });
    });

    updateCollectionCount();

    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTouchEnd <= 350) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('active');
    });
    document.getElementById('screen-' + name).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.screen === name);
    });

    if (name === 'collection') {
      Collection.render();
    }
  }

  function updateCollectionCount() {
    var count = PokemonService.getCollection().length;
    var el = document.getElementById('collection-count');
    if (el) el.textContent = count;
  }

  document.addEventListener('DOMContentLoaded', init);

  return { updateCollectionCount: updateCollectionCount };
})();
