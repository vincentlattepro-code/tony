(() => {
  const MODEL_URL = 'assets/dina/kei_vowels_pro.model3.json';
  const canvas = document.getElementById('live2d');
  const voice = document.getElementById('voice');

  // Fond noir absolu sur navigateur, PWA, iPhone/iPad et Android.
  document.documentElement.style.background = '#000';
  document.body.style.background = '#000';
  const appEl = document.getElementById('app');
  if (appEl) appEl.style.background = '#000';

  let app, model, audioCtx, analyser, source, dataArray;
  let mouth = 0;
  let targetX = 0, targetY = 0;
  let breathPhase = 0;
  let baseBounds = null;

  function viewportSize() {
    const vv = window.visualViewport;
    return {
      w: Math.max(1, Math.round(vv ? vv.width : window.innerWidth)),
      h: Math.max(1, Math.round(vv ? vv.height : window.innerHeight))
    };
  }

  function resizeRenderer() {
    if (!app) return;
    const { w, h } = viewportSize();
    app.renderer.resize(w, h);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  function fitModel() {
    if (!model || !app) return;

    const { w, h } = viewportSize();
    resizeRenderer();

    if (!baseBounds) {
      model.scale.set(1);
      model.position.set(0, 0);
      model.pivot.set(0, 0);
      baseBounds = model.getLocalBounds();
    }

    const bw = Math.max(1, baseBounds.width);
    const bh = Math.max(1, baseBounds.height);

    // Responsive final : Dina reste entièrement visible, centrée horizontalement,
    // et son buste vient jusqu'au bas de l'écran quel que soit le support.
    const portrait = h >= w;
    const sideMargin = portrait ? 0.94 : 0.90;
    const topMarginPx = Math.max(12, h * (portrait ? 0.025 : 0.035));
    const usableW = w * sideMargin;
    const usableH = h - topMarginPx;
    const scale = Math.min(usableW / bw, usableH / bh);

    // Ancrage sur le centre-bas du rectangle réel du modèle.
    // Ainsi les épaules/buste touchent le bas sans couper la tête.
    model.pivot.set(
      baseBounds.x + baseBounds.width / 2,
      baseBounds.y + baseBounds.height
    );
    model.scale.set(scale);
    model.position.set(w / 2, h + 1);
  }

  function scheduleFit() {
    fitModel();
    requestAnimationFrame(() => fitModel());
    setTimeout(fitModel, 120);
    setTimeout(fitModel, 450);
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
      console.error('Bibliothèques Live2D indisponibles.');
      return;
    }

    PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);

    const { w, h } = viewportSize();
    app = new PIXI.Application({
      view: canvas,
      width: w,
      height: h,
      antialias: true,
      transparent: true,
      backgroundAlpha: 0,
      // Résolution logique volontairement fixée à 1 :
      // évite le facteur x3 des écrans Retina qui provoquait le décalage.
      resolution: 1,
      autoDensity: false
    });

    try {
      model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
      app.stage.addChild(model);
      scheduleFit();

      window.addEventListener('resize', scheduleFit);
      window.addEventListener('orientationchange', () => setTimeout(scheduleFit, 180));
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleFit);
      }

      app.ticker.add(updateLife, undefined, PIXI.UPDATE_PRIORITY.LOW);

      window.addEventListener('pointermove', (e) => {
        const { w, h } = viewportSize();
        targetX = Math.max(-1, Math.min(1, (e.clientX / w - 0.5) * 2));
        targetY = Math.max(-1, Math.min(1, (0.5 - e.clientY / h) * 2));
      });
      window.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
      });
    } catch (err) {
      console.error('Impossible de charger Dina :', err);
    }
  }

  window.dinaPlayAudio = async (src) => {
    try {
      setupAudioAnalysis();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      if (src) voice.src = src;
      voice.currentTime = 0;
      await voice.play();
    } catch (err) {
      console.error('Lecture audio impossible :', err);
    }
  };

  window.dinaCenter = () => {
    targetX = 0;
    targetY = 0;
    scheduleFit();
  };

  init();
})();
