import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';
import createText from '../ui/DOMText.js';

// BootScene: loads game data and all visual assets, then transitions to MenuScene.

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.json('case_001', 'data/cases/case_001.json');

    // Location backgrounds
    this.load.image('loc_001', 'assets/locations/loc_001.png');
    this.load.image('loc_002', 'assets/locations/loc_002.png');
    this.load.image('loc_003', 'assets/locations/loc_003.png');
    this.load.image('loc_004', 'assets/locations/loc_004.png');
    this.load.image('loc_005', 'assets/locations/loc_005.png');

    // Suspect portraits (loaded as available; fallback to procedural if missing)
    this.load.image('suspect_001', 'assets/portraits/suspect_001.png');
    this.load.image('suspect_002', 'assets/portraits/suspect_002.png');
    this.load.image('suspect_003', 'assets/portraits/suspect_003.png');

    // Evidence icons (only the ones that exist so far; others use placeholder)
    this.load.image('ev_001', 'assets/evidence/ev_001.png');
    this.load.image('ev_002', 'assets/evidence/ev_002.png');
    this.load.image('ev_003', 'assets/evidence/ev_003.png');
    this.load.image('ev_004', 'assets/evidence/ev_004.png');
    this.load.image('ev_005', 'assets/evidence/ev_005.png');

    const W = 960, H = 540;
    const barW = 280, barH = 3;
    const barX = (W - barW) / 2, barY = H / 2 + 44;

    createText(this, W / 2, H / 2, 'COLD CASE', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    createText(this, W / 2, H / 2 + 26, 'carregando...', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#444433'
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(barX, barY, barW, barH, 0x1e1a10).setOrigin(0, 0);
    const bar = this.add.rectangle(barX, barY, 0, barH, 0xc8962a).setOrigin(0, 0);
    this.load.on('progress', v => bar.setSize(barW * v, barH));
  }

  create() {
    saveManager.load();
    caseManager.loadCaseDefinition(this.cache.json.get('case_001'));

    this.time.delayedCall(300, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
