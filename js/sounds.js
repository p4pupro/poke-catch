var SoundFX = (function () {
  var ctx;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playThrow() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.3);
  }

  function playPop() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.12);

    var n = c.createBufferSource();
    var buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    n.buffer = buf;
    var ng = c.createGain();
    ng.gain.setValueAtTime(0.2, c.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
    n.connect(ng);
    ng.connect(c.destination);
    n.start();
  }

  function playSnap() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 1500;
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.04);

    var o2 = c.createOscillator();
    var g2 = c.createGain();
    o2.type = 'square';
    o2.frequency.value = 900;
    g2.gain.setValueAtTime(0.15, c.currentTime + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    o2.connect(g2);
    g2.connect(c.destination);
    o2.start(c.currentTime + 0.04);
    o2.stop(c.currentTime + 0.08);
  }

  function playWobble() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, c.currentTime);
    osc.frequency.linearRampToValueAtTime(220, c.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(140, c.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(200, c.currentTime + 0.45);
    gain.gain.setValueAtTime(0.18, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.5);
  }

  function playBurst() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.35);
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.35);

    var n = c.createBufferSource();
    var buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
    n.buffer = buf;
    var ng = c.createGain();
    ng.gain.setValueAtTime(0.15, c.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    n.connect(ng);
    ng.connect(c.destination);
    n.start();
  }

  function playCatch() {
    var c = getCtx();
    var notes = [523, 659, 784, 1047];
    notes.forEach(function (freq, i) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, c.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.18);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime + i * 0.12);
      osc.stop(c.currentTime + i * 0.12 + 0.18);
    });
  }

  function playEscape() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.35);
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.35);
  }

  function playClick() {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.1, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.08);
  }

  return {
    playThrow: playThrow,
    playPop: playPop,
    playSnap: playSnap,
    playWobble: playWobble,
    playBurst: playBurst,
    playCatch: playCatch,
    playEscape: playEscape,
    playClick: playClick
  };
})();
