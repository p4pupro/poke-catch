var I18n = (function () {
  var STORAGE_KEY = 'pokecatch-lang';
  var DEFAULT_LANG = 'en';

  var TRANSLATIONS = {
    en: {
      btn_find:        'Gotta catch \'em all!',
      loading:         'Searching...',
      encounter:       'A wild {name} appeared!',
      caught:          'CAUGHT!',
      new_badge:       'NEW!',
      btn_more:        'More!',
      escaped:         'It escaped!',
      btn_retry:       'Try again!',
      collection_title:'My Collection',
      empty_msg:       'You have no Pokemon yet!',
      empty_sub:       'Go catch some!',
      nav_catch:       'Catch!',
      nav_collection:  'Collection',
      aria_prev:       'Previous',
      aria_next:       'Next',
      type_normal:     'Normal',
      type_fire:       'Fire',
      type_water:      'Water',
      type_electric:   'Electric',
      type_grass:      'Grass',
      type_ice:        'Ice',
      type_fighting:   'Fighting',
      type_poison:     'Poison',
      type_ground:     'Ground',
      type_flying:     'Flying',
      type_psychic:    'Psychic',
      type_bug:        'Bug',
      type_rock:       'Rock',
      type_ghost:      'Ghost',
      type_dragon:     'Dragon',
      type_dark:       'Dark',
      type_steel:      'Steel',
      type_fairy:      'Fairy'
    },
    es: {
      btn_find:        '\u00a1Hazte con todos!',
      loading:         'Buscando...',
      encounter:       '\u00a1Un {name} salvaje apareci\u00f3!',
      caught:          '\u00a1ATRAPADO!',
      new_badge:       '\u00a1NUEVO!',
      btn_more:        '\u00a1M\u00e1s!',
      escaped:         '\u00a1Se escap\u00f3!',
      btn_retry:       '\u00a1Otra vez!',
      collection_title:'Mi Colecci\u00f3n',
      empty_msg:       '\u00a1A\u00fan no tienes Pok\u00e9mon!',
      empty_sub:       '\u00a1Ve a atrapar algunos!',
      nav_catch:       '\u00a1Atrapar!',
      nav_collection:  'Colecci\u00f3n',
      aria_prev:       'Anterior',
      aria_next:       'Siguiente',
      type_normal:     'Normal',
      type_fire:       'Fuego',
      type_water:      'Agua',
      type_electric:   'El\u00e9ctrico',
      type_grass:      'Planta',
      type_ice:        'Hielo',
      type_fighting:   'Lucha',
      type_poison:     'Veneno',
      type_ground:     'Tierra',
      type_flying:     'Volador',
      type_psychic:    'Ps\u00edquico',
      type_bug:        'Bicho',
      type_rock:       'Roca',
      type_ghost:      'Fantasma',
      type_dragon:     'Drag\u00f3n',
      type_dark:       'Siniestro',
      type_steel:      'Acero',
      type_fairy:      'Hada'
    }
  };

  var currentLang = DEFAULT_LANG;

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    applyAll();
  }

  function t(key, params) {
    var str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
              (TRANSLATIONS[DEFAULT_LANG] && TRANSLATIONS[DEFAULT_LANG][key]) ||
              key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        str = str.replace('{' + k + '}', params[k]);
      });
    }
    return str;
  }

  function applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
  }

  function init() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TRANSLATIONS[saved]) currentLang = saved;
    } catch (e) {}
    document.documentElement.lang = currentLang;
  }

  init();

  return { getLang: getLang, setLang: setLang, t: t, applyAll: applyAll };
})();
