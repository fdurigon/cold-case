import caseManager from '../systems/CaseManager.js';
import toolSystem from '../systems/ToolSystem.js';
import HUD from '../ui/HUD.js';
import DialogBox from '../ui/DialogBox.js';
import { drawLocationArt } from '../ui/LocationArt.js';
import createText from '../ui/DOMText.js';

// Maps location id → preloaded texture key
const LOCATION_TEXTURE = {
  loc_001: 'loc_001',
  loc_002: 'loc_002',
  loc_003: 'loc_003',
  loc_004: 'loc_004',
  loc_005: 'loc_005',
};

const C = {
  panel:       0x0f0f0b,
  panelBorder: 0x2a2510,
  btnBg:       0x181810,
  btnHover:    0x252515,
  btnDisabled: 0x111110,
  btnCheck:    0x1a2a10,
  textMain:    '#e8d5a3',
  textDim:     '#555544',
  textAccent:  '#c8962a',
  textDanger:  '#c84040',
  textSuccess: '#60c878'
};

export default class LocationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LocationScene' });
  }

  init(data) {
    this._locationId = data.locationId;
  }

  create() {
    const W = 960, H = 540;
    const def   = caseManager.definition;
    const loc   = def.locations.find(l => l.id === this._locationId);

    // Mark visited and reset per-visit search counter
    caseManager.visitLocation(this._locationId);

    this._loc  = loc;
    this._newEvidenceNames = [];

    // === Layout ===
    // Left: location image  (0 – 624, y 34 – 494)
    // Right: panel          (628 – 960, y 34 – 494)
    // Top bar: y 0 – 34  (HUD)
    // Bottom bar: y 498 – 540  (tool belt)

    const IMG_W  = 624, IMG_H = 460;
    const PAN_X  = 628, PAN_W = 332, PAN_H = 460;
    const TOP    = 34;

    // Location art — use real image if available, fall back to procedural
    const texKey = LOCATION_TEXTURE[loc.id];
    if (texKey && this.textures.exists(texKey)) {
      const img = this.add.image(0, TOP, texKey).setOrigin(0, 0);
      // Scale to fill the panel (cover), cropping centre
      const tex   = this.textures.get(texKey).getSourceImage();
      const scale = Math.max(IMG_W / tex.width, IMG_H / tex.height);
      img.setScale(scale);
      img.setPosition(
        (IMG_W - tex.width  * scale) / 2,
        TOP + (IMG_H - tex.height * scale) / 2
      );
      // Clip to the panel area
      const mask = this.make.graphics({ x: 0, y: 0, add: false });
      mask.fillRect(0, TOP, IMG_W, IMG_H);
      img.setMask(mask.createGeometryMask());
    } else {
      drawLocationArt(this, loc.id, 0, TOP, IMG_W, IMG_H);
    }

    // Right panel background
    this.add.rectangle(PAN_X, TOP, PAN_W, PAN_H, C.panel).setOrigin(0, 0);
    this.add.rectangle(PAN_X, TOP, 1, PAN_H, C.panelBorder).setOrigin(0, 0);

    // Location name
    createText(this, PAN_X + PAN_W / 2, TOP + 16, loc.name.toUpperCase(), {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: C.textAccent, letterSpacing: 2
    }).setOrigin(0.5, 0);

    this.add.rectangle(PAN_X + 10, TOP + 32, PAN_W - 20, 1, C.panelBorder).setOrigin(0, 0);

    // Atmosphere box (top third of panel)
    this._atmosBox = new DialogBox(this, PAN_X + 6, TOP + 36, PAN_W - 12, 140, {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#b09870',
      typewriterSpeed: 28
    });

    // Divider
    this.add.rectangle(PAN_X + 10, TOP + 182, PAN_W - 20, 1, C.panelBorder).setOrigin(0, 0);

    // Result text box (below objects list)
    this._resultBox = new DialogBox(this, PAN_X + 6, TOP + 336, PAN_W - 12, 110, {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: C.textMain,
      typewriterSpeed: 35
    });

    // Objects list area
    this._objListY = TOP + 190;

    // Build UI
    this._buildObjectList(loc, PAN_X, PAN_W, TOP);
    this._buildSearchCounter(PAN_X, PAN_W, TOP);

    // Start atmospheric description
    this._atmosBox.setText(loc.atmosphere.description, false, () => {
      this._resultBox.setText('Selecione uma ferramenta e examine os objetos.', true);
    });

    // Click on location image to skip typewriter
    this.add.rectangle(0, TOP, IMG_W, IMG_H, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => {
        if (this._atmosBox.isTyping()) this._atmosBox.skipToEnd();
      });

    // HUD
    new HUD(this, {
      showToolBelt: true,
      showBack: true,
      showEvidenceBoard: true,
      onBack: () => this._returnToMap(),
      onEvidenceBoard: () => {
        this.scene.pause();
        this.scene.launch('EvidenceBoardScene', { returnScene: 'LocationScene' });
      },
      onSuspects: () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('SuspectsScene', { returnScene: 'LocationScene' });
        });
      }
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  _buildObjectList(loc, PAN_X, PAN_W, TOP) {
    const BTN_H  = 28;
    const BTN_W  = PAN_W - 16;
    const startY = this._objListY;

    this._objButtons = [];

    loc.searchable_objects.forEach((obj, i) => {
      const by = startY + i * (BTN_H + 4);
      const bx = PAN_X + 8;
      const cx = bx + BTN_W / 2;

      const searched  = caseManager.isObjectSearched(obj.id);
      const hasEvClue = obj.evidence_id && caseManager.hasEvidence(obj.evidence_id);

      const bgColor  = searched ? C.btnDisabled : C.btnBg;
      const txtColor = searched ? C.textDim : C.textMain;

      const bg = this.add.rectangle(bx, by, BTN_W, BTN_H, bgColor)
        .setOrigin(0, 0);

      this.add.rectangle(bx, by, BTN_W, BTN_H)
        .setOrigin(0, 0)
        .setFillStyle(0, 0)
        .setStrokeStyle(1, searched ? 0x1a1a18 : C.panelBorder);

      const label = createText(this, bx + 8, by + BTN_H / 2, obj.label, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: txtColor
      }).setOrigin(0, 0.5);

      // Check icon if evidence was found here
      if (hasEvClue) {
        createText(this, bx + BTN_W - 14, by + BTN_H / 2, '✓', {
          fontSize: '11px', color: C.textSuccess
        }).setOrigin(1, 0.5);
      }

      if (!searched) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(C.btnHover));
        bg.on('pointerout',  () => bg.setFillStyle(C.btnBg));
        bg.on('pointerdown', () => this._searchObject(obj));
      }

      this._objButtons.push({ bg, label, obj });
    });
  }

  _buildSearchCounter(PAN_X, PAN_W, TOP) {
    const y = TOP + 190 + this._loc.searchable_objects.length * 32 + 6;
    const count = caseManager.getVisitSearchCount(this._locationId);
    const max   = this._loc.max_searches_per_visit;

    this._counterText = createText(this, PAN_X + PAN_W / 2, y,
      `Buscas esta visita: ${count} / ${max}`, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif', color: C.textDim
      }).setOrigin(0.5, 0);
  }

  _searchObject(obj) {
    const count = caseManager.getVisitSearchCount(this._locationId);
    const max   = this._loc.max_searches_per_visit;

    // Search limit check
    if (count >= max) {
      this._resultBox.setText(
        'Você precisa sair e voltar outro dia para continuar investigando.',
        false
      );
      return;
    }

    const toolResult = toolSystem.checkObject(obj);

    switch (toolResult) {
      case 'no_tool':
        this._resultBox.setText(obj.description_no_tool +
          '\n\nSelecione uma ferramenta primeiro.', false);
        return;

      case 'wrong_tool':
        this._resultBox.setText(obj.description_wrong_tool, false);
        return;

      case 'no_tool_required':
      case 'match': {
        // Consume a search slot
        caseManager.incrementVisitSearch(this._locationId);
        this._updateCounter();

        // Determine result text and evidence
        let resultText;
        let foundNew = false;

        if (obj.evidence_id && !caseManager.hasEvidence(obj.evidence_id)) {
          // Find evidence
          caseManager.findEvidence(obj.evidence_id);
          caseManager.markObjectSearched(obj.id);
          foundNew = true;

          const ev = caseManager.definition.evidence.find(e => e.id === obj.evidence_id);
          resultText = obj.description_found;

          this._notifyEvidence(ev);
        } else {
          // Nothing to find
          caseManager.markObjectSearched(obj.id);
          resultText = obj.evidence_id
            ? obj.description_found  // evidence already found on a previous run
            : obj.description_found; // atmospheric (null evidence_id)
          if (!obj.evidence_id) resultText = obj.description_found || obj.description_empty;
        }

        this._resultBox.setText(resultText || obj.description_empty, false);
        this._refreshObjectButton(obj, foundNew);
        break;
      }
    }
  }

  _notifyEvidence(ev) {
    const banner = createText(this, 480, 480, `Nova evidência: ${ev.name}`, {
      fontSize: '12px', fontFamily: 'Georgia, serif',
      color: '#60c878',
      backgroundColor: '#0a1a0a',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 1).setDepth(90).setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      y: { from: 490, to: 470 },
      duration: 300,
      hold: 1800,
      yoyo: true,
      onComplete: () => banner.destroy()
    });
  }

  _refreshObjectButton(obj, foundEvidence) {
    const entry = this._objButtons.find(b => b.obj.id === obj.id);
    if (!entry) return;

    entry.bg.disableInteractive();
    entry.bg.setFillStyle(foundEvidence ? C.btnCheck : C.btnDisabled);
    entry.label.setColor(C.textDim);
  }

  _updateCounter() {
    const count = caseManager.getVisitSearchCount(this._locationId);
    const max   = this._loc.max_searches_per_visit;
    this._counterText.setText(`Buscas esta visita: ${count} / ${max}`);

    if (count >= max) {
      this._counterText.setColor('#c84040');
    }
  }

  _returnToMap() {
    caseManager.leaveLocation(this._locationId);
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MapScene');
    });
  }
}
