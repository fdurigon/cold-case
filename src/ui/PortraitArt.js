// PortraitArt.js
// Draws distinctive suspect portraits with Phaser Graphics.
// Coordinates are relative to the top-left corner of the portrait box (cx, cy = centre).

export function drawPortrait(scene, suspectId, cx, cy, w, h) {
  const g = scene.add.graphics();
  switch (suspectId) {
    case 'suspect_001': _harrow(g, cx, cy, w, h);    break;
    case 'suspect_002': _voss(g, cx, cy, w, h);      break;
    case 'suspect_003': _blackwell(g, cx, cy, w, h); break;
    default:            _unknown(g, cx, cy, w, h);   break;
  }
  return g;
}

// ── Edmund Harrow · broad butcher, heavy-set ──────────────────────────────────
function _harrow(g, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;

  // Background
  g.fillStyle(0x0e0b08);
  g.fillRect(x, y, w, h);
  // Warm lantern glow from below
  g.fillStyle(0xc87820, 0.07);
  g.fillCircle(cx, cy + h * 0.3, h * 0.5);

  // Body — wide, working clothes
  g.fillStyle(0x141008);
  g.fillRect(cx - w * 0.38, cy + h * 0.02, w * 0.76, h * 0.5);
  // Apron
  g.fillStyle(0x1c1510, 0.9);
  g.fillRect(cx - w * 0.24, cy + h * 0.06, w * 0.48, h * 0.44);
  // Apron stains (blood/meat)
  g.fillStyle(0x3a1010, 0.7);
  g.fillEllipse(cx - w * 0.06, cy + h * 0.18, w * 0.12, h * 0.06);
  g.fillEllipse(cx + w * 0.1,  cy + h * 0.28, w * 0.08, h * 0.04);
  g.fillStyle(0x2a0c0c, 0.5);
  g.fillEllipse(cx - w * 0.14, cy + h * 0.32, w * 0.06, h * 0.03);

  // Neck
  g.fillStyle(0x2a1e14);
  g.fillRect(cx - w * 0.12, cy - h * 0.1, w * 0.24, h * 0.14);

  // Head — round, slightly tilted
  g.fillStyle(0x2e2018);
  g.fillEllipse(cx, cy - h * 0.24, w * 0.52, h * 0.3);

  // Hair — dark, short
  g.fillStyle(0x1a1008);
  g.fillEllipse(cx, cy - h * 0.38, w * 0.5, h * 0.14);
  g.fillRect(cx - w * 0.26, cy - h * 0.38, w * 0.52, h * 0.08);

  // Eyes — deep-set, slightly bloodshot
  g.fillStyle(0x1a1010);
  g.fillEllipse(cx - w * 0.12, cy - h * 0.26, w * 0.14, h * 0.07);
  g.fillEllipse(cx + w * 0.12, cy - h * 0.26, w * 0.14, h * 0.07);
  g.fillStyle(0x5a3820, 0.6); // iris
  g.fillCircle(cx - w * 0.12, cy - h * 0.26, w * 0.04);
  g.fillCircle(cx + w * 0.12, cy - h * 0.26, w * 0.04);

  // Bushy mustache
  g.fillStyle(0x1a1008);
  g.fillEllipse(cx, cy - h * 0.16, w * 0.34, h * 0.07);
  // Mustache curve up at ends
  g.fillRect(cx - w * 0.17, cy - h * 0.18, w * 0.08, h * 0.04);
  g.fillRect(cx + w * 0.09,  cy - h * 0.18, w * 0.08, h * 0.04);

  // Ears
  g.fillStyle(0x2a1e14);
  g.fillEllipse(cx - w * 0.27, cy - h * 0.24, w * 0.1, h * 0.12);
  g.fillEllipse(cx + w * 0.27, cy - h * 0.24, w * 0.1, h * 0.12);

  // Thick arms visible at sides
  g.fillStyle(0x281a10);
  g.fillRect(cx - w * 0.48, cy + h * 0.04, w * 0.14, h * 0.38);
  g.fillRect(cx + w * 0.34, cy + h * 0.04, w * 0.14, h * 0.38);

  _portraitVignette(g, cx, cy, w, h);
}

