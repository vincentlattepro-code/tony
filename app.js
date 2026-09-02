(() => {
  const MODEL_URL = 'assets/dina/kei_vowels_pro.model3.json';
  const canvas = document.getElementById('live2d');
  const voice = document.getElementById('voice');
  const voiceBtn = document.getElementById('voiceBtn');
  const centerBtn = document.getElementById('centerBtn');
  const state = document.getElementById('state');
  const reply = document.getElementById('reply');
  const errorBox = document.getElementById('error');

  let app, model, audioCtx, analyser, source, dataArray;
  let mouth = 0;
  let targetX = 0, targetY = 0;
  let breathPhase = 0;

  const showError = (message) => {
    console.error(message);
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    state.textContent = 'ERREUR DINA';
  };

  function fitModel() {
    if (!model || !app) return;
    const w = app.renderer.width;
    const h = app.renderer.height;
    const scale = Math.min(w / model.width, h / model.height) * 0.93;
    model.scale.set(scale);
    model.anchor.set(0.5, 0.5);
    model.x = w / 2;
    model.y = h / 2 + h * 0.055;
  }

  function setupAudioAnalysis() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.58;
    dataArray = new Uint8Array(analyser.fftSize);
    source = audioCtx.createMediaElementSource(voice);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function updateMouth() {
    if (!model) return;
    let value = 0;
    if (!voice.paused && analyser) {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      value = Math.min(1, Math.max(0, (rms - 0.018) * 9.5));
    }
    mouth += (value - mouth) * (value > mouth ? 0.5 : 0.28);
    try {
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', mouth);
    } catch (_) {}
  }

  function updateLife(delta) {
    if (!model) return;
    breathPhase += delta / 60;
    const breath = (Math.sin(breathPhase * 1.55) + 1) / 2;
    try {
      const core = model.internalModel.coreModel;
      core.setParameterValueById('ParamBreath', breath);
      core.setParameterValueById('ParamAngleX', targetX * 18);
      core.setParameterValueById('ParamAngleY', targetY * 12);
      core.setParameterValueById('ParamBodyAngleX', targetX * 5);
    } catch (_) {}
    updateMouth();
  }

  async function init() {
    if (!window.PIXI || !PIXI.live2d || !window.Live2DCubismCore) {
      showError('Les bibliothèques Live2D n’ont pas pu être chargées. Vérifie la connexion Internet puis recharge la page.');
      return;
    }

    PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);
    app = new PIXI.Application({
      view: canvas,
      resizeTo: window,
      autoDensity: true,
      antialias: true,
      transparent: true,
      backgroundAlpha: 0,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });

    try {
      model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
      app.stage.addChild(model);
      fitModel();
      window.addEventListener('resize', fitModel);

      // L’ordre LOW applique nos micro-mouvements après la mise à jour standard du modèle.
      app.ticker.add(updateLife, undefined, PIXI.UPDATE_PRIORITY.LOW);

      window.addEventListener('pointermove', (e) => {
        targetX = Math.max(-1, Math.min(1, (e.clientX / innerWidth - 0.5) * 2));
        targetY = Math.max(-1, Math.min(1, (0.5 - e.clientY / innerHeight) * 2));
      });
      window.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });

      voiceBtn.disabled = false;
      centerBtn.disabled = false;
      state.textContent = 'DINA DISPONIBLE';
      reply.textContent = 'Bonjour. Je suis Dina.';
    } catch (err) {
      showError('Impossible de charger le modèle Dina : ' + (err?.message || err));
    }
  }

  voiceBtn.addEventListener('click', async () => {
    try {
      setupAudioAnalysis();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      voice.currentTime = 0;
      document.body.classList.add('speaking');
      state.textContent = 'DINA PARLE';
      reply.textContent = 'Test de la voix française et de la synchronisation labiale…';
      await voice.play();
    } catch (err) {
      showError('Lecture audio impossible : ' + (err?.message || err));
    }
  });

  voice.addEventListener('ended', () => {
    document.body.classList.remove('speaking');
    state.textContent = 'DINA DISPONIBLE';
    reply.textContent = 'Bonjour. Je suis Dina.';
  });

  centerBtn.addEventListener('click', () => {
    targetX = 0; targetY = 0; fitModel();
  });

  init();
})();
