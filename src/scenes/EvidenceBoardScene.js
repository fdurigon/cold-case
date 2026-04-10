import caseManager from '../systems/CaseManager.js';

const C = {
  bg:     0x0d0d0b,
  panel:  0x111110,
  border: 0x2a2510,
  card:   0x181810,
  text:   '#e8d5a3',
  dim:    '#555544',
  accent: '#c8962a'
};

export default class EvidenceBoardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EvidenceBoardScene' });
  }

  init(data) {
    this._returnScene = data.returnScene || 'MapScene';
  }

  create() {
    const W = 960, H = 540;

    // Semi-transparent overlay (this scene is launched over another)
    this.add.rectangle(0, 0, W, H, C.bg, 0.97).setOrigin(0, 0);

    // Header
    this.add.text(W / 2, 28, 'QUADRO DE EVIDÊNCIAS', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: C.accent, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 44, W - 80, 1, C.border).setOrigin(0.5, 0);

    const found = caseManager.getFoundEvidence();

    if (found.length === 0) {
      this.add.text(W / 2, H / 2, 'Nenhuma evidência coletada ainda.', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: C.dim
      }).setOrigin(0.5, 0.5);
    } else {
      this._drawEvidenceGrid(found);
    }

    // Counter
    const total = caseManager.getTotalEvidenceCount();
    this.add.text(W / 2, H - 20, `${found.length} / ${total} evidências coletadas`, {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: C.dim
    }).setOrigin(0.5, 1);

    // Close button
    const closeBtn = this.add.text(W - 20, 28, '✕  Fechar', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: C.accent
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#e8d5a3'));
    closeBtn.on('pointerout',  () => closeBtn.setColor(C.accent));
    closeBtn.on('pointerdown', () => this._close());

    // ESC key to close
    this.input.keyboard.once('keydown-ESC', () => this._close());

    this.cameras.main.fadeIn(200, 13, 13, 11);
  }

  _drawEvidenceGrid(evidence) {
    const CARD_W = 180, CARD_H = 130;
    const COLS   = Math.min(evidence.length, 5);
    const GAP_X  = 8, GAP_Y  = 10;
    const W      = 960;

    const totalW = COLS * CARD_W + (COLS - 1) * GAP_X;
    const startX = (W - totalW) / 2;
    const startY = 58;

    evidence.forEach((ev, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx  = startX + col * (CARD_W + GAP_X) + CARD_W / 2;
      const cy  = startY + row * (CARD_H + GAP_Y) + CARD_H / 2;

      this._drawCard(ev, cx, cy, CARD_W, CARD_H);
    });
  }

  _drawCard(ev, cx, cy, W, H) {
    // Card background
    this.add.rectangle(cx, cy, W, H, C.card).setOrigin(0.5, 0.5);
    this.add.rectangle(cx, cy, W, H)
      .setOrigin(0.5, 0.5).setFillStyle(0, 0).setStrokeStyle(1, C.border);

    // Evidence image (small icon)
    this.add.image(cx - W / 2 + 26, cy - H / 2 + 26, ev.image)
      .setDisplaySize(36, 36).setOrigin(0.5, 0.5);

    // Name
    this.add.text(cx - W / 2 + 52, cy - H / 2 + 16, ev.name, {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: C.text,
      wordWrap: { width: W - 60 }
    }).setOrigin(0, 0.5);

    // Divider
    this.add.rectangle(cx, cy - H / 2 + 34, W - 16, 1, C.border).setOrigin(0.5, 0);

    // Description
    this.add.text(cx - W / 2 + 8, cy - H / 2 + 42, ev.description, {
      fontSize: '10px', fontFamily: 'Georgia, serif', color: C.dim,
      wordWrap: { width: W - 16 }, lineSpacing: 2
    }).setOrigin(0, 0);

    // Weight indicator
    const dots = '●'.repeat(ev.weight) + '○'.repeat(Math.max(0, 4 - ev.weight));
    this.add.text(cx + W / 2 - 8, cy + H / 2 - 8, dots, {
      fontSize: '9px', color: C.accent
    }).setOrigin(1, 1);
  }

  _close() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.scene.resume(this._returnScene);
    });
  }
}
