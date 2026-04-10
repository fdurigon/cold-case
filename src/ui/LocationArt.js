// LocationArt.js
// Draws atmospheric procedural backgrounds for each location using Phaser Graphics.
// All coordinates are local (0,0 = top-left of the art area).
// Because Graphics render at native canvas resolution, they scale cleanly on HiDPI.

export function drawLocationArt(scene, locationId, x, y, w, h) {
  const g = scene.add.graphics().setPosition(x, y);

  switch (locationId) {
    case 'loc_001': _alley(g, w, h);      break;
    case 'loc_002': _tavern(g, w, h);     break;
    case 'loc_003': _docks(g, w, h);      break;
    case 'loc_004': _office(g, w, h);     break;
    case 'loc_005': _apothecary(g, w, h); break;
    default:        _alley(g, w, h);      break;
  }

  return g;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Simulates a vertical gradient by drawing thin horizontal slices
function _gradient(g, x, y, w, h, colorTop, colorBot, steps = 24) {
  for (let i = 0; i < steps; i++) {
    const t   = i / (steps - 1);
    const r   = _lerp((colorTop >> 16) & 0xff, (colorBot >> 16) & 0xff, t);
    const gr  = _lerp((colorTop >>  8) & 0xff, (colorBot >>  8) & 0xff, t);
    const b   = _lerp((colorTop      ) & 0xff, (colorBot      ) & 0xff, t);
    const col = (Math.round(r) << 16) | (Math.round(gr) << 8) | Math.round(b);
    const sy  = y + (h / steps) * i;
    const sh  = Math.ceil(h / steps) + 1;
    g.fillStyle(col, 1);
    g.fillRect(x, sy, w, sh);
  }
}

function _lerp(a, b, t) { return a + (b - a) * t; }

// Fog veil: transparent rect darkening toward bottom
function _fogBottom(g, w, h, color = 0x080608, maxAlpha = 0.55, steps = 20) {
  const fogH = h * 0.35;
  const startY = h - fogH;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    g.fillStyle(color, t * maxAlpha);
    g.fillRect(0, startY + fogH * t, w, fogH / steps + 1);
  }
}

// Vignette: dark edges
function _vignette(g, w, h, alpha = 0.45) {
  g.fillStyle(0x000000, alpha);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * alpha;
    g.fillStyle(0x000000, a * 0.2);
    g.fillRect(0, 0, w, i * 2);
    g.fillRect(0, h - i * 2, w, i * 2);
    g.fillRect(0, 0, i * 2, h);
    g.fillRect(w - i * 2, 0, i * 2, h);
  }
}

// ── loc_001 · Beco do Açougueiro (Victorian alley, night) ─────────────────────

