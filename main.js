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

const BASE_W = 960, BASE_H = 540;
const MAX_W  = 1440, MAX_H  = 810;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width:  BASE_W,
  height: BASE_H,
  backgroundColor: '#0d0d0d',
  render: {
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
  dom: {
    createContainer: true   // enables scene.add.dom() for crisp native-rendered text
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
