import caseManager from '../systems/CaseManager.js';
import HUD from '../ui/HUD.js';

const C = {
  bg:        0x0d0d0b,
  card:      0x141410,
  cardHover: 0x1e1e18,
  border:    0x2a2510,
  text:      '#e8d5a3',
  dim:       '#555544',
  accent:    '#c8962a',
  danger:    '#c84040'
};

export default class SuspectsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SuspectsScene' });
  }

  init(data) {
    this._returnScene = data.returnScene || 'MapScene';
  }

  create() {
    const W = 960, H = 540;
    this.add.rectangle(0, 0, W, H, C.bg).setOrigin(0, 0);

    this.add.text(W / 2, 52, 'SUSPEITOS', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 66, 600, 1, C.border).setOrigin(0.5, 0);

    const suspects = caseManager.getRevealedSuspects();

    if (suspects.length === 0) {
      this.add.text(W / 2, H / 2, 'Nenhum suspeito identificado ainda.\nColete mais evidências.', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: C.dim, align: 'center'
      }).setOrigin(0.5, 0.5);
    } else {
      this._drawSuspectCards(suspects);
    }

    // Accusation note
    if (!caseManager.canAccuse() && suspects.length > 0) {
      this.add.text(W / 2, H - 50, 'Encontre uma nova evidência antes de fazer outra acusação.', {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#666644'
      }).setOrigin(0.5, 0.5);
    }

    new HUD(this, {
      showToolBelt: false,
      showBack: true,
      showEvidenceBoard: true,
      onBack: () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(this._returnScene);
        });
      },
      onEvidenceBoard: () => {
        this.scene.pause();
        this.scene.launch('EvidenceBoardScene', { returnScene: 'SuspectsScene' });
      }
    });

    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  _drawSuspectCards(suspects) {
    const CARD_W = 200, CARD_H = 300;
    const GAP    = 20;
    const W      = 960;
    const totalW = suspects.length * CARD_W + (suspects.length - 1) * GAP;
    const startX = (W - totalW) / 2;
    const Y      = 90;

    suspects.forEach((sus, i) => {
      const cx = startX + i * (CARD_W + GAP) + CARD_W / 2;
      const cy = Y + CARD_H / 2;

      this._drawCard(sus, cx, cy, CARD_W, CARD_H);
    });
  }

  _drawCard(sus, cx, cy, W, H) {
    const x = cx - W / 2, y = cy - H / 2;

    const card = this.add.rectangle(cx, cy, W, H, C.card)
      .setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.add.rectangle(cx, cy, W, H)
      .setOrigin(0.5, 0.5).setFillStyle(0, 0).setStrokeStyle(1, C.border);

    // Portrait
    this.add.image(cx, y + 70, sus.portrait)
      .setOrigin(0.5, 0.5).setDisplaySize(100, 120);

    // Name
    this.add.text(cx, y + 138, sus.name, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    // Divider
    this.add.rectangle(cx, y + 152, W - 20, 1, C.border).setOrigin(0.5, 0);

    // Profile excerpt
    this.add.text(cx, y + 162, sus.profile, {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dim,
      wordWrap: { width: W - 20 }, lineSpacing: 2
    }).setOrigin(0.5, 0);

    // Action buttons
    this._addCardButton(cx - W / 4, y + H - 22, 'Interrogar', C.accent, () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('InterrogationScene', { suspectId: sus.id });
      });
    });

    const canAcc = caseManager.canAccuse();
    this._addCardButton(cx + W / 4, y + H - 22, 'Acusar', canAcc ? C.danger : C.dim, () => {
      if (!canAcc) return;
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AccusationScene', { suspectId: sus.id });
      });
    });

    card.on('pointerover', () => card.setFillStyle(C.cardHover));
    card.on('pointerout',  () => card.setFillStyle(C.card));
  }

  _addCardButton(x, y, label, color, cb) {
    const btn = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(color));
    btn.on('pointerdown', cb);
    return btn;
  }
}