function _alley(g, w, h) {
  // Sky — dark purple-black
  _gradient(g, 0, 0, w, h * 0.5, 0x0a0610, 0x060408);

  // Distant fog layer mid-sky
  g.fillStyle(0x120d18, 0.18);
  g.fillRect(0, h * 0.15, w, h * 0.2);

  // Right brick wall
  g.fillStyle(0x0e0a07);
  g.fillRect(w * 0.72, 0, w * 0.28, h);
  // Brick texture suggestion (horizontal mortar lines)
  g.fillStyle(0x090706, 0.8);
  for (let by = 0; by < h; by += 14) {
    g.fillRect(w * 0.72, by, w * 0.28, 1);
  }
  // Vertical mortar (staggered)
  for (let brow = 0; brow < h / 14; brow++) {
    const offset = brow % 2 === 0 ? 28 : 14;
    for (let bx = w * 0.72 + offset; bx < w; bx += 56) {
      g.fillRect(bx, brow * 14, 1, 14);
    }
  }

  // Left brick wall (narrower — alley perspective)
  g.fillStyle(0x0c0907);
  g.fillRect(0, 0, w * 0.18, h);
  g.fillStyle(0x090706, 0.8);
  for (let by = 0; by < h; by += 14) {
    g.fillRect(0, by, w * 0.18, 1);
  }

  // Ground — cobblestones
  _gradient(g, 0, h * 0.65, w, h * 0.35, 0x0c0a08, 0x080706);
  // Cobble grid
  g.fillStyle(0x070605, 0.7);
  for (let gx = 0; gx < w; gx += 22) {
    g.fillRect(gx, h * 0.65, 1, h * 0.35);
  }
  for (let gy = h * 0.65; gy < h; gy += 12) {
    g.fillRect(0, gy, w, 1);
  }

  // Gas lamp post (left wall)
  const lampX = w * 0.22, lampY = h * 0.2;
  g.fillStyle(0x1a1410);
  g.fillRect(lampX - 2, lampY, 4, h * 0.45); // post
  g.fillRect(lampX - 8, lampY - 4, 16, 4);   // arm

  // Lamp glow — layered circles fading out
  for (let r = 90; r >= 4; r -= 10) {
    const a = 0.015 + (90 - r) * 0.0012;
    g.fillStyle(0xc8962a, a);
    g.fillCircle(lampX, lampY, r);
  }
  // Lamp body
  g.fillStyle(0xc8962a, 0.9);
  g.fillRect(lampX - 5, lampY - 12, 10, 14);
  g.fillStyle(0xfff0c0, 0.7);
  g.fillRect(lampX - 3, lampY - 10, 6, 10);

  // Damp wall stains (left wall, right of lamp)
  g.fillStyle(0x0a0807, 0.5);
  g.fillRect(w * 0.18, h * 0.3, w * 0.05, h * 0.25);

  // Blood pool on ground
  g.fillStyle(0x3a0a0a, 0.85);
  g.fillEllipse(w * 0.48, h * 0.71, 80, 22);
  g.fillStyle(0x2a0808, 0.5);
  g.fillEllipse(w * 0.5, h * 0.73, 40, 10);

  // Dripping water from wall crack
  g.fillStyle(0x0d0c10, 0.6);
  g.fillRect(w * 0.75, h * 0.1, 2, h * 0.18);
  g.fillCircle(w * 0.75, h * 0.28, 3);

  _fogBottom(g, w, h, 0x080608, 0.5);
  _vignette(g, w, h, 0.5);
}

// ── loc_002 · A Taverna do Javali (dim tavern interior) ───────────────────────

