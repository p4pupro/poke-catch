var Collection = (function () {
  var currentIndex = 0;
  var pokemonList = [];
  var touchStartX = 0;

  var TYPE_COLOR = {
    normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
    electric: '#F8D030', grass:    '#78C850', ice:      '#98D8D8',
    fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
    flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
    rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
    dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC'
  };

  var TYPE_EMOJI = {
    normal:   '⭐', fire:     '🔥', water:    '💧',
    electric: '⚡', grass:    '🌿', ice:      '❄️',
    fighting: '👊', poison:   '☠️', ground:   '🌍',
    flying:   '🪽', psychic:  '🔮', bug:      '🐛',
    rock:     '🪨', ghost:    '👻', dragon:   '🐉',
    dark:     '🌙', steel:    '⚙️', fairy:    '🧚'
  };

  var $track, $count, $prev, $next, $empty, $wrapper;

  function init() {
    $track = document.getElementById('carousel-track');
    $count = document.getElementById('collection-count');
    $prev = document.getElementById('btn-prev');
    $next = document.getElementById('btn-next');
    $empty = document.getElementById('collection-empty');
    $wrapper = document.getElementById('carousel-wrapper');

    $prev.addEventListener('click', function () { navigate(-1); });
    $next.addEventListener('click', function () { navigate(1); });

    $track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    $track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) navigate(dx > 0 ? -1 : 1);
    });
  }

  function buildCard(p, idx) {
    var t1 = (p.types && p.types[0]) || 'normal';
    var t2 = (p.types && p.types[1]) || t1;
    var c1 = TYPE_COLOR[t1] || TYPE_COLOR.normal;
    var c2 = TYPE_COLOR[t2] || c1;

    var badges = (p.types || ['normal']).map(function (t) {
      var bg = TYPE_COLOR[t] || TYPE_COLOR.normal;
      var emoji = TYPE_EMOJI[t] || '⭐';
      var label = I18n.t('type_' + t);
      return '<span class="type-badge" style="background:' + bg + '">' +
        emoji + ' ' + label + '</span>';
    }).join('');

    return '<div class="carousel-card" data-index="' + idx + '">' +
      '<div class="card-inner-v2" style="--c1:' + c1 + ';--c2:' + c2 + ';">' +
        '<div class="card-orb card-orb-1"></div>' +
        '<div class="card-orb card-orb-2"></div>' +
        '<span class="card-number-v2">#' + String(p.id).padStart(3, '0') + '</span>' +
        '<div class="card-img-wrap">' +
          '<img src="' + p.image + '" alt="' + p.name + '" draggable="false">' +
        '</div>' +
        '<h3 class="card-name-v2">' + p.name + '</h3>' +
        '<div class="type-badges">' + badges + '</div>' +
        '<div class="card-info">' +
          '<div class="info-chip">' +
            '<span class="info-icon">📏</span>' +
            '<span>' + p.height.toFixed(1) + ' m</span>' +
          '</div>' +
          '<div class="info-chip">' +
            '<span class="info-icon">⚖️</span>' +
            '<span>' + p.weight.toFixed(1) + ' kg</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var collection = PokemonService.getCollection();
    $count.textContent = collection.length;

    if (collection.length === 0) {
      $empty.classList.remove('hidden');
      $wrapper.classList.add('hidden');
      return Promise.resolve();
    }

    $empty.classList.add('hidden');
    $wrapper.classList.remove('hidden');
    if (currentIndex >= collection.length) currentIndex = collection.length - 1;

    return Promise.all(
      collection.map(function (id) { return PokemonService.fetchPokemon(id); })
    ).then(function (list) {
      pokemonList = list;
      $track.innerHTML = pokemonList.map(buildCard).join('');
      updateTrack();
    });
  }

  function navigate(dir) {
    if (pokemonList.length === 0) return;
    SoundFX.playClick();
    currentIndex = (currentIndex + dir + pokemonList.length) % pokemonList.length;
    updateTrack();
  }

  function updateTrack() {
    $track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';
  }

  return { init: init, render: render };
})();
