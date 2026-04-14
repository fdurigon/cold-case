import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';
import createText from '../ui/DOMText.js';

const STARS = ['★☆☆', '★★☆', '★★★'];

export default class CaseSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaseSelectScene' });
  }

  create() {
    const W = 960, H = 540;
    this.add.rectangle(0, 0, W, H, 0x0d0d0d).setOrigin(0, 0);

    createText(this, W / 2, 50, 'Selecionar Caso', {
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

    // Card background (decorative only)
    this.add.rectangle(cx, cy, CW, CH, 0x141410).setOrigin(0.5, 0.5);
    this.add.rectangle(cx, cy, CW, CH)
      .setOrigin(0.5, 0.5)
      .setFillStyle(0, 0)
      .setStrokeStyle(1, 0x2a2510);

    // Codename
    createText(this, cx, y + 32, def.codename, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#e8d5a3'
    }).setOrigin(0.5, 0.5);

    // Difficulty
    const stars = STARS[Math.min(def.difficulty - 1, 2)] || STARS[0];
    createText(this, cx, y + 60, `Dificuldade: ${stars}`, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#888866'
    }).setOrigin(0.5, 0.5);

    // Divider
    this.add.rectangle(cx, y + 78, CW - 40, 1, 0x2a2510).setOrigin(0.5, 0);

    // Status
    const { statusLabel, statusColor, status } = this._getCaseStatus(def.id);
    createText(this, cx, y + 108, statusLabel, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: statusColor
    }).setOrigin(0.5, 0.5);

    // Flavor
    createText(this, cx, y + 152, 'Porto Escarlate, 1892', {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#444433'
    }).setOrigin(0.5, 0.5);

    // Action buttons based on status
    const btnY = y + CH - 28;
    if (status === 'novo') {
      this._makeTextBtn(cx, btnY, 'Iniciar', () => this._startCase(def));
    } else if (status === 'andamento') {
      this._makeTextBtn(cx - 60, btnY, 'Continuar', () => this._continueCase(def));
      this._makeTextBtn(cx + 60, btnY, 'Reiniciar', () => this._restartCase(def), 0, '#888866');
    } else {
      // resolvido
      this._makeTextBtn(cx, btnY, 'Reiniciar', () => this._restartCase(def));
    }
  }

  _getCaseStatus(caseId) {
    const active    = saveManager.getActiveCase();
    const completed = saveManager.getCompletedCase(caseId);

    // Active case takes priority over completed record — player may have restarted
    // after solving, so both can coexist in localStorage simultaneously.
    if (active && active.case_id === caseId)
      return { status: 'andamento', statusLabel: 'Em Andamento', statusColor: '#c8962a' };
    if (completed)
      return { status: 'resolvido', statusLabel: `Resolvido — ${completed.final_reputation_earned} rep`, statusColor: '#40a860' };
    return { status: 'novo', statusLabel: 'Novo', statusColor: '#666655' };
  }

  _continueCase(def) {
    caseManager.startCase(def.id);
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MapScene', { caseId: def.id });
    });
  }

  _restartCase(def) {
    const active = saveManager.getActiveCase();
    if (active && active.case_id === def.id) {
      caseManager.abandonCase();
    }
    this._startCase(def);
  }

  _startCase(def) {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CaseBriefScene', { caseId: def.id });
    });
  }

  _makeTextBtn(x, y, label, cb, depth = 0, color = '#c8962a') {
    const btn = createText(this, x, y, label, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color
    }).setOrigin(0.5, 0.5).setDepth(depth).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(color));
    btn.on('pointerdown', cb);
    return btn;
  }
}