function _tavern(g, w, h) {
  // Dark wood wall background
  _gradient(g, 0, 0, w, h, 0x0e0b07, 0x0a0806);
  // Wood grain vertical lines
  g.fillStyle(0x0b0906, 0.5);
  for (let wx = 0; wx < w; wx += 18) {
    g.fillRect(wx, 0, 1, h);
  }

  // Back shelf unit (full width, upper half)
  g.fillStyle(0x131008);
  g.fillRect(w * 0.04, h * 0.05, w * 0.62, h * 0.55);
  // Shelf planks (5 shelves)
  for (let s = 0; s < 5; s++) {
    const sy = h * 0.05 + s * (h * 0.1);
    g.fillStyle(0x1a1509);
    g.fillRect(w * 0.04, sy, w * 0.62, 4);
    // Bottles on each shelf
    for (let b = 0; b < 9; b++) {
      const bx   = w * 0.06 + b * (w * 0.067);
      const bh   = h * (0.06 + (b % 3) * 0.015);
      const dark = 0x0e0c09 + (b * 0x010100 & 0x0f0f00);
      g.fillStyle(dark);
      g.fillRect(bx, sy + 4 - bh, w * 0.048, bh);
      // Bottle neck
      g.fillRect(bx + w * 0.013, sy + 4 - bh - 6, w * 0.02, 6);
    }
  }

  // Shelf side panels
  g.fillStyle(0x1a1509);
  g.fillRect(w * 0.04, h * 0.05, 4, h * 0.55);
  g.fillRect(w * 0.66 - 4, h * 0.05, 4, h * 0.55);

  // Bar counter
  const barY = h * 0.6;
  g.fillStyle(0x1c160a);
  g.fillRect(w * 0.04, barY, w * 0.56, h * 0.12);
  // Counter top highlight
  g.fillStyle(0x241e0e, 0.8);
  g.fillRect(w * 0.04, barY, w * 0.56, 3);
  // Counter front panel (darker)
  g.fillStyle(0x130f07);
  g.fillRect(w * 0.04, barY + h * 0.12, w * 0.56, h * 0.08);

  // Oil lamp on counter — warm glow
  const lampX = w * 0.55, lampY2 = barY - 4;
  for (let r = 120; r >= 4; r -= 12) {
    g.fillStyle(0xc87820, 0.015 + (120 - r) * 0.0008);
    g.fillCircle(lampX, lampY2, r);
  }
  g.fillStyle(0xb06818, 0.9);
  g.fillRect(lampX - 5, lampY2 - 10, 10, 12);
  g.fillStyle(0xffd890, 0.7);
  g.fillRect(lampX - 3, lampY2 - 8, 6, 8);

  // Corkboard (right side) with notice
  g.fillStyle(0x1a1408);
  g.fillRect(w * 0.74, h * 0.06, w * 0.22, h * 0.42);
  g.fillStyle(0x221b0c, 0.6);
  g.fillRect(w * 0.76, h * 0.09, w * 0.18, h * 0.14); // pinned paper
  g.fillRect(w * 0.76, h * 0.26, w * 0.18, h * 0.18); // pinned paper

  // Stacked chairs on table (right side)
  g.fillStyle(0x120f09);
  g.fillRect(w * 0.73, barY - h * 0.12, w * 0.22, h * 0.1);  // table
  g.fillRect(w * 0.76, barY - h * 0.26, w * 0.08, h * 0.14); // chair 1
  g.fillRect(w * 0.86, barY - h * 0.26, w * 0.08, h * 0.14); // chair 2

  // Floor
  _gradient(g, 0, h * 0.72, w, h * 0.28, 0x0e0c09, 0x080706);

  // Scattered playing card on floor
  g.fillStyle(0x1a1810, 0.6);
  g.fillRect(w * 0.3, h * 0.8, 16, 22);

  _fogBottom(g, w, h, 0x0a0806, 0.4);
  _vignette(g, w, h, 0.55);
}

// ── loc_003 · O Cais Escarlate (dark docks at night) ─────────────────────────

