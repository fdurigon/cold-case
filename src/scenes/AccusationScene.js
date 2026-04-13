import caseManager from '../systems/CaseManager.js';
import reputationSystem from '../systems/ReputationSystem.js';
import saveManager from '../systems/SaveManager.js';
import { drawPortrait } from '../ui/PortraitArt.js';
import createText from '../ui/DOMText.js';

const C = {
  bg:      0x0d0d0b,
  panel:   0x141410,
  border:  0x2a2510,
  text:    '#e8d5a3',
  dim:     '#555544',
  accent:  '#c8962a',
  danger:  '#c84040',
  success: '#60c878'
};

export default class AccusationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AccusationScene' });
  }

  init(data) {
    this._suspectId = data.suspectId;
  }

  create() {
    const W = 960, H = 540;
    const sus = caseManager.getSuspectById(this._suspectId);

    this.add.rectangle(0, 0, W, H, C.bg).setOrigin(0, 0);

    // Title
    createText(this, W / 2, 44, 'ACUSAÇÃO FORMAL', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: C.danger, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 62, 500, 1, C.border).setOrigin(0.5, 0);

    // Suspect portrait — real image if available, fallback to procedural
    const portW = 120, portH = 140;
    const portX = W / 2 - portW / 2, portY = 160 - portH / 2;
    if (this.textures.exists(sus.id)) {
      const img  = this.add.image(W / 2, portY, sus.id).setOrigin(0.5, 0);
      const tex  = this.textures.get(sus.id).getSourceImage();
      const scale = Math.max(portW / tex.width, portH / tex.height);
      img.setScale(scale);
      const mask = this.make.graphics({ x: 0, y: 0, add: false });
      mask.fillRect(portX, portY, portW, portH);
      img.setMask(mask.createGeometryMask());
    } else {
      drawPortrait(this, sus.id, W / 2, 160, portW, portH);
    }

    createText(this, W / 2, 232, sus.name, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    // Warning
    createText(this, W / 2, 268, 'Tem certeza? Uma acusação errada prejudicará sua reputação.', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.dim
    }).setOrigin(0.5, 0.5);

    // Evidence summary
    const found = caseManager.getFoundEvidence();
    const weight = caseManager.getEvidenceWeight();
    createText(this, W / 2, 300, `${found.length} evidência(s) coletada(s)  ·  Peso total: ${weight}`, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#888866'
    }).setOrigin(0.5, 0.5);

    // Buttons
    this._makeBtn(W / 2 - 100, 370, 'Cancelar', C.dim, () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SuspectsScene', { returnScene: 'MapScene' });
      });
    });

    this._makeBtn(W / 2 + 100, 370, 'Confirmar Acusação', C.danger, () => {
      this._processAccusation();
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  _processAccusation() {
    caseManager.recordAccusation();
    const isCorrect    = caseManager.checkSolution(this._suspectId);
    const hasSufficient = caseManager.hasSufficientEvidence();

    if (!isCorrect) {
      this._handleWrongAccusation();
    } else if (hasSufficient) {
      this._handleCorrectFull();
    } else {
      this._handlePersuasionRoll();
    }
  }

  _handleWrongAccusation() {
    const delta = reputationSystem.applyWrongAccusation();
    this._showOutcome(
      'ACUSAÇÃO INCORRETA',
      C.danger,
      `Você acusou um inocente.\nO verdadeiro criminoso fugiu.\n\nReputação: ${delta}`,
      'Reiniciar Caso',
      () => {
        caseManager.abandonCase();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CaseSelectScene');
        });
      }
    );
  }

  _handleCorrectFull() {
    const def    = caseManager.definition;
    const found  = caseManager.getFoundEvidence().length;
    const delta  = reputationSystem.applyCorrectAccusation(def, found, true);
    const sus    = caseManager.getSuspectById(this._suspectId);

    this._recordCompletion(delta, found, true);

    this._showOutcome(
      'CONDENADO!',
      C.success,
      `${sus.name} foi condenado com base nas evidências.\n\nGanho de reputação: +${delta}`,
      'Ver Revelação',
      () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ResolutionScene', { repDelta: delta });
        });
      }
    );
  }

  _handlePersuasionRoll() {
    // Clear screen for d20 roll
    this.children.each(c => c.setVisible(false));

    const W = 960, H = 540;

    createText(this, W / 2, 80, 'JULGAMENTO', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    const rep         = saveManager.getReputation();
    const tierIdx     = reputationSystem.getTierIndex(rep);
    const threshold   = caseManager.getPersuasionThreshold(tierIdx);

    createText(this, W / 2, 118, `As evidências são insuficientes. O caso vai a julgamento.`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.dim
    }).setOrigin(0.5, 0.5);

    createText(this, W / 2, 142, `Limiar de persuasão: ${threshold}  (role ${threshold} ou mais no d20)`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.accent
    }).setOrigin(0.5, 0.5);

    // d20 drawn with Graphics (no pre-baked texture — scales cleanly at any DPR)
    const die = this._drawD20(W / 2, 280, 58);

    createText(this, W / 2, 390, 'Clique no dado para rolar', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    // Invisible hit area over the d20
    const dieHit = this.add.circle(W / 2, 280, 60, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    dieHit.on('pointerdown', () => {
      dieHit.disableInteractive();
      this._animateRoll(die, threshold, W);
    });
  }

  _drawD20(x, y, r) {
    const g = this.add.graphics();

    // Outer circle (die boundary)
    g.fillStyle(0x0e0c08);
    g.fillCircle(x, y, r);
    g.lineStyle(2, 0xc8962a, 1);
    g.strokeCircle(x, y, r);

    // Icosahedron face lines (6 spokes + inner hexagon)
    g.lineStyle(1, 0xc8962a, 0.35);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const ir = r * 0.55;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
      g.strokePath();
      // Inner hex ring
      const nx = x + Math.cos(a) * ir;
      const ny = y + Math.sin(a) * ir;
      const na = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 6;
      const nx2 = x + Math.cos(na) * ir;
      const ny2 = y + Math.sin(na) * ir;
      g.beginPath();
      g.moveTo(nx, ny);
      g.lineTo(nx2, ny2);
      g.strokePath();
    }

    // "20" text in center
    createText(this, x, y + 2, '20', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    return g;
  }

  _animateRoll(die, threshold, W) {
    // Shake the d20 Graphics via x offset (Graphics don't support angle tween directly)
    let frame = 0;
    const ticker = this.time.addEvent({
      delay: 60,
      repeat: 20,
      callback: () => {
        frame++;
        const fake = Phaser.Math.Between(1, 20);
        this._rollLabel(W, fake, '#888866', true);
        const shift = frame % 2 === 0 ? 6 : -6;
        this.tweens.add({ targets: die, x: W / 2 + shift, duration: 50, ease: 'Linear',
          onComplete: () => { die.x = W / 2; } });
      }
    });

    this.time.delayedCall(1350, () => {
      die.x = W / 2;
      const result = Phaser.Math.Between(1, 20);
      this._rollLabel(W, result, result >= threshold ? C.success : C.danger, false);
      this._resolveRoll(result, threshold);
    });
  }

  _rollLabel(W, value, color, temp) {
    if (this._rollText && !temp) { /* keep */ }
    if (temp && this._tempRollText) this._tempRollText.destroy();

    const t = createText(this, W / 2, 320, String(value), {
      fontSize: '44px', fontFamily: 'Georgia, serif', color
    }).setOrigin(0.5, 0.5);

    if (temp) this._tempRollText = t;
    else       this._rollText = t;
  }

  _resolveRoll(result, threshold) {
    const W = 960;
    const success = result >= threshold;

    this.time.delayedCall(600, () => {
      if (success) {
        const def   = caseManager.definition;
        const found = caseManager.getFoundEvidence().length;
        const delta = reputationSystem.applyCorrectAccusation(def, found, false);

        this._recordCompletion(delta, found, false);

        this._showOutcome(
          'CONVICÇÃO!',
          C.success,
          `O júri aceita seus argumentos.\n\nGanho de reputação: +${delta}`,
          'Ver Revelação',
          () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('ResolutionScene', { repDelta: delta });
            });
          }
        );
      } else {
        const delta = reputationSystem.applyAcquittal();
        this._showOutcome(
          'ABSOLVIDO',
          C.danger,
          `O júri não foi convencido. O suspeito foi solto.\n\nPerda de reputação: ${delta}\n\nContinue investigando.`,
          'Voltar ao Mapa',
          () => {
            this.cameras.main.fadeOut(250, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('MapScene');
            });
          }
        );
      }
    });
  }

  _recordCompletion(delta, evidenceFound, withSufficient) {
    const def = caseManager.definition;
    saveManager.markCaseComplete(def.id, {
      solved: true,
      final_reputation_earned: delta,
      evidence_found: evidenceFound,
      evidence_total: def.evidence.length,
      accusations_made: caseManager.state.accusations_made
    });
  }

  _showOutcome(title, titleColor, body, btnLabel, btnCb) {
    const W = 960, H = 540;

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setOrigin(0.5, 0.5).setDepth(50);

    const box = this.add.rectangle(W / 2, H / 2, 480, 260, C.panel)
      .setOrigin(0.5, 0.5).setDepth(51);
    this.add.rectangle(W / 2, H / 2, 480, 260)
      .setOrigin(0.5, 0.5).setFillStyle(0, 0).setStrokeStyle(1, C.border).setDepth(51);

    createText(this, W / 2, H / 2 - 90, title, {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: titleColor, letterSpacing: 4
    }).setOrigin(0.5, 0.5).setDepth(52);

    createText(this, W / 2, H / 2 - 20, body, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.text,
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5, 0.5).setDepth(52);

    const btn = createText(this, W / 2, H / 2 + 90, btnLabel, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.accent
    }).setOrigin(0.5, 0.5).setDepth(52).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(C.accent));
    btn.on('pointerdown', btnCb);
  }

  _makeBtn(x, y, label, color, cb) {
    const W = 200, H = 38;
    const bg = this.add.rectangle(x, y, W, H, C.panel)
      .setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, W, H).setOrigin(0.5, 0.5).setFillStyle(0, 0)
      .setStrokeStyle(1, C.border);
    const txt = createText(this, x, y, label, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color
    }).setOrigin(0.5, 0.5);
    bg.on('pointerover', () => { bg.setFillStyle(0x1e1e18); txt.setColor('#e8d5a3'); });
    bg.on('pointerout',  () => { bg.setFillStyle(C.panel);  txt.setColor(color); });
    bg.on('pointerdown', cb);
  }
}
