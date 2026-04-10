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

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#0d0d0d',
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