function _docks(g, w, h) {
  // Sky — deep blue-black
  _gradient(g, 0, 0, w, h * 0.48, 0x05080f, 0x060a14);

  // Stars (tiny dots)
  g.fillStyle(0xe8e4d0, 0.35);
  const starSeeds = [0.08,0.15,0.22,0.31,0.43,0.54,0.63,0.72,0.85,0.91,0.12,0.37,0.58,0.78,0.95];
  const starYSeeds = [0.04,0.09,0.06,0.12,0.05,0.10,0.03,0.08,0.06,0.11,0.14,0.07,0.13,0.04,0.09];
  starSeeds.forEach((sx, i) => {
    g.fillRect(sx * w, starYSeeds[i] * h * 0.9, 1, 1);
  });

  // Distant city silhouette
  g.fillStyle(0x080c1a);
  const buildW = w / 10;
  const bldH   = [0.09,0.14,0.08,0.18,0.11,0.15,0.07,0.13,0.16,0.10];
  for (let i = 0; i < 10; i++) {
    const bh = bldH[i] * h;
    g.fillRect(i * buildW, h * 0.48 - bh, buildW + 1, bh);
  }
  // Faint windows in buildings
  g.fillStyle(0xc8962a, 0.18);
  [[0.05,0.29],[0.16,0.33],[0.35,0.27],[0.55,0.31],[0.68,0.26],[0.82,0.34],[0.92,0.3]]
    .forEach(([sx, sy]) => g.fillRect(sx * w, sy * h, 3, 4));

  // Water — dark with subtle ripple lines
  _gradient(g, 0, h * 0.52, w, h * 0.48, 0x050a12, 0x030608);
  g.fillStyle(0x0a1220, 0.4);
  for (let ry = h * 0.54; ry < h; ry += 10) {
    const ww = w * (0.4 + Math.sin(ry * 0.1) * 0.4);
    const wx = (w - ww) / 2;
    g.fillRect(wx, ry, ww, 1);
  }

  // Dock horizon line
  _gradient(g, 0, h * 0.48, w, h * 0.06, 0x0e1018, 0x050a12);

  // Dock platform
  g.fillStyle(0x0f0d0a);
  g.fillRect(0, h * 0.5, w, h * 0.07);
  // Plank lines
  g.fillStyle(0x0b0a08, 0.7);
  for (let px = 0; px < w; px += 18) {
    g.fillRect(px, h * 0.5, 1, h * 0.07);
  }
  // Front plank edge
  g.fillStyle(0x1a1812, 0.5);
  g.fillRect(0, h * 0.57, w, 2);

  // Dock posts (4)
  g.fillStyle(0x0d0b08);
  [0.12, 0.33, 0.58, 0.79].forEach(px => {
    g.fillRect(px * w - 5, h * 0.52, 10, h * 0.48); // post below water line
    g.fillRect(px * w - 4, h * 0.38, 8, h * 0.14);  // post above dock
    // Post top cap
    g.fillStyle(0x181612);
    g.fillRect(px * w - 6, h * 0.38, 12, 4);
    g.fillStyle(0x0d0b08);
  });

  // Chains between posts
  g.fillStyle(0x1c1a16, 0.5);
  g.fillRect(w * 0.12, h * 0.46, w * 0.21, 2);
  g.fillRect(w * 0.33, h * 0.44, w * 0.25, 2);
  g.fillRect(w * 0.58, h * 0.46, w * 0.21, 2);

  // Abandoned boat (right side, partly on water)
  g.fillStyle(0x0c0a08);
  g.fillTriangle(
    w * 0.6,  h * 0.52,
    w * 0.9,  h * 0.52,
    w * 0.88, h * 0.4
  );
  g.fillRect(w * 0.6, h * 0.52, w * 0.3, h * 0.03); // hull bottom
  // Mast
  g.fillStyle(0x1a1612);
  g.fillRect(w * 0.74, h * 0.28, 3, h * 0.12);

  // Light reflection on water (from city)
  g.fillStyle(0xc8962a, 0.04);
  g.fillEllipse(w * 0.22, h * 0.7, 60, 200);

  _fogBottom(g, w, h, 0x05080d, 0.35);
  _vignette(g, w, h, 0.6);
}

// ── loc_004 · Consultório do Dr. Blackwell (medical office) ───────────────────