// ── Margarida Voss · barmaid, guarded expression ──────────────────────────────
function _voss(g, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;

  // Background — slightly cool, dim
  g.fillStyle(0x0b0b10);
  g.fillRect(x, y, w, h);
  g.fillStyle(0x8090c0, 0.04);
  g.fillCircle(cx, cy - h * 0.1, h * 0.4);

  // Body — narrow, dark dress
  g.fillStyle(0x0e0c10);
  g.fillRect(cx - w * 0.28, cy + h * 0.04, w * 0.56, h * 0.5);
  // Dress collar / bib
  g.fillStyle(0x1a1820, 0.8);
  g.fillTriangle(
    cx, cy + h * 0.02,
    cx - w * 0.2, cy + h * 0.2,
    cx + w * 0.2, cy + h * 0.2
  );

  // Neck
  g.fillStyle(0x3a2a24);
  g.fillRect(cx - w * 0.1, cy - h * 0.08, w * 0.2, h * 0.14);

  // Head — oval
  g.fillStyle(0x3c2c26);
  g.fillEllipse(cx, cy - h * 0.22, w * 0.46, h * 0.28);

  // Hair — pulled back tight, dark
  g.fillStyle(0x100c0e);
  g.fillEllipse(cx, cy - h * 0.36, w * 0.44, h * 0.14);
  g.fillRect(cx - w * 0.22, cy - h * 0.38, w * 0.44, h * 0.12);
  // Hair bun at back
  g.fillEllipse(cx + w * 0.18, cy - h * 0.3, w * 0.14, h * 0.12);

  // Eyes — sharp, watchful
  g.fillStyle(0x100c12);
  g.fillEllipse(cx - w * 0.1,  cy - h * 0.24, w * 0.12, h * 0.055);
  g.fillEllipse(cx + w * 0.1,  cy - h * 0.24, w * 0.12, h * 0.055);
  g.fillStyle(0x403848, 0.8); // dark iris
  g.fillCircle(cx - w * 0.1,  cy - h * 0.24, w * 0.032);
  g.fillCircle(cx + w * 0.1,  cy - h * 0.24, w * 0.032);
  // Eyelid lines
  g.fillStyle(0x140e16, 0.7);
  g.fillRect(cx - w * 0.14, cy - h * 0.27, w * 0.1, 1);
  g.fillRect(cx + w * 0.04, cy - h * 0.27, w * 0.1, 1);

  // Nose — subtle
  g.fillStyle(0x2e2020, 0.5);
  g.fillRect(cx - 2, cy - h * 0.18, 4, h * 0.04);

  // Lips — thin, pressed
  g.fillStyle(0x4a2828);
  g.fillRect(cx - w * 0.1, cy - h * 0.13, w * 0.2, h * 0.025);

  // Ears
  g.fillStyle(0x3a2a24);
  g.fillEllipse(cx - w * 0.24, cy - h * 0.22, w * 0.09, h * 0.1);
  g.fillEllipse(cx + w * 0.24, cy - h * 0.22, w * 0.09, h * 0.1);

  // Arms at sides, hands on hips
  g.fillStyle(0x0e0c10);
  g.fillRect(cx - w * 0.38, cy + h * 0.08, w * 0.12, h * 0.35);
  g.fillRect(cx + w * 0.26, cy + h * 0.08, w * 0.12, h * 0.35);

  _portraitVignette(g, cx, cy, w, h);
}

