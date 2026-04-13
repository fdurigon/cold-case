/**
 * Creates a DOM-based text element that renders using the browser's native
 * text engine — always crisp regardless of canvas scaling.
 *
 * Returns a Phaser DOMElement with .setText() and .setColor() convenience
 * methods so it can be used as a drop-in replacement for Phaser.Text.
 */
export default function createText(scene, x, y, text, style = {}) {
  const el = document.createElement('div');

  // Core font properties
  el.style.fontFamily    = style.fontFamily || 'Georgia, serif';
  el.style.fontSize      = style.fontSize   || '13px';
  el.style.color         = style.color      || '#e8d5a3';
  el.style.whiteSpace    = 'pre-wrap';

  // Optional typography
  if (style.letterSpacing != null) el.style.letterSpacing = `${style.letterSpacing}px`;
  if (style.fontStyle)             el.style.fontStyle     = style.fontStyle;
  if (style.align)                 el.style.textAlign     = style.align;

  // lineSpacing → CSS line-height  (fontSize + lineSpacing)
  if (style.lineSpacing) {
    const fs = parseInt(style.fontSize || '13', 10);
    el.style.lineHeight = `${fs + style.lineSpacing}px`;
  }

  // wordWrap → fixed width + overflow-wrap
  if (style.wordWrap && style.wordWrap.width) {
    el.style.width        = `${style.wordWrap.width}px`;
    el.style.overflowWrap = 'break-word';
  }

  // Background + padding (notification banners, tooltips)
  if (style.backgroundColor) el.style.backgroundColor = style.backgroundColor;
  if (style.padding) {
    el.style.padding = `${style.padding.y || 0}px ${style.padding.x || 0}px`;
  }

  // Don't block canvas pointer events; game text isn't user-selectable
  el.style.pointerEvents = 'none';
  el.style.userSelect    = 'none';

  el.textContent = text;

  // ── Phaser DOMElement wrapper ──
  const dom = scene.add.dom(x, y, el);

  // Convenience methods matching Phaser.Text API
  dom.setText = function (newText) {
    el.textContent = newText;
    this.updateSize();
    return this;
  };

  dom.setColor = function (color) {
    el.style.color = color;
    return this;
  };

  // Force initial size measurement so .width / .height are available
  dom.updateSize();

  return dom;
}