function _office(g, w, h) {
  // Walls — dark olive
  _gradient(g, 0, 0, w, h, 0x0e0e0b, 0x0a0a08);

  // Floor
  _gradient(g, 0, h * 0.76, w, h * 0.24, 0x0f0e0a, 0x090807);
  // Floor boards
  g.fillStyle(0x0c0b08, 0.6);
  for (let fx = 0; fx < w; fx += 24) {
    g.fillRect(fx, h * 0.76, 1, h * 0.24);
  }

  // Bookshelf — right side, floor to near ceiling
  g.fillStyle(0x131108);
  g.fillRect(w * 0.58, h * 0.02, w * 0.4, h * 0.72);
  // Shelf panels (6 shelves)
  for (let s = 0; s < 6; s++) {
    const sy = h * 0.02 + s * (h * 0.11);
    g.fillStyle(0x1c1a10, 0.9);
    g.fillRect(w * 0.58, sy, w * 0.4, 3);
    // Books — varying sizes and shades
    for (let b = 0; b < 7; b++) {
      const bx  = w * 0.60 + b * (w * 0.053);
      const bh  = h * (0.07 + (b * s % 4) * 0.01);
      const bw  = w * (0.04 + (b % 2) * 0.01);
      const col = 0x0e0c09 + (((b * 3 + s * 2) % 8) * 0x010200);
      g.fillStyle(col);
      g.fillRect(bx, sy + 3 - bh + h * 0.11, bw, bh);
      // Spine line
      g.fillStyle(0x080706, 0.5);
      g.fillRect(bx + bw - 1, sy + 3 - bh + h * 0.11, 1, bh);
    }
  }
  // Shelf side rails
  g.fillStyle(0x1c1a10);
  g.fillRect(w * 0.58, h * 0.02, 3, h * 0.72);
  g.fillRect(w * 0.98 - 3, h * 0.02, 3, h * 0.72);

  // Examination table (center-left)
  g.fillStyle(0x181612);
  g.fillRect(w * 0.06, h * 0.42, w * 0.42, h * 0.1);
  // Table legs
  g.fillStyle(0x14120e);
  [[0.09, 0.52],[0.44, 0.52]].forEach(([lx, ly]) => {
    g.fillRect(lx * w, ly * h, 6, h * 0.24);
  });
  // White sheet on table
  g.fillStyle(0x18170f, 0.8);
  g.fillRect(w * 0.07, h * 0.4, w * 0.4, h * 0.03);

  // Desk (front-left)
  g.fillStyle(0x1a1610);
  g.fillRect(w * 0.04, h * 0.62, w * 0.44, h * 0.07);
  g.fillStyle(0x141209);
  g.fillRect(w * 0.06, h * 0.69, 6, h * 0.16);
  g.fillRect(w * 0.44, h * 0.69, 6, h * 0.16);
  // Desk items
  g.fillStyle(0x12100a, 0.9); // papers
  g.fillRect(w * 0.1, h * 0.59, w * 0.12, h * 0.03);
  g.fillRect(w * 0.24, h * 0.6, w * 0.08, h * 0.025);

  // Instrument tray
  g.fillStyle(0x201e14);
  g.fillRect(w * 0.06, h * 0.57, w * 0.28, h * 0.03);
  // Scalpel silhouettes
  g.fillStyle(0x2e2c20);
  [0.09, 0.14, 0.19, 0.24].forEach(sx => {
    g.fillRect(sx * w, h * 0.55, 2, h * 0.05);
  });

  // Wall-mounted lamp — amber glow
  const lx = w * 0.52, ly = h * 0.18;
  for (let r = 140; r >= 4; r -= 14) {
    g.fillStyle(0xc8962a, 0.012 + (140 - r) * 0.0006);
    g.fillCircle(lx, ly, r);
  }
  g.fillStyle(0xb08020, 0.9);
  g.fillRect(lx - 6, ly - 10, 12, 14);

  // Formaldehyde jars on shelf bottom right
  g.fillStyle(0x0a1210);
  [0.64, 0.71, 0.78].forEach(jx => {
    g.fillRect(jx * w, h * 0.72, w * 0.055, h * 0.055);
    g.fillStyle(0x0d1814, 0.7);
    g.fillRect(jx * w + 2, h * 0.72 + 2, w * 0.035, h * 0.035);
    g.fillStyle(0x0a1210);
  });

  _fogBottom(g, w, h, 0x090908, 0.3);
  _vignette(g, w, h, 0.5);
}

// ── loc_005 · A Botica Hargrove (abandoned apothecary) ────────────────────────