// ── Dr. Cornelius Blackwell · tall, thin, top hat, unsettling composure ───────
function _blackwell(g, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;

  // Background — cold, dark teal-black
  g.fillStyle(0x080c0e);
  g.fillRect(x, y, w, h);
  g.fillStyle(0x10202a, 0.15);
  g.fillCircle(cx, cy, h * 0.55);

  // Long black coat — narrow, precise
  g.fillStyle(0x0c0c0e);
  g.fillRect(cx - w * 0.24, cy + h * 0.02, w * 0.48, h * 0.52);
  // Coat lapels
  g.fillStyle(0x181820, 0.8);
  g.fillTriangle(
    cx, cy + h * 0.04,
    cx - w * 0.24, cy + h * 0.02,
    cx - w * 0.1,  cy + h * 0.22
  );
  g.fillTriangle(
    cx, cy + h * 0.04,
    cx + w * 0.24, cy + h * 0.02,
    cx + w * 0.1,  cy + h * 0.22
  );
  // White shirt collar / cravat
  g.fillStyle(0x2a2a2e, 0.9);
  g.fillRect(cx - w * 0.07, cy - h * 0.04, w * 0.14, h * 0.1);
  g.fillStyle(0x1e1e22, 0.8);
  g.fillRect(cx - w * 0.04, cy, w * 0.08, h * 0.06); // cravat knot

  // Neck — thin
  g.fillStyle(0x28201c);
  g.fillRect(cx - w * 0.08, cy - h * 0.1, w * 0.16, h * 0.12);

  // Head — elongated, angular
  g.fillStyle(0x2a201c);
  g.fillEllipse(cx, cy - h * 0.26, w * 0.4, h * 0.28);

  // TOP HAT — defining feature
  g.fillStyle(0x0a0a0c);
  g.fillRect(cx - w * 0.22, cy - h * 0.52, w * 0.44, h * 0.28); // hat body
  g.fillRect(cx - w * 0.28, cy - h * 0.26, w * 0.56, h * 0.04); // brim
  g.fillStyle(0x141416, 0.7); // hat band
  g.fillRect(cx - w * 0.22, cy - h * 0.26, w * 0.44, h * 0.04);

  // Hair — dark, slicked back at temples
  g.fillStyle(0x0e0c0e);
  g.fillRect(cx - w * 0.2, cy - h * 0.38, w * 0.4, h * 0.12);

  // Eyes — pale, intense, direct gaze (most disturbing element)
  g.fillStyle(0x100e12);
  g.fillEllipse(cx - w * 0.1, cy - h * 0.28, w * 0.13, h * 0.06);
  g.fillEllipse(cx + w * 0.1, cy - h * 0.28, w * 0.13, h * 0.06);
  // Pale iris — cold grey
  g.fillStyle(0x5a6068, 0.9);
  g.fillCircle(cx - w * 0.1, cy - h * 0.28, w * 0.035);
  g.fillCircle(cx + w * 0.1, cy - h * 0.28, w * 0.035);
  // Tiny highlight in eye
  g.fillStyle(0xc8d0d4, 0.6);
  g.fillCircle(cx - w * 0.1 + 2, cy - h * 0.285, w * 0.008);
  g.fillCircle(cx + w * 0.1 + 2, cy - h * 0.285, w * 0.008);

  // Thin lips — slightly curved, almost a smile
  g.fillStyle(0x3a2828);
  g.fillRect(cx - w * 0.09, cy - h * 0.16, w * 0.18, h * 0.022);
  // Slight upturn at corners
  g.fillStyle(0x302020);
  g.fillRect(cx - w * 0.1,  cy - h * 0.165, w * 0.02, h * 0.015);
  g.fillRect(cx + w * 0.08, cy - h * 0.165, w * 0.02, h * 0.015);

  // Long thin hands (visible cuff edges)
  g.fillStyle(0x1e1c1e);
  g.fillRect(cx - w * 0.32, cy + h * 0.06, w * 0.1, h * 0.36);
  g.fillRect(cx + w * 0.22, cy + h * 0.06, w * 0.1, h * 0.36);
  // White cuffs
  g.fillStyle(0x2a2a2e, 0.7);
  g.fillRect(cx - w * 0.32, cy + h * 0.06, w * 0.1, h * 0.04);
  g.fillRect(cx + w * 0.22, cy + h * 0.06, w * 0.1, h * 0.04);

  _portraitVignette(g, cx, cy, w, h);
}

// ── Unknown / fallback ─────────────────────────────────────────────────────────
function _unknown(g, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;
  g.fillStyle(0x0e0e0e);
  g.fillRect(x, y, w, h);
  g.fillStyle(0x1a1a1a);
  g.fillEllipse(cx, cy - h * 0.1, w * 0.4, h * 0.44);
  g.fillRect(cx - w * 0.25, cy + h * 0.14, w * 0.5, h * 0.4);
  _portraitVignette(g, cx, cy, w, h);
}

// Dark vignette within the portrait box
function _portraitVignette(g, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2;
  for (let i = 0; i < 10; i++) {
    const a = i * 0.04;
    g.fillStyle(0x000000, a);
    g.fillRect(x, y + h - (i + 1) * (h / 12), w, h / 12);
  }
  // Side vignettes
  for (let i = 0; i < 6; i++) {
    g.fillStyle(0x000000, i * 0.05);
    g.fillRect(x + i * 2, y, 2, h);
    g.fillRect(x + w - (i + 1) * 2, y, 2, h);
  }
}
