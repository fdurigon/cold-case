import caseManager from '../systems/CaseManager.js';
import reputationSystem from '../systems/ReputationSystem.js';
import saveManager from '../systems/SaveManager.js';

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
    this.add.text(W / 2, 44, 'ACUSAÇÃO FORMAL', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: C.danger, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 62, 500, 1, C.border).setOrigin(0.5, 0);

    // Suspect portrait
    this.add.image(W / 2, 160, sus.portrait)
      .setOrigin(0.5, 0.5).setDisplaySize(100, 125);

    this.add.text(W / 2, 232, sus.name, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    // Warning
    this.add.text(W / 2, 268, 'Tem certeza? Uma acusação errada prejudicará sua reputação.', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.dim
    }).setOrigin(0.5, 0.5);

    // Evidence summary
    const found = caseManager.getFoundEvidence();
    const weight = caseManager.getEvidenceWeight();
    this.add.text(W / 2, 300, `${found.length} evidência(s) coletada(s)  ·  Peso total: ${weight}`, {
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

    this.add.text(W / 2, 80, 'JULGAMENTO', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    const rep         = saveManager.getReputation();
    const tierIdx     = reputationSystem.getTierIndex(rep);
    const threshold   = caseManager.getPersuasionThreshold(tierIdx);

    this.add.text(W / 2, 118, `As evidências são insuficientes. O caso vai a julgamento.`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.dim
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, 142, `Limiar de persuasão: ${threshold}  (role ${threshold} ou mais no d20)`, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.accent
    }).setOrigin(0.5, 0.5);

    // d20 die
    const die = this.add.image(W / 2, 280, 'd20').setOrigin(0.5, 0.5).setDisplaySize(120, 120);

    this.add.text(W / 2, 390, 'Clique no dado para rolar', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    die.setInteractive({ useHandCursor: true });
    die.on('pointerdown', () => {
      die.disableInteractive();
      this._animateRoll(die, threshold, W);
    });
  }

  _animateRoll(die, threshold, W) {
    let frame = 0;
    const ticker = this.time.addEvent({
      delay: 60,
      repeat: 20,
      callback: () => {
        frame++;
        const fake = Phaser.Math.Between(1, 20);
        this._rollLabel(W, fake, '#888866', true);
        this.tweens.add({
          targets: die, angle: { from: 0, to: frame % 2 === 0 ? 8 : -8 },
          duration: 55, ease: 'Linear'
        });
      }
    });

    ticker.callback = ticker.callback; // keep ref

    this.time.delayedCall(1350, () => {
      const result = Phaser.Math.Between(1, 20);
      this.tweens.add({ targets: die, angle: 0, duration: 100 });
      this._rollLabel(W, result, result >= threshold ? C.success : C.danger, false);
      this._resolveRoll(result, threshold);
    });
  }

  _rollLabel(W, value, color, temp) {
    if (this._rollText && !temp) { /* keep */ }
    if (temp && this._tempRollText) this._tempRollText.destroy();

    const t = this.add.text(W / 2, 320, String(value), {
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

    this.add.text(W / 2, H / 2 - 90, title, {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: titleColor, letterSpacing: 4
    }).setOrigin(0.5, 0.5).setDepth(52);

    this.add.text(W / 2, H / 2 - 20, body, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: C.text,
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5, 0.5).setDepth(52);

    const btn = this.add.text(W / 2, H / 2 + 90, btnLabel, {
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
    const txt = this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color
    }).setOrigin(0.5, 0.5);
    bg.on('pointerover', () => { bg.setFillStyle(0x1e1e18); txt.setColor('#e8d5a3'); });
    bg.on('pointerout',  () => { bg.setFillStyle(C.panel);  txt.setColor(color); });
    bg.on('pointerdown', cb);
  }
}
