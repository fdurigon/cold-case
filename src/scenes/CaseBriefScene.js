import caseManager from '../systems/CaseManager.js';
import DialogBox from '../ui/DialogBox.js';

const BRIEF_TEXT =
  'Porto Escarlate, outono de 1892.\n\n' +
  'Duas mulheres foram encontradas mortas em intervalos de três semanas. ' +
  'Os corpos exibem mutilações de precisão cirúrgica — o trabalho de alguém ' +
  'com conhecimento anatômico. A polícia local está sem pistas.\n\n' +
  'Você foi chamado para resolver o caso antes que o assassino ataque novamente.\n\n' +
  'Examine os locais do crime. Interrogue os suspeitos. ' +
  'Colete evidências. E então — faça sua acusação.';

export default class CaseBriefScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaseBriefScene' });
  }

  init(data) {
    this._caseId = data.caseId;
  }

  create() {
    const W = 960, H = 540;
    this.add.rectangle(0, 0, W, H, 0x0d0d0d).setOrigin(0, 0);

    const def = caseManager.definition;

    // Header
    this.add.text(W / 2, 44, def.codename.toUpperCase(), {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#c8962a', letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, 68, `Dificuldade ${def.difficulty}  ·  Porto Escarlate, 1892`, {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#444433'
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 82, 600, 1, 0x2a2510).setOrigin(0.5, 0);

    // Brief text
    const box = new DialogBox(this, 180, 100, 600, 350, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#c8b88a',
      typewriterSpeed: 35
    });
    box.setText(BRIEF_TEXT);

    // Click anywhere to skip
    this.input.once('pointerdown', () => {
      if (box.isTyping()) box.skipToEnd();
    });

    // CTA button (appears after text finishes or skip)
    const showBtn = () => {
      const btn = this._makeButton(W / 2, 470, 'Começar Investigação', () => {
        caseManager.startCase(this._caseId);
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MapScene');
        });
      });
      this.tweens.add({ targets: btn, alpha: { from: 0, to: 1 }, duration: 400 });
    };

    // Show button after typewriter completes
    box.setText(BRIEF_TEXT, false, showBtn);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  _makeButton(x, y, label, cb) {
    const W = 240, H = 38;

    const bg = this.add.rectangle(x, y, W, H, 0x181810)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    this.add.rectangle(x, y, W, H)
      .setOrigin(0.5, 0.5)
      .setFillStyle(0, 0)
      .setStrokeStyle(1, 0x2a2510)
      .setAlpha(0);

    const text = this.add.text(x, y, label, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5).setAlpha(0);

    bg.on('pointerover', () => { bg.setFillStyle(0x252515); text.setColor('#e8d5a3'); });
    bg.on('pointerout',  () => { bg.setFillStyle(0x181810); text.setColor('#c8962a'); });
    bg.on('pointerdown', cb);

    // Return container so caller can tween alpha
    const container = this.add.container(0, 0, [bg, text]).setAlpha(0);
    return container;
  }
}
