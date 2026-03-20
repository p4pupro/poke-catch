var PokemonService = (function () {
  var API = 'https://pokeapi.co/api/v2';
  var cache = {};
  var TOTAL = 151;

  function fetchPokemon(id) {
    if (cache[id]) return Promise.resolve(cache[id]);

    return fetch(API + '/pokemon/' + id)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var pokemon = {
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map(function (t) { return t.type.name; }),
          height: data.height / 10,
          weight: data.weight / 10
        };
        cache[id] = pokemon;
        return pokemon;
      });
  }

  function preloadImage(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = url;
    });
  }

  function getRandomPokemon() {
    var id = Math.floor(Math.random() * TOTAL) + 1;
    return fetchPokemon(id).then(function (pokemon) {
      return preloadImage(pokemon.image).then(function () {
        return pokemon;
      });
    });
  }

  function getCollection() {
    try {
      var saved = localStorage.getItem('pokecatch-collection');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function addToCollection(id) {
    var col = getCollection();
    if (col.indexOf(id) === -1) {
      col.push(id);
      col.sort(function (a, b) { return a - b; });
      localStorage.setItem('pokecatch-collection', JSON.stringify(col));
    }
    return col;
  }

  function isInCollection(id) {
    return getCollection().indexOf(id) !== -1;
  }

  return {
    fetchPokemon: fetchPokemon,
    getRandomPokemon: getRandomPokemon,
    getCollection: getCollection,
    addToCollection: addToCollection,
    isInCollection: isInCollection,
    TOTAL: TOTAL
  };
})();