function _apothecary(g, w, h) {
  // Walls — dusty dark green-grey
  _gradient(g, 0, 0, w, h, 0x0b0d0b, 0x080a08);
  // Dust/cobweb tint
  g.fillStyle(0x101410, 0.15);
  g.fillRect(0, 0, w, h);

  // Floorboards
  _gradient(g, 0, h * 0.78, w, h * 0.22, 0x0e0c09, 0x090807);
  g.fillStyle(0x0b0a07, 0.6);
  for (let fx = 0; fx < w; fx += 20) {
    g.fillRect(fx, h * 0.78, 1, h * 0.22);
  }

  // Back wall shelves — floor to ceiling, edge to edge
  g.fillStyle(0x0e0f0c);
  g.fillRect(w * 0.02, h * 0.03, w * 0.68, h * 0.72);

  // 6 shelves
  for (let s = 0; s < 6; s++) {
    const sy = h * 0.03 + s * (h * 0.112);
    g.fillStyle(0x181a14, 0.9);
    g.fillRect(w * 0.02, sy, w * 0.68, 3);
    // Bottles — tightly packed
    for (let b = 0; b < 11; b++) {
      const bx  = w * 0.04 + b * (w * 0.059);
      const bh  = h * (0.055 + (b % 4) * 0.012);
      // Bottle shape variation
      const bw  = w * (0.038 + (b % 2) * 0.01);
      const col = 0x0c1009 + (((b + s * 4) % 12) * 0x000100);
      g.fillStyle(col);
      g.fillRect(bx, sy + 3 - bh + h * 0.108, bw, bh);
      // Bottle neck
      g.fillRect(bx + bw * 0.3, sy + 3 - bh + h * 0.108 - 5, bw * 0.4, 5);
      // Label (faded rectangle)
      g.fillStyle(0x181c14, 0.5);
      g.fillRect(bx + 1, sy + 3 - bh * 0.5 + h * 0.108, bw - 2, bh * 0.3);
      g.fillStyle(col);
    }
  }
  // Shelf side rails
  g.fillStyle(0x181a14);
  g.fillRect(w * 0.02, h * 0.03, 3, h * 0.72);
  g.fillRect(w * 0.70 - 3, h * 0.03, 3, h * 0.72);

  // Counter (left-center)
  g.fillStyle(0x18160f);
  g.fillRect(w * 0.04, h * 0.68, w * 0.5, h * 0.07);
  g.fillStyle(0x221e14, 0.7);
  g.fillRect(w * 0.04, h * 0.68, w * 0.5, 2);

  // Counter items: scales, receipt book
  g.fillStyle(0x1a1810, 0.9);
  g.fillRect(w * 0.12, h * 0.64, w * 0.12, h * 0.04); // receipt book
  g.fillRect(w * 0.32, h * 0.63, w * 0.08, h * 0.05); // second book
  // Brass scale silhouette
  g.fillStyle(0x20180a);
  g.fillRect(w * 0.42, h * 0.61, 3, h * 0.07);         // scale post
  g.fillRect(w * 0.41, h * 0.61, w * 0.026, 2);         // beam
  g.fillRect(w * 0.41, h * 0.63, 10, 3);                // left pan
  g.fillRect(w * 0.432, h * 0.64, 10, 3);               // right pan (lower)

  // Right side: tall cabinet
  g.fillStyle(0x12110d);
  g.fillRect(w * 0.74, h * 0.04, w * 0.22, h * 0.72);
  g.fillStyle(0x1a1812, 0.7);
  g.fillRect(w * 0.74, h * 0.04, 2, h * 0.72);
  g.fillRect(w * 0.96 - 2, h * 0.04, 2, h * 0.72);
  g.fillRect(w * 0.74, h * 0.38, w * 0.22, 2);
  // Cabinet door handles
  g.fillStyle(0x2a2418);
  g.fillRect(w * 0.845, h * 0.22, 4, 10);
  g.fillRect(w * 0.845, h * 0.54, 4, 10);

  // Dusty cobweb top corner
  g.fillStyle(0x181c14, 0.3);
  for (let ci = 0; ci < 6; ci++) {
    g.fillRect(0, ci * 4, ci * 10, 1);
  }

  // Dim window (right wall, barely visible light from outside)
  g.fillStyle(0x0f1810, 0.5);
  g.fillRect(w * 0.75, h * 0.08, w * 0.18, h * 0.24);
  // Window frame
  g.fillStyle(0x1a1c14, 0.9);
  g.fillRect(w * 0.75, h * 0.08, w * 0.18, 2);
  g.fillRect(w * 0.75, h * 0.32, w * 0.18, 2);
  g.fillRect(w * 0.75, h * 0.08, 2, h * 0.24);
  g.fillRect(w * 0.93 - 2, h * 0.08, 2, h * 0.24);
  g.fillRect(w * 0.84, h * 0.08, 2, h * 0.24); // cross bar

  _fogBottom(g, w, h, 0x080908, 0.35);
  _vignette(g, w, h, 0.6);
}
