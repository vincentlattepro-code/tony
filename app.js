(() => {
  const MODEL_URL = 'assets/dina/kei_vowels_pro.model3.json';
  const canvas = document.getElementById('live2d');
  const voice = document.getElementById('voice');

  let app, model, audioCtx, analyser, source, dataArray;
  let mouth = 0;
  let targetX = 0, targetY = 0;
  let breathPhase = 0;

  function fitModel() {
    if (!model || !app) return;

    // IMPORTANT : la scène PIXI travaille en pixels CSS/logiques.
    // renderer.width/height utilisent les pixels physiques sur les écrans
    // Retina (iPhone/iPad), ce qui décalait Dina en bas à droite.
    const w = app.screen.width;
    const h = app.screen.height;

    const bounds = model.getLocalBounds();
    const naturalW = Math.max(1, bounds.width);
    const naturalH = Math.max(1, bounds.height);

    // Cadrage responsive : Dina entière dans la zone visible, avec une petite marge.
    const margin = (w < h) ? 0.90 : 0.94;
    const scale = Math.min(w / naturalW, h / naturalH) * margin;

    model.scale.set(scale);
    model.anchor.set(0.5, 0.5);
    model.position.set(w / 2, h / 2);
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
      app.ticker.add(updateLife, undefined, PIXI.UPDATE_PRIORITY.LOW);

      window.addEventListener('pointermove', (e) => {
        targetX = Math.max(-1, Math.min(1, (e.clientX / innerWidth - 0.5) * 2));
        targetY = Math.max(-1, Math.min(1, (0.5 - e.clientY / innerHeight) * 2));
      });
      window.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
      });
    } catch (err) {
      console.error('Impossible de charger Dina :', err);
    }
  }

  // Fonction conservée pour le futur backend : lance un fichier audio
  // et synchronise automatiquement l'ouverture de la bouche.
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
    fitModel();
  };

  init();
})();
