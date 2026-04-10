import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';

const STARS = ['★☆☆', '★★☆', '★★★'];

export default class CaseSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaseSelectScene' });
  }

  create() {
    const W = 960, H = 540;
    this.add.rectangle(0, 0, W, H, 0x0d0d0d).setOrigin(0, 0);

    this.add.text(W / 2, 50, 'Selecionar Caso', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 70, 400, 1, 0x2a2510).setOrigin(0.5, 0);

    // For v0.1 there is only case_001
    const def = caseManager.definition;
    this._drawCaseCard(def, 480, 280);

    // Back button
    this._makeTextBtn(40, 30, '← Menu', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  _drawCaseCard(def, cx, cy) {
    const CW = 360, CH = 240;
    const x  = cx - CW / 2;
    const y  = cy - CH / 2;

    // Card background
    const card = this.add.rectangle(cx, cy, CW, CH, 0x141410)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });
    this.add.rectangle(cx, cy, CW, CH)
      .setOrigin(0.5, 0.5)
      .setFillStyle(0, 0)
      .setStrokeStyle(1, 0x2a2510);

    // Codename
    this.add.text(cx, y + 32, def.codename, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#e8d5a3'
    }).setOrigin(0.5, 0.5);

    // Difficulty
    const stars = STARS[Math.min(def.difficulty - 1, 2)] || STARS[0];
    this.add.text(cx, y + 60, `Dificuldade: ${stars}`, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#888866'
    }).setOrigin(0.5, 0.5);

    // Divider
    this.add.rectangle(cx, y + 78, CW - 40, 1, 0x2a2510).setOrigin(0.5, 0);

    // Status
    const { statusLabel, statusColor } = this._getCaseStatus(def.id);
    this.add.text(cx, y + 108, statusLabel, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: statusColor
    }).setOrigin(0.5, 0.5);

    // Flavor
    this.add.text(cx, y + 152, 'Porto Escarlate, 1892', {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#444433'
    }).setOrigin(0.5, 0.5);

    // CTA
    const ctaLabel = this._getCaseStatus(def.id).statusLabel === 'Em Andamento'
      ? 'Continuar' : 'Iniciar';

    this.add.text(cx, y + CH - 28, ctaLabel, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    card.on('pointerover', () => card.setFillStyle(0x1e1e18));
    card.on('pointerout',  () => card.setFillStyle(0x141410));
    card.on('pointerdown', () => this._selectCase(def));
  }

  _getCaseStatus(caseId) {
    const active    = saveManager.getActiveCase();
    const completed = saveManager.getCompletedCase(caseId);

    if (completed)
      return { statusLabel: `Resolvido — ${completed.final_reputation_earned} rep`, statusColor: '#40a860' };
    if (active && active.case_id === caseId)
      return { statusLabel: 'Em Andamento', statusColor: '#c8962a' };
    return { statusLabel: 'Novo', statusColor: '#666655' };
  }

  _selectCase(def) {
    const active = saveManager.getActiveCase();

    // If another case is in progress, ask before abandoning
    if (active && active.case_id !== def.id) {
      this._showAbandonConfirm(def);
      return;
    }

    this._startCase(def);
  }

  _showAbandonConfirm(def) {
    const W = 960, H = 540;
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7)
      .setOrigin(0.5, 0.5).setDepth(10).setInteractive();

    const box = this.add.rectangle(W / 2, H / 2, 400, 160, 0x141410)
      .setOrigin(0.5, 0.5).setDepth(11);
    this.add.rectangle(W / 2, H / 2, 400, 160)
      .setOrigin(0.5, 0.5).setFillStyle(0, 0).setStrokeStyle(1, 0x2a2510).setDepth(11);

    this.add.text(W / 2, H / 2 - 40, 'Você já tem um caso em andamento.\nAbandonar o caso atual?', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#e8d5a3',
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(12);

    this._makeTextBtn(W / 2 - 70, H / 2 + 30, 'Cancelar', () => {
      overlay.destroy(); box.destroy();
    }, 12);

    this._makeTextBtn(W / 2 + 70, H / 2 + 30, 'Abandonar', () => {
      caseManager.abandonCase();
      this._startCase(def);
    }, 12, '#c84040');
  }

  _startCase(def) {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CaseBriefScene', { caseId: def.id });
    });
  }

  _makeTextBtn(x, y, label, cb, depth = 0, color = '#c8962a') {
    const btn = this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color
    }).setOrigin(0.5, 0.5).setDepth(depth).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(color));
    btn.on('pointerdown', cb);
    return btn;
  }
}
