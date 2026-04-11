import caseManager from '../systems/CaseManager.js';
import HUD from '../ui/HUD.js';
import { drawPortrait } from '../ui/PortraitArt.js';

const C = {
  bg:        0x0d0d0b,
  card:      0x111110,
  cardHover: 0x191916,
  border:    0x2a2510,
  divider:   0x1e1c10,
  text:      '#e8d5a3',
  textBold:  '#f0e0b0',
  dim:       '#4a4a3a',
  dimMid:    '#666655',
  accent:    '#c8962a',
  danger:    '#c84040',
  label:     '#3a3828'
};

// Card dimensions — wider to fit all information
const CARD_W = 268;
const CARD_H = 430;
const GAP    = 18;

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

    this.add.text(W / 2, 26, 'SUSPEITOS', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: C.accent, letterSpacing: 5
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 38, 700, 1, C.border).setOrigin(0.5, 0);

    const suspects = caseManager.getRevealedSuspects();

    if (suspects.length === 0) {
      this.add.text(W / 2, H / 2,
        'Nenhum suspeito identificado ainda.\nColete mais evidências para revelar pistas.', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: C.dim,
          align: 'center', lineSpacing: 6
        }).setOrigin(0.5, 0.5);
    } else {
      this._drawCards(suspects);
    }

    if (!caseManager.canAccuse() && suspects.length > 0) {
      this.add.text(W / 2, H - 14,
        'Encontre uma nova evidência antes de fazer outra acusação.', {
          fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dim
        }).setOrigin(0.5, 1);
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

  _drawCards(suspects) {
    const W = 960;
    const totalW = suspects.length * CARD_W + (suspects.length - 1) * GAP;
    const startX = (W - totalW) / 2;
    const Y = 46;

    suspects.forEach((sus, i) => {
      const cx = startX + i * (CARD_W + GAP) + CARD_W / 2;
      const cy = Y + CARD_H / 2;
      this._drawCard(sus, cx, cy);
    });
  }

  _drawCard(sus, cx, cy) {
    const x = cx - CARD_W / 2;
    const y = cy - CARD_H / 2;

    // Card background + border
    const card = this.add.rectangle(cx, cy, CARD_W, CARD_H, C.card)
      .setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.add.rectangle(cx, cy, CARD_W, CARD_H)
      .setOrigin(0.5, 0.5).setFillStyle(0, 0).setStrokeStyle(1, C.border);

    // ── Portrait ────────────────────────────────────────────────
    const portH = 148;
    this.add.rectangle(x, y, CARD_W, portH, 0x0c0c0a).setOrigin(0, 0);
    if (this.textures.exists(sus.id)) {
      const img  = this.add.image(cx, y + portH / 2, sus.id).setOrigin(0.5, 0.5);
      const tex  = this.textures.get(sus.id).getSourceImage();
      const scale = Math.max(CARD_W / tex.width, portH / tex.height);
      img.setScale(scale);
      const mask = this.make.graphics({ x: 0, y: 0, add: false });
      mask.fillRect(x, y, CARD_W, portH);
      img.setMask(mask.createGeometryMask());
    } else {
      drawPortrait(this, sus.id, cx, y + portH / 2, CARD_W, portH);
    }
    // Portrait bottom divider
    this.add.rectangle(x, y + portH, CARD_W, 1, C.border).setOrigin(0, 0);

    // ── Name + meta ──────────────────────────────────────────────
    const nameY = y + portH + 14;
    this.add.text(cx, nameY, sus.name, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: C.textBold
    }).setOrigin(0.5, 0.5);

    const meta = [sus.age ? `${sus.age} anos` : '', sus.gender || '']
      .filter(Boolean).join('  ·  ');
    if (meta) {
      this.add.text(cx, nameY + 18, meta, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dimMid
      }).setOrigin(0.5, 0.5);
    }

    // ── Divider ──────────────────────────────────────────────────
    const div1Y = nameY + 32;
    this.add.rectangle(x + 10, div1Y, CARD_W - 20, 1, C.divider).setOrigin(0, 0);

    // ── Appearance ───────────────────────────────────────────────
    let cursorY = div1Y + 8;
    if (sus.appearance) {
      this._label(x + 10, cursorY, 'APARÊNCIA');
      cursorY += 14;
      const apText = this.add.text(x + 10, cursorY, sus.appearance, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.dimMid,
        wordWrap: { width: CARD_W - 20 }, lineSpacing: 2
      }).setOrigin(0, 0);
      cursorY += apText.height + 8;
    }

    // ── Behavior ─────────────────────────────────────────────────
    if (sus.behavior) {
      this.add.rectangle(x + 10, cursorY, CARD_W - 20, 1, C.divider).setOrigin(0, 0);
      cursorY += 8;
      this._label(x + 10, cursorY, 'COMPORTAMENTO');
      cursorY += 14;
      this.add.text(x + 10, cursorY, sus.behavior, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif',
        color: C.dimMid, fontStyle: 'italic',
        wordWrap: { width: CARD_W - 20 }, lineSpacing: 2
      }).setOrigin(0, 0);
    }

    // ── Action buttons (pinned to card bottom) ───────────────────
    const btnY = y + CARD_H - 22;
    this._actionBtn(cx - CARD_W / 4, btnY, 'Interrogar', C.accent, () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('InterrogationScene', { suspectId: sus.id });
      });
    });

    const canAcc  = caseManager.canAccuse();
    const accColor = canAcc ? C.danger : C.dim;
    this._actionBtn(cx + CARD_W / 4, btnY, 'Acusar', accColor, () => {
      if (!canAcc) return;
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AccusationScene', { suspectId: sus.id });
      });
    });

    // Bottom divider above buttons
    this.add.rectangle(x, y + CARD_H - 38, CARD_W, 1, C.divider).setOrigin(0, 0);

    card.on('pointerover', () => card.setFillStyle(C.cardHover));
    card.on('pointerout',  () => card.setFillStyle(C.card));
  }

  _label(x, y, text) {
    this.add.text(x, y, text, {
      fontSize: '8px', fontFamily: 'Arial, sans-serif',
      color: '#3a3828', letterSpacing: 2
    }).setOrigin(0, 0);
  }

  _actionBtn(x, y, label, color, cb) {
    const btn = this.add.text(x, y, label, {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(color));
    btn.on('pointerdown', cb);
    return btn;
  }
}
