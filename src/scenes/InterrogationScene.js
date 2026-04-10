import caseManager from '../systems/CaseManager.js';
import HUD from '../ui/HUD.js';
import DialogBox from '../ui/DialogBox.js';
import { drawPortrait } from '../ui/PortraitArt.js';

const C = {
  bg:       0x0d0d0b,
  panel:    0x111110,
  border:   0x2a2510,
  btnBg:    0x181810,
  btnHover: 0x252515,
  btnUsed:  0x111110,
  text:     '#e8d5a3',
  dim:      '#555544',
  accent:   '#c8962a',
  success:  '#60c878'
};

export default class InterrogationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InterrogationScene' });
  }

  init(data) {
    this._suspectId = data.suspectId;
  }

  create() {
    const W = 960, H = 540;
    const sus = caseManager.getSuspectById(this._suspectId);

    this.add.rectangle(0, 0, W, H, C.bg).setOrigin(0, 0);

    // === Portrait panel (left 38%) ===
    const PORT_W = 365, PORT_H = H - 34;

    this.add.rectangle(0, 34, PORT_W, PORT_H, C.panel).setOrigin(0, 0);
    this.add.rectangle(PORT_W, 34, 1, PORT_H, C.border).setOrigin(0, 0);

    // Portrait drawn procedurally — no pre-baked texture
    const portH = Math.round(PORT_H * 0.5);
    const portY = 34 + Math.round(PORT_H * 0.13);
    drawPortrait(this, sus.id, PORT_W / 2, portY + portH / 2, PORT_W - 20, portH);

    this.add.text(PORT_W / 2, 34 + PORT_H * 0.68, sus.name, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: C.text
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(PORT_W / 2, 34 + PORT_H * 0.73, PORT_W - 40, 1, C.border).setOrigin(0.5, 0);

    this.add.text(PORT_W / 2, 34 + PORT_H * 0.76, sus.profile, {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dim,
      wordWrap: { width: PORT_W - 40 }, lineSpacing: 2, align: 'center'
    }).setOrigin(0.5, 0);

    // === Dialog panel (right 62%) ===
    const DLG_X = PORT_W + 8;
    const DLG_W = W - DLG_X - 8;

    this.add.text(DLG_X + DLG_W / 2, 34 + 18, 'INTERROGATÓRIO', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 3
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(DLG_X, 34 + 32, DLG_W, 1, C.border).setOrigin(0, 0);

    // Response area
    this._responseBox = new DialogBox(this, DLG_X, H - 200, DLG_W, 152, {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#b09870',
      bgAlpha: 0,
      typewriterSpeed: 35
    });

    this.add.rectangle(DLG_X, H - 205, DLG_W, 1, C.border).setOrigin(0, 0);
    this.add.text(DLG_X + 4, H - 199, 'Resposta:', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dim
    }).setOrigin(0, 0);

    // Dialog option buttons
    this._buildDialogButtons(sus, DLG_X, DLG_W);

    // HUD
    new HUD(this, {
      showToolBelt: false,
      showBack: true,
      showEvidenceBoard: true,
      onBack: () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('SuspectsScene', { returnScene: 'MapScene' });
        });
      },
      onEvidenceBoard: () => {
        this.scene.pause();
        this.scene.launch('EvidenceBoardScene', { returnScene: 'InterrogationScene' });
      }
    });

    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  _buildDialogButtons(sus, DLG_X, DLG_W) {
    const BTN_H  = 34;
    const BTN_W  = DLG_W;
    const startY = 34 + 44;

    // Only show dialogs whose required_evidence is already found
    const available = sus.dialogs.filter(d =>
      d.requires_evidence === null || caseManager.hasEvidence(d.requires_evidence)
    );

    if (available.length === 0) {
      this.add.text(DLG_X + DLG_W / 2, startY + 40, 'Encontre evidências para\ndesbloquear perguntas.', {
        fontSize: '12px', fontFamily: 'Georgia, serif', color: C.dim, align: 'center'
      }).setOrigin(0.5, 0);
      return;
    }

    available.forEach((dlg, i) => {
      const by  = startY + i * (BTN_H + 6);
      const bx  = DLG_X;
      const used = caseManager.isDialogUsed(dlg.id);

      const bgColor = used ? C.btnUsed : C.btnBg;
      const txtColor = used ? C.dim : C.text;

      const bg = this.add.rectangle(bx, by, BTN_W, BTN_H, bgColor)
        .setOrigin(0, 0);
      this.add.rectangle(bx, by, BTN_W, BTN_H)
        .setOrigin(0, 0).setFillStyle(0, 0)
        .setStrokeStyle(1, used ? 0x1a1a18 : C.border);

      const label = this.add.text(bx + 10, by + BTN_H / 2, dlg.label, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: txtColor
      }).setOrigin(0, 0.5);

      if (used) {
        this.add.text(bx + BTN_W - 10, by + BTN_H / 2, '✓', {
          fontSize: '11px', color: C.dim
        }).setOrigin(1, 0.5);
        return;
      }

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { bg.setFillStyle(C.btnHover); label.setColor(C.accent); });
      bg.on('pointerout',  () => { bg.setFillStyle(C.btnBg);   label.setColor(C.text); });
      bg.on('pointerdown', () => this._triggerDialog(dlg, bg, label));
    });
  }

  _triggerDialog(dlg, bg, label) {
    caseManager.markDialogUsed(dlg.id);

    // Disable button visually
    bg.disableInteractive();
    bg.setFillStyle(C.btnUsed);
    label.setColor(C.dim);

    // Show response
    this._responseBox.setText(dlg.text, false);

    // Reveal evidence if applicable
    if (dlg.reveals_evidence) {
      const ev = caseManager.definition.evidence.find(e => e.id === dlg.reveals_evidence);
      if (ev && caseManager.findEvidence(dlg.reveals_evidence)) {
        this._showEvidenceNotification(ev.name);
      }
    }
  }

  _showEvidenceNotification(name) {
    const banner = this.add.text(480, 500, `Nova evidência: ${name}`, {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: C.success,
      backgroundColor: '#0a1a0a',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 1).setDepth(90).setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      y: { from: 510, to: 490 },
      duration: 300,
      hold: 2000,
      yoyo: true,
      onComplete: () => banner.destroy()
    });
  }
}
