import caseManager from '../systems/CaseManager.js';
import HUD from '../ui/HUD.js';
import createText from '../ui/DOMText.js';

const NODE_RADIUS   = 10;
const NODE_COLOR    = 0x2a2510;
const NODE_VISITED  = 0x3a3218;
const NODE_EVIDENCE = 0xc8962a;
const NODE_BORDER   = 0x888866;

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    const W = 960, H = 540;
    const def   = caseManager.definition;
    const state = caseManager.state;

    // Map background (generated in BootScene)
    this.add.image(0, 34, 'map_bg').setOrigin(0, 0);

    // Title bar
    createText(this, W / 2, 34 + 20, def.codename.toUpperCase(), {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#555544', letterSpacing: 3
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, 34 + 34, 600, 1, 0x1e1a10).setOrigin(0.5, 0);

    // Instruction
    createText(this, W / 2, H - 58, 'Selecione um local para investigar', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#333322'
    }).setOrigin(0.5, 0.5);

    // Draw location nodes
    const MAP_TOP    = 34 + 44;
    const MAP_HEIGHT = H - MAP_TOP - 50;

    def.locations.forEach(loc => {
      const px = loc.map_x / 100 * W;
      const py = MAP_TOP + (loc.map_y / 100 * MAP_HEIGHT);

      const visited  = caseManager.hasVisited(loc.id);
      const hasClue  = state.found_evidence.some(evId => {
        const obj = def.locations
          .flatMap(l => l.searchable_objects)
          .find(o => o.evidence_id === evId);
        return obj && def.locations.find(l => l.id === loc.id)
          .searchable_objects.some(o => o.evidence_id === evId);
      });

      const fillColor = hasClue ? NODE_EVIDENCE : (visited ? NODE_VISITED : NODE_COLOR);

      // Outer glow for unvisited
      if (!visited) {
        const glow = this.add.circle(px, py, NODE_RADIUS + 5, 0xc8962a, 0.08);
        this.tweens.add({
          targets: glow, alpha: { from: 0.08, to: 0 },
          duration: 1800, yoyo: true, repeat: -1
        });
      }

      const node = this.add.circle(px, py, NODE_RADIUS, fillColor)
        .setInteractive({ useHandCursor: true });

      this.add.circle(px, py, NODE_RADIUS).setFillStyle(0, 0)
        .setStrokeStyle(1, NODE_BORDER);

      // Check icon if evidence found here
      if (hasClue) {
        createText(this, px + NODE_RADIUS + 2, py - 6, '✦', {
          fontSize: '9px', color: '#c8962a'
        }).setOrigin(0, 0.5);
      }

      // Location label
      createText(this, px, py + NODE_RADIUS + 9, loc.name, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif',
        color: visited ? '#888866' : '#555544'
      }).setOrigin(0.5, 0);

      node.on('pointerover', () => {
        node.setFillStyle(0x4a4220);
        this._showLocationTooltip(px, py, loc, visited);
      });
      node.on('pointerout', () => {
        node.setFillStyle(fillColor);
        this._hideTooltip();
      });
      node.on('pointerdown', () => this._goToLocation(loc));
    });

    // HUD with Suspects button
    new HUD(this, {
      showToolBelt: false,
      showBack: false,
      showEvidenceBoard: true,
      onEvidenceBoard: () => {
        this.scene.sleep();
        this.scene.launch('EvidenceBoardScene', { returnScene: 'MapScene' });
      },
      onSuspects: () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('SuspectsScene', { returnScene: 'MapScene' });
        });
      }
    });

    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  _showLocationTooltip(x, y, loc, visited) {
    this._hideTooltip();

    const label = visited ? loc.name : `${loc.name}  (não visitado)`;
    this._tooltip = createText(this, x, y - NODE_RADIUS - 14, label, {
      fontSize: '11px', fontFamily: 'Arial, sans-serif',
      color: '#e8d5a3',
      backgroundColor: '#0d0d0d',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5, 1).setDepth(50);
  }

  _hideTooltip() {
    if (this._tooltip) { this._tooltip.destroy(); this._tooltip = null; }
  }

  _goToLocation(loc) {
    this._hideTooltip();
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LocationScene', { locationId: loc.id });
    });
  }
}
