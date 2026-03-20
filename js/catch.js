var CatchGame = (function () {
  var CATCH_RATE = 0.88;
  var state = 'idle';
  var currentPokemon = null;

  var pbOriginX = 0, pbOriginY = 0;
  var dragStartX = 0, dragStartY = 0;
  var dragDX = 0, dragDY = 0;
  var touchHistory = [];

  var $scene, $btnFind, $display, $img, $name;
  var $pokeball, $catchBall, $result, $loading, $text;

  function init() {
    $scene = document.querySelector('.scene');
    $btnFind = document.getElementById('btn-find');
    $display = document.getElementById('pokemon-display');
    $img = document.getElementById('pokemon-image');
    $name = document.getElementById('pokemon-name');
    $pokeball = document.getElementById('pokeball');
    $catchBall = document.getElementById('catch-ball');
    $result = document.getElementById('catch-result');
    $loading = document.getElementById('loading');
    $text = document.getElementById('encounter-text');

    $btnFind.addEventListener('click', findPokemon);
    $pokeball.addEventListener('touchstart', pointerDown, { passive: false });
    document.addEventListener('touchmove', pointerMove, { passive: false });
    document.addEventListener('touchend', pointerUp);
    $pokeball.addEventListener('mousedown', pointerDown);
    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);
  }

  function findPokemon() {
    if (state !== 'idle') return;
    state = 'loading';
    $btnFind.classList.add('hidden');
    $loading.classList.remove('hidden');

    PokemonService.getRandomPokemon()
      .then(function (p) {
        currentPokemon = p;
        $loading.classList.add('hidden');
        showEncounter();
      })
      .catch(function () {
        $loading.classList.add('hidden');
        $btnFind.classList.remove('hidden');
        state = 'idle';
      });
  }

  function showEncounter() {
    $text.textContent = I18n.t('encounter', { name: currentPokemon.name.toUpperCase() });
    $text.classList.remove('hidden');
    $text.classList.add('animate-bounce-in');

    setTimeout(function () {
      $img.src = currentPokemon.image;
      $name.textContent = currentPokemon.name;
      $display.classList.remove('hidden');
      $display.classList.add('animate-bounce-in');

      setTimeout(function () {
        $display.classList.remove('animate-bounce-in');
        $display.classList.add('animate-float');
        $pokeball.classList.remove('hidden');
        resetPB();

        setTimeout(function () {
          var r = $pokeball.getBoundingClientRect();
          pbOriginX = r.left + r.width / 2;
          pbOriginY = r.top + r.height / 2;
          state = 'encounter';
        }, 150);
      }, 400);
    }, 500);
  }

  /* ==== DRAG ==== */

  function pointerDown(e) {
    if (state !== 'encounter') return;
    e.preventDefault();
    var p = e.touches ? e.touches[0] : e;
    dragStartX = p.clientX;
    dragStartY = p.clientY;
    dragDX = 0;
    dragDY = 0;
    touchHistory = [{ x: p.clientX, y: p.clientY, t: performance.now() }];
    $pokeball.style.transition = 'none';
    $pokeball.classList.add('grabbing');
    state = 'dragging';
    SoundFX.playClick();
  }

  function pointerMove(e) {
    if (state !== 'dragging') return;
    e.preventDefault();
    var p = e.touches ? e.touches[0] : e;
    dragDX = p.clientX - dragStartX;
    dragDY = p.clientY - dragStartY;
    $pokeball.style.transform = 'translate(' + dragDX + 'px,' + dragDY + 'px)';
    touchHistory.push({ x: p.clientX, y: p.clientY, t: performance.now() });
    if (touchHistory.length > 5) touchHistory.shift();
  }

  function pointerUp(e) {
    if (state !== 'dragging') return;
    $pokeball.classList.remove('grabbing');
    var p = e.changedTouches ? e.changedTouches[0] : e;
    var dx = p.clientX - dragStartX;
    var dy = p.clientY - dragStartY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dy < -20 || dist < 15) {
      throwPokeball();
    } else {
      returnPokeball();
    }
  }

  function returnPokeball() {
    $pokeball.style.transition = 'transform 0.3s ease-out';
    $pokeball.style.transform = 'translate(0,0)';
    setTimeout(function () { $pokeball.style.transition = ''; state = 'encounter'; }, 300);
  }

  function resetPB() {
    $pokeball.style.transition = '';
    $pokeball.style.transform = 'translate(0,0)';
    dragDX = 0; dragDY = 0; touchHistory = [];
  }

  /* ==== PHASE 1-2: ARC FLIGHT ==== */

  function qBez(t, a, b, c) { var m = 1 - t; return m * m * a + 2 * m * t * b + t * t * c; }

  function throwPokeball() {
    state = 'throwing';
    SoundFX.playThrow();

    var startX = pbOriginX + dragDX, startY = pbOriginY + dragDY;
    var pkRect = $img.getBoundingClientRect();
    var endX = pkRect.left + pkRect.width / 2;
    var endY = pkRect.top + pkRect.height / 2;

    var side = Math.random() > 0.5 ? 1 : -1;
    var cpX = (startX + endX) / 2 + side * (40 + Math.random() * 30);
    var cpY = Math.min(startY, endY) - 80 - Math.random() * 60;
    var duration = 550;
    var startTime = -1;

    $pokeball.classList.add('flying');

    function step(now) {
      if (startTime < 0) startTime = now;
      var t = Math.min((now - startTime) / duration, 1);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var x = qBez(e, startX, cpX, endX);
      var y = qBez(e, startY, cpY, endY);

      $pokeball.style.transform =
        'translate(' + (x - pbOriginX) + 'px,' + (y - pbOriginY) + 'px) ' +
        'scale(' + (1 - 0.4 * e) + ') rotate(' + (e * 720) + 'deg)';

      if (t < 1) requestAnimationFrame(step);
      else onImpact(endX, endY);
    }
    requestAnimationFrame(step);
  }

  /* ==== PHASE 3: IMPACT — POKEBALL OPENS ON POKEMON ==== */

  function onImpact(hitX, hitY) {
    $pokeball.classList.remove('flying');
    $pokeball.classList.add('hidden');
    SoundFX.playPop();

    var sr = $scene.getBoundingClientRect();
    $catchBall.style.transition = 'none';
    $catchBall.style.left = (hitX - sr.left - 36) + 'px';
    $catchBall.style.top = (hitY - sr.top - 36) + 'px';
    $catchBall.style.bottom = 'auto';
    $catchBall.classList.remove('hidden');
    $catchBall.classList.add('open');

    var flash = document.createElement('div');
    flash.className = 'flash-overlay';
    document.getElementById('screen-catch').appendChild(flash);

    setTimeout(function () { flash.remove(); startAbsorption(); }, 300);
  }

  /* ==== PHASE 4: ABSORPTION — POKEMON FADES INTO BALL ==== */

  function startAbsorption() {
    $display.classList.remove('animate-float');
    $text.classList.add('hidden');

    var pkR = $img.getBoundingClientRect();
    var cbR = $catchBall.getBoundingClientRect();
    spawnAbsorbParticles(
      pkR.left + pkR.width / 2, pkR.top + pkR.height / 2,
      cbR.left + cbR.width / 2, cbR.top + cbR.height / 2
    );

    $display.classList.add('absorbing');

    setTimeout(function () {
      $display.classList.add('hidden');
      $display.classList.remove('absorbing');
      closeBallAndFall();
    }, 700);
  }

  /* ==== PHASE 5: CLOSE & FALL TO GROUND ==== */

  function closeBallAndFall() {
    $catchBall.classList.remove('open');
    SoundFX.playSnap();

    var sr = $scene.getBoundingClientRect();
    var groundTop = sr.height * 0.72 - 36;
    var centerLeft = sr.width / 2 - 36;

    setTimeout(function () {
      $catchBall.style.transition = 'top 0.32s cubic-bezier(0.6,0,1,0.5), left 0.32s ease-out';
      $catchBall.style.top = groundTop + 'px';
      $catchBall.style.left = centerLeft + 'px';
      $catchBall.classList.add('grounded');

      setTimeout(function () {
        $catchBall.style.transition = 'top 0.1s ease-out';
        $catchBall.style.top = (groundTop - 10) + 'px';

        setTimeout(function () {
          $catchBall.style.transition = 'top 0.1s ease-in';
          $catchBall.style.top = groundTop + 'px';
          SoundFX.playClick();

          setTimeout(function () {
            $catchBall.style.transition = '';
            startWobble();
          }, 130);
        }, 100);
      }, 340);
    }, 300);
  }

  /* ==== PHASE 6: WOBBLE — 60° LEFT/RIGHT, UP TO 3× ==== */

  function startWobble() {
    var caught = Math.random() < CATCH_RATE;
    var breakAt = caught ? 99 : (Math.floor(Math.random() * 2) + 1);
    var total = caught ? 3 : breakAt;
    var idx = 0;

    function doOne() {
      idx++;
      SoundFX.playWobble();
      $catchBall.classList.add('wobbling', 'btn-flash');

      setTimeout(function () {
        $catchBall.classList.remove('wobbling', 'btn-flash');

        if (!caught && idx >= breakAt) {
          setTimeout(onCatchFail, 250);
        } else if (caught && idx >= total) {
          setTimeout(onCatchSuccess, 400);
        } else {
          setTimeout(doOne, 350);
        }
      }, 550);
    }

    setTimeout(doOne, 350);
  }

  /* ==== PHASE 7A: SUCCESS ==== */

  function onCatchSuccess() {
    SoundFX.playSnap();
    setTimeout(function () { SoundFX.playCatch(); }, 120);

    var isNew = !PokemonService.isInCollection(currentPokemon.id);
    PokemonService.addToCollection(currentPokemon.id);

    $catchBall.classList.add('catch-success');
    var r = $catchBall.getBoundingClientRect();
    burstStars(r.left + r.width / 2, r.top + r.height / 2);

    setTimeout(function () {
      $catchBall.classList.add('hidden');
      $catchBall.classList.remove('catch-success', 'grounded');
      showSuccessResult(isNew);
    }, 900);

    if (typeof App !== 'undefined') App.updateCollectionCount();
  }

  /* ==== PHASE 7B: FAIL — POKEMON BREAKS FREE ==== */

  function onCatchFail() {
    SoundFX.playBurst();
    $catchBall.classList.add('open');

    var r = $catchBall.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    spawnBurstParticles(cx, cy);

    var flash = document.createElement('div');
    flash.className = 'flash-overlay';
    document.getElementById('screen-catch').appendChild(flash);

    setTimeout(function () {
      flash.remove();
      $catchBall.classList.add('hidden');
      $catchBall.classList.remove('open', 'grounded');

      $display.classList.remove('hidden', 'absorbing');
      $display.classList.add('materialize');

      setTimeout(function () {
        $display.classList.remove('materialize');
        $display.classList.add('animate-float');
        showFailResult();
      }, 500);
    }, 400);
  }

  /* ==== RESULT UI ==== */

  function showSuccessResult(isNew) {
    $result.innerHTML =
      '<div class="result-box success">' +
        '<div class="stars"><span>⭐</span><span>✨</span><span>⭐</span></div>' +
        '<img class="pokemon-result-img" src="' + currentPokemon.image + '" alt="' + currentPokemon.name + '">' +
        '<p class="pokemon-result-name">' + currentPokemon.name + '</p>' +
        '<h2>' + I18n.t('caught') + '</h2>' +
        (isNew ? '<p class="new-badge">' + I18n.t('new_badge') + '</p>' : '') +
        '<button class="btn-action btn-success" onclick="CatchGame.reset()">' + I18n.t('btn_more') + '</button>' +
      '</div>';
    $result.classList.remove('hidden');
  }

  function showFailResult() {
    $result.innerHTML =
      '<div class="result-box fail">' +
        '<img class="pokemon-result-img" src="' + currentPokemon.image + '" alt="' + currentPokemon.name + '">' +
        '<p class="pokemon-result-name">' + currentPokemon.name + '</p>' +
        '<h2>' + I18n.t('escaped') + '</h2>' +
        '<button class="btn-action btn-retry" onclick="CatchGame.retry()">' + I18n.t('btn_retry') + '</button>' +
      '</div>';
    $result.classList.remove('hidden');
  }

  /* ==== PARTICLES & STARS ==== */

  function spawnAbsorbParticles(fx, fy, tx, ty) {
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('div');
      p.className = 'energy-particle';
      var ox = (Math.random() - 0.5) * 120, oy = (Math.random() - 0.5) * 120;
      p.style.left = fx + 'px'; p.style.top = fy + 'px';
      p.style.setProperty('--sx', ox + 'px');
      p.style.setProperty('--sy', oy + 'px');
      p.style.setProperty('--ex', (tx - fx) + 'px');
      p.style.setProperty('--ey', (ty - fy) + 'px');
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      var sz = 5 + Math.random() * 6;
      p.style.width = sz + 'px'; p.style.height = sz + 'px';
      document.body.appendChild(p);
      rm(p, 1200);
    }
  }

  function spawnBurstParticles(cx, cy) {
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('div');
      p.className = 'burst-particle';
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      var a = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      var d = 50 + Math.random() * 60;
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.animationDelay = (Math.random() * 0.12) + 's';
      document.body.appendChild(p);
      rm(p, 1000);
    }
  }

  function burstStars(cx, cy) {
    var g = ['⭐','✦','✨','⭐','✦','✨','⭐','✦'];
    for (var i = 0; i < g.length; i++) {
      var s = document.createElement('div');
      s.className = 'burst-star'; s.textContent = g[i];
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      var a = (i / g.length) * Math.PI * 2;
      var d = 70 + Math.random() * 50;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.style.animationDelay = (i * 0.05) + 's';
      document.body.appendChild(s);
      rm(s, 1200);
    }
  }

  function rm(el, ms) { setTimeout(function () { if (el.parentNode) el.remove(); }, ms); }

  /* ==== CLEANUP ==== */

  function cleanup() {
    document.querySelectorAll('.energy-particle,.burst-particle,.burst-star')
      .forEach(function (e) { e.remove(); });

    $catchBall.classList.add('hidden');
    $catchBall.classList.remove('open', 'wobbling', 'btn-flash', 'catch-success', 'burst-open', 'grounded');
    $catchBall.style.cssText = '';

    $pokeball.classList.remove('flying');
    resetPB();
  }

  function retry() {
    cleanup();
    $result.classList.add('hidden');
    $display.classList.remove('absorbing', 'materialize', 'caught-glow');
    $display.classList.remove('hidden');
    $display.classList.add('animate-float');
    $text.classList.remove('hidden');
    $pokeball.classList.remove('hidden');

    setTimeout(function () {
      var r = $pokeball.getBoundingClientRect();
      pbOriginX = r.left + r.width / 2;
      pbOriginY = r.top + r.height / 2;
      state = 'encounter';
    }, 100);
  }

  function reset() {
    cleanup();
    state = 'idle';
    currentPokemon = null;
    $result.classList.add('hidden');
    $display.classList.add('hidden');
    $display.classList.remove(
      'animate-bounce-in', 'animate-float', 'animate-shake',
      'caught-glow', 'absorbing', 'materialize'
    );
    $pokeball.classList.add('hidden');
    $text.classList.add('hidden');
    $text.classList.remove('animate-bounce-in');
    $btnFind.classList.remove('hidden');
  }

  return { init: init, reset: reset, retry: retry };
})();
