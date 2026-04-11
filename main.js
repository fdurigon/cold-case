import BootScene from './src/scenes/BootScene.js';
import MenuScene from './src/scenes/MenuScene.js';
import CaseSelectScene from './src/scenes/CaseSelectScene.js';
import CaseBriefScene from './src/scenes/CaseBriefScene.js';
import MapScene from './src/scenes/MapScene.js';
import LocationScene from './src/scenes/LocationScene.js';
import EvidenceBoardScene from './src/scenes/EvidenceBoardScene.js';
import SuspectsScene from './src/scenes/SuspectsScene.js';
import InterrogationScene from './src/scenes/InterrogationScene.js';
import AccusationScene from './src/scenes/AccusationScene.js';
import ResolutionScene from './src/scenes/ResolutionScene.js';

// ── HiDPI / Retina fix ────────────────────────────────────────────────────────
// Phaser 3.60 removed the top-level `resolution` config key for Text objects.
// Patching the factory here ensures every this.add.text() call in every scene
// automatically renders at the device pixel ratio, eliminating canvas blur on
// Retina / HiDPI displays — without touching any scene file.
const _dpr = window.devicePixelRatio || 1;
const _origText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, content, style) {
  const s = Object.assign({}, style);
  if (s.resolution === undefined) s.resolution = _dpr;
  return _origText.call(this, x, y, content, s);
};
// ─────────────────────────────────────────────────────────────────────────────

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#0d0d0d',
  antialias: true,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 390, height: 219 },
    max: { width: 1440, height: 810 }
  },
  scene: [
    BootScene,
    MenuScene,
    CaseSelectScene,
    CaseBriefScene,
    MapScene,
    LocationScene,
    EvidenceBoardScene,
    SuspectsScene,
    InterrogationScene,
    AccusationScene,
    ResolutionScene
  ]
};

new Phaser.Game(config);
