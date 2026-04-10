import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';

// BootScene: loads game data and transitions to MenuScene.
// All visual assets are drawn procedurally in their respective scenes
// (Phaser.Graphics render at native canvas resolution — no blurry pre-baked textures).

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.json('case_001', 'data/cases/case_001.json');

    const W = 960, H = 540;
    const barW = 280, barH = 3;
    const barX = (W - barW) / 2, barY = H / 2 + 44;

    this.add.text(W / 2, H / 2, 'COLD CASE', {
      fontSize: '36px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, H / 2 + 26, 'carregando...', {
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
