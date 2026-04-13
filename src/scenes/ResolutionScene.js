import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';
import reputationSystem from '../systems/ReputationSystem.js';
import DialogBox from '../ui/DialogBox.js';
import createText from '../ui/DOMText.js';

const C = {
  bg:      0x0d0d0b,
  border:  0x2a2510,
  text:    '#e8d5a3',
  dim:     '#555544',
  accent:  '#c8962a',
  success: '#60c878'
};

export default class ResolutionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResolutionScene' });
  }

  init(data) {
    this._repDelta = data.repDelta || 0;
  }

  create() {
    const W = 960, H = 540;
    const def       = caseManager.definition;
    const completed = saveManager.getCompletedCase(def.id);
    const rep       = saveManager.getReputation();
    const tierName  = reputationSystem.getTierName(rep);

    this.add.rectangle(0, 0, W, H, C.bg).setOrigin(0, 0);

    // ── Header ──
    createText(this, W / 2, 36, 'CASO ENCERRADO', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 6
    }).setOrigin(0.5, 0.5);

    createText(this, W / 2, 58, def.codename, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.dim
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 70, 700, 1, C.border).setOrigin(0.5, 0);

    // ── Real crime reveal (typewriter) ──
    createText(this, W / 2, 88, 'A VERDADE POR TRÁS DO CASO', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: C.dim, letterSpacing: 3
    }).setOrigin(0.5, 0.5);

    const revealBox = new DialogBox(this, 100, 100, W - 200, 170, {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: '#b09870',
      bgAlpha: 0,
      typewriterSpeed: 32
    });

    // ── Stats panel ──
    const statY = 280;
    this.add.rectangle(W / 2, statY, 700, 1, C.border).setOrigin(0.5, 0);

    createText(this, W / 2, statY + 16, 'DESEMPENHO', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: C.dim, letterSpacing: 3
    }).setOrigin(0.5, 0.5);

    const foundCount = completed ? completed.evidence_found  : 0;
    const totalCount = completed ? completed.evidence_total  : def.evidence.length;
    const accCount   = completed ? completed.accusations_made : 1;

    const stats = [
      { label: 'Evidências coletadas', value: `${foundCount} / ${totalCount}` },
      { label: 'Acusações feitas',     value: String(accCount) },
      { label: 'Ganho de reputação',   value: `+${this._repDelta}` },
      { label: 'Reputação total',      value: `${rep}  —  ${tierName}` }
    ];

    stats.forEach((s, i) => {
      const sx = 180, sy = statY + 38 + i * 26;
      createText(this, sx, sy, s.label, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: C.dim
      }).setOrigin(0, 0.5);
      createText(this, W - 180, sy, s.value, {
        fontSize: '12px', fontFamily: 'Georgia, serif', color: C.text
      }).setOrigin(1, 0.5);
    });

    // Reputation gain animation
    const repGainText = createText(this, W / 2, statY + 150, `+${this._repDelta} REPUTAÇÃO`, {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: C.success
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({
      targets: repGainText,
      alpha: { from: 0, to: 1 },
      y: { from: statY + 170, to: statY + 150 },
      duration: 600,
      delay: 2000,
      ease: 'Cubic.out'
    });

    // ── Back to menu button ──
    const menuBtn = createText(this, W / 2, H - 30, 'Voltar ao Menu', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.accent
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

    menuBtn.on('pointerover', () => menuBtn.setColor('#e8d5a3'));
    menuBtn.on('pointerout',  () => menuBtn.setColor(C.accent));
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Start reveal text, then fade in button
    revealBox.setText(def.solution.reveal_text, false, () => {
      this.tweens.add({
        targets: menuBtn,
        alpha: { from: 0, to: 1 },
        duration: 500,
        delay: 500
      });
    });

    // Skip typewriter on click
    this.input.once('pointerdown', () => {
      if (revealBox.isTyping()) revealBox.skipToEnd();
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
