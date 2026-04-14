import toolSystem from '../systems/ToolSystem.js';
import saveManager from '../systems/SaveManager.js';
import reputationSystem from '../systems/ReputationSystem.js';
import createText from './DOMText.js';

const C = {
  bg:              0x0d0d0d,
  border:          0x2a2510,
  accent:          0xc8962a,
  textAccent:      '#c8962a',
  textDim:         '#666655',
  toolInactive:    0x181810,
  toolActive:      0x3a2a08,
  toolBorderOff:   0x2a2a1a,
  toolBorderOn:    0xc8962a,
  toolLabelOff:    '#555544',
  toolLabelOn:     '#c8962a'
};

export default class HUD {
  constructor(scene, options = {}) {
    this.scene = scene;
    this._showToolBelt       = options.showToolBelt       !== false;
    this._showBack           = options.showBack           !== false;
    this._showEvidenceBoard  = options.showEvidenceBoard  !== false;
    this._onBack             = options.onBack             || null;
    this._onEvidenceBoard    = options.onEvidenceBoard    || null;
    this._onSuspects         = options.onSuspects         || null;
    this._onExit             = options.onExit             || null;

    this._toolBtns = [];
    this._depth    = options.depth ?? 100;

    this._buildTopBar();
    if (this._showToolBelt) this._buildToolBelt();
  }

  _buildTopBar() {
    const s = this.scene;
    const W = 960, H = 34;

    s.add.rectangle(0, 0, W, H, C.bg, 0.96).setOrigin(0, 0).setDepth(this._depth);
    s.add.rectangle(0, H - 1, W, 1, C.border).setOrigin(0, 0).setDepth(this._depth);

    const rep      = saveManager.getReputation();
    const tierName = reputationSystem.getTierName(rep);
    this._repText  = createText(s, 12, H / 2, `REP ${rep}  —  ${tierName}`, {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: C.textAccent
    }).setOrigin(0, 0.5).setDepth(this._depth + 1);

    if (this._showEvidenceBoard) {
      this._makeTopBtn(s, 860, H / 2, 'Evidências', () => {
        if (this._onEvidenceBoard) this._onEvidenceBoard();
      });
    }

    if (this._onSuspects) {
      this._makeTopBtn(s, 770, H / 2, 'Suspeitos', () => {
        this._onSuspects();
      });
    }

    if (this._onExit) {
      this._makeTopBtn(s, 680, H / 2, 'Sair', () => {
        this._onExit();
      }, '#888866');
    }

    if (this._showBack) {
      this._makeTopBtn(s, 950, H / 2, '← Voltar', () => {
        if (this._onBack) this._onBack();
      });
    }
  }

  _makeTopBtn(scene, x, y, label, cb, color = C.textAccent) {
    const btn = createText(scene, x, y, label, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color
    }).setOrigin(1, 0.5).setDepth(this._depth + 1).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e8d5a3'));
    btn.on('pointerout',  () => btn.setColor(color));
    btn.on('pointerdown', cb);
    return btn;
  }

  _buildToolBelt() {
    const s     = this.scene;
    const tools = toolSystem.tools;
    const W = 960, BAR_H = 42, BAR_Y = 540 - BAR_H;
    const BTN_W = 130, BTN_H = 30, GAP = 6;
    const totalW = tools.length * BTN_W + (tools.length - 1) * GAP;
    const startX = (W - totalW) / 2;

    s.add.rectangle(0, BAR_Y, W, BAR_H, C.bg, 0.96).setOrigin(0, 0).setDepth(this._depth);
    s.add.rectangle(0, BAR_Y, W, 1, C.border).setOrigin(0, 0).setDepth(this._depth);

    tools.forEach((tool, i) => {
      const bx = startX + i * (BTN_W + GAP);
      const by = BAR_Y + (BAR_H - BTN_H) / 2;
      const active = toolSystem.isEquipped(tool.id);

      const bg = s.add.rectangle(bx, by, BTN_W, BTN_H,
        active ? C.toolActive : C.toolInactive
      ).setOrigin(0, 0).setDepth(this._depth + 1).setInteractive({ useHandCursor: true });

      // Border via a stroked rectangle overlay
      const border = s.add.rectangle(bx + 0.5, by + 0.5, BTN_W - 1, BTN_H - 1)
        .setOrigin(0, 0)
        .setFillStyle(0x000000, 0)
        .setStrokeStyle(1, active ? C.toolBorderOn : C.toolBorderOff)
        .setDepth(this._depth + 2);

      const label = createText(s, bx + BTN_W / 2, by + BTN_H / 2, tool.name, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif',
        color: active ? C.toolLabelOn : C.toolLabelOff
      }).setOrigin(0.5, 0.5).setDepth(this._depth + 3);

      bg.on('pointerdown', () => {
        toolSystem.equip(tool.id);
        this.refreshToolBelt();
      });
      bg.on('pointerover', () => {
        if (!toolSystem.isEquipped(tool.id)) bg.setFillStyle(0x222214);
      });
      bg.on('pointerout', () => {
        if (!toolSystem.isEquipped(tool.id)) bg.setFillStyle(C.toolInactive);
      });

      this._toolBtns.push({ bg, border, label, toolId: tool.id });
    });
  }

  refreshToolBelt() {
    this._toolBtns.forEach(({ bg, border, label, toolId }) => {
      const active = toolSystem.isEquipped(toolId);
      bg.setFillStyle(active ? C.toolActive : C.toolInactive);
      border.setStrokeStyle(1, active ? C.toolBorderOn : C.toolBorderOff);
      label.setColor(active ? C.toolLabelOn : C.toolLabelOff);
    });
  }

  refreshReputation() {
    const rep      = saveManager.getReputation();
    const tierName = reputationSystem.getTierName(rep);
    this._repText.setText(`REP ${rep}  —  ${tierName}`);
  }
}
