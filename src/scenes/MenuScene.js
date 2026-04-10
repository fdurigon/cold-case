import saveManager from '../systems/SaveManager.js';
import reputationSystem from '../systems/ReputationSystem.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = 960, H = 540;

    // Background
    this.add.rectangle(0, 0, W, H, 0x0d0d0d).setOrigin(0, 0);

    // Vignette-like gradient overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.5);
    vignette.fillRect(0, 0, W, 120);
    vignette.fillRect(0, H - 120, W, 120);

    // Decorative horizontal rules
    this.add.rectangle(W / 2, 180, 400, 1, 0x2a2510).setOrigin(0.5, 0.5);
    this.add.rectangle(W / 2, 360, 400, 1, 0x2a2510).setOrigin(0.5, 0.5);

    // Title
    this.add.text(W / 2, 200, 'COLD CASE', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      color: '#c8962a',
      letterSpacing: 12
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, 250, 'investigações sem solução', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#555544',
      letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    // Reputation display
    const rep = saveManager.getReputation();
    const tier = reputationSystem.getTierName(rep);
    this.add.text(W / 2, 310, `Reputação: ${rep}  ·  ${tier}`, {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: '#888866'
    }).setOrigin(0.5, 0.5);

    // Start button
    this._makeButton(W / 2, 390, 'Iniciar Investigação', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CaseSelectScene');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _makeButton(x, y, label, cb) {
    const W = 220, H = 40;

    const bg = this.add.rectangle(x, y, W, H, 0x181810)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    this.add.rectangle(x, y, W, H)
      .setOrigin(0.5, 0.5)
      .setFillStyle(0, 0)
      .setStrokeStyle(1, 0x2a2510);

    const text = this.add.text(x, y, label, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x252515);
      text.setColor('#e8d5a3');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x181810);
      text.setColor('#c8962a');
    });
    bg.on('pointerdown', cb);

    return bg;
  }
}
