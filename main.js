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

// ── Definitive HiDPI / Retina fix ─────────────────────────────────────────────
//
// Root cause of blur: Phaser creates a 960×540 canvas buffer, then Scale.FIT
// CSS-scales it to fill the window (e.g. 1440×810 CSS px). On a Retina display
// (DPR=2), those 1440 CSS px = 2880 physical px, but the buffer is only 960px
// wide → 3× upscale → severe blur on all text, graphics and images.
//
// Fix: set render.resolution = fitScale × dpr so the canvas buffer is exactly
// the same size as the physical pixels it will occupy. Breakdown:
//
//   fitScale  = CSS zoom Phaser.Scale.FIT applies  (e.g. 1.5 on a 1440px window)
//   dpr       = window.devicePixelRatio            (e.g. 2 on Retina)
//   resolution = fitScale × dpr                    (e.g. 3)
//
//   Canvas buffer:  960 × 3  ×  540 × 3  =  2880 × 1620  px
//   CSS display:    960 × 1.5 × 540 × 1.5 =  1440 ×  810  CSS px  (via Scale FIT)
//   Physical px:    1440 × 2  ×  810 × 2  =  2880 × 1620  px  ← matches buffer: sharp!
//
// Phaser also exposes this value as game.config.resolution, which Text objects
// read automatically → all text is sharp with zero per-object patching.
// ─────────────────────────────────────────────────────────────────────────────
const BASE_W = 960, BASE_H = 540;
const MAX_W  = 1440, MAX_H  = 810;        // must match scale.max below
const dpr    = window.devicePixelRatio || 1;
const fitScale = Math.min(
  Math.min(window.innerWidth,  MAX_W) / BASE_W,
  Math.min(window.innerHeight, MAX_H) / BASE_H
);
const resolution = fitScale * dpr;
// ─────────────────────────────────────────────────────────────────────────────

const config = {
  type: Phaser.AUTO,
  width:  BASE_W,
  height: BASE_H,
  backgroundColor: '#0d0d0d',
  render: {
    resolution,           // ← the key fix: physical-pixel-perfect canvas buffer
    antialias: true,
    roundPixels: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  BASE_W,
    height: BASE_H,
    min: { width: 390,  height: 219 },
    max: { width: MAX_W, height: MAX_H }
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
