import caseManager from '../systems/CaseManager.js';
import saveManager from '../systems/SaveManager.js';

// Color palettes for location placeholder backgrounds
const LOC_PALETTES = [
  { base: 0x0d0a06, shadow: 0x1a1206 },  // loc_001 – sepia alley
  { base: 0x0a0c0d, shadow: 0x141a1c },  // loc_002 – tavern blue-grey
  { base: 0x060a0d, shadow: 0x0a1218 },  // loc_003 – docks dark blue
  { base: 0x0d0d0a, shadow: 0x1a1a10 },  // loc_004 – office amber
  { base: 0x0c0d0a, shadow: 0x181a14 },  // loc_005 – apothecary green-grey
];

const PORTRAIT_COLORS = [
  0x2a1a0a,  // suspect_001 – warm shadow
  0x1a1a2a,  // suspect_002 – cool shadow
  0x0a1a1a,  // suspect_003 – cold teal shadow
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load the case JSON
    this.load.json('case_001', 'data/cases/case_001.json');

    // Show a minimal loading bar
    const W = 960, H = 540;
    const barW = 300, barH = 4;
    const barX = (W - barW) / 2, barY = H / 2 + 40;

    this.add.rectangle(barX, barY, barW, barH, 0x222210).setOrigin(0, 0);
    const bar = this.add.rectangle(barX, barY, 0, barH, 0xc8962a).setOrigin(0, 0);

    this.add.text(W / 2, H / 2, 'COLD CASE', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#c8962a'
    }).setOrigin(0.5, 0.5);

    this.add.text(W / 2, H / 2 + 22, 'carregando...', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#555544'
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', v => bar.setSize(barW * v, barH));
  }

  create() {
    // Initialize save state
    saveManager.load();

    // Load the case definition into CaseManager
    const caseData = this.cache.json.get('case_001');
    caseManager.loadCaseDefinition(caseData);

    // Generate placeholder textures for all game assets
    this._genLocationTextures(caseData);
    this._genPortraitTextures(caseData);
    this._genEvidenceTexture();
    this._genMapTexture(caseData);
    this._genD20Texture();

    // Short pause so the loading screen is visible, then go to menu
    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  _genLocationTextures(caseData) {
    caseData.locations.forEach((loc, i) => {
      const pal = LOC_PALETTES[i] || LOC_PALETTES[0];
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });

      // Base fill
      gfx.fillStyle(pal.base);
      gfx.fillRect(0, 0, 624, 460);

      // Layered dark blocks to suggest architecture
      gfx.fillStyle(pal.shadow, 0.6);
      const seed = i * 137;
      for (let j = 0; j < 12; j++) {
        const rx = ((seed * (j + 1) * 73) % 580);
        const ry = ((seed * (j + 1) * 31) % 380);
        const rw = 30 + (seed * j * 17) % 120;
        const rh = 20 + (seed * j * 11) % 80;
        gfx.fillRect(rx, ry, rw, rh);
      }

      // Accent glow (lantern / window light)
      gfx.fillStyle(0xc8962a, 0.06);
      gfx.fillCircle(80 + i * 100, 120, 90);

      gfx.generateTexture(loc.image, 624, 460);
      gfx.destroy();
    });
  }

  _genPortraitTextures(caseData) {
    caseData.suspects.forEach((sus, i) => {
      const col = PORTRAIT_COLORS[i] || 0x1a1a1a;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });

      gfx.fillStyle(col);
      gfx.fillRect(0, 0, 160, 200);

      // Silhouette suggestion: head oval + body rectangle
      gfx.fillStyle(0x1a1206, 0.8);
      gfx.fillEllipse(80, 70, 70, 80);
      gfx.fillRect(35, 110, 90, 90);

      // Subtle highlight
      gfx.fillStyle(0xe8d5a3, 0.08);
      gfx.fillEllipse(80, 65, 40, 48);

      gfx.generateTexture(sus.portrait, 160, 200);
      gfx.destroy();
    });
  }

  _genEvidenceTexture() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0x1a1206);
    gfx.fillRect(0, 0, 80, 80);
    gfx.fillStyle(0xc8962a, 0.4);
    gfx.fillRect(8, 8, 64, 64);
    gfx.fillStyle(0xe8d5a3, 0.15);
    gfx.fillRect(20, 20, 40, 40);
    gfx.generateTexture('evidence_default', 80, 80);
    gfx.destroy();
  }

  _genMapTexture(caseData) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    // Map background – muted sepia
    gfx.fillStyle(0x0e0c08);
    gfx.fillRect(0, 0, 960, 460);

    // City grid lines
    gfx.lineStyle(1, 0x1e1a10, 0.5);
    for (let x = 0; x < 960; x += 60) {
      gfx.beginPath(); gfx.moveTo(x, 0); gfx.lineTo(x, 460); gfx.strokePath();
    }
    for (let y = 0; y < 460; y += 60) {
      gfx.beginPath(); gfx.moveTo(0, y); gfx.lineTo(960, y); gfx.strokePath();
    }

    // River diagonal stripe
    gfx.fillStyle(0x08101a, 0.8);
    const pts = [
      { x: 600, y: 460 }, { x: 960, y: 320 },
      { x: 960, y: 380 }, { x: 600, y: 460 }
    ];
    gfx.fillPoints(pts, true);

    gfx.generateTexture('map_bg', 960, 460);
    gfx.destroy();
  }

  _genD20Texture() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 60, cy = 60, r = 52;

    // Draw a 20-sided polygon approximation
    gfx.fillStyle(0x1a1206);
    gfx.fillCircle(cx, cy, r);
    gfx.lineStyle(2, 0xc8962a, 1);
    gfx.strokeCircle(cx, cy, r);

    // Inner lines to suggest icosahedron faces
    gfx.lineStyle(1, 0xc8962a, 0.4);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      gfx.beginPath();
      gfx.moveTo(cx, cy);
      gfx.lineTo(cx + Math.cos(angle) * r * 0.8, cy + Math.sin(angle) * r * 0.8);
      gfx.strokePath();
    }

    gfx.generateTexture('d20', 120, 120);
    gfx.destroy();
  }
}
