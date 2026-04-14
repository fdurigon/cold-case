/**
 * Creates a DOM-based text element that renders using the browser's native
 * text engine — always crisp regardless of canvas scaling.
 *
 * Returns a Phaser DOMElement with .setText() and .setColor() convenience
 * methods so it can be used as a drop-in replacement for Phaser.Text.
 */

// Track which scenes have already had pause/resume DOM-visibility handlers attached
const _pauseSetup = new WeakSet();

function _setupSleepHandlers(scene) {
  if (_pauseSetup.has(scene)) return;
  _pauseSetup.add(scene);

  const hideDOMNodes = () => scene.children.list
    .filter(c => c.type === 'DOMElement' && c.node)
    .forEach(c => { c.node.style.visibility = 'hidden'; });

  const showDOMNodes = () => scene.children.list
    .filter(c => c.type === 'DOMElement' && c.node)
    .forEach(c => { c.node.style.visibility = 'visible'; });

  // sleep() stops both update AND render — DOM nodes live in the HTML overlay
  // above the canvas so they must be hidden/shown manually.
  scene.events.on('sleep',  hideDOMNodes);
  scene.events.on('wake',   showDOMNodes);
  // Fallback for any remaining pause() usage.
  scene.events.on('pause',  hideDOMNodes);
  scene.events.on('resume', showDOMNodes);
}

export default function createText(scene, x, y, text, style = {}) {
  _setupSleepHandlers(scene);

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
  // Prevent the browser's default I-beam text cursor from showing through
  // the DOM overlay — even with pointer-events:none some browsers still render
  // the element's own cursor style.
  el.style.cursor        = 'default';

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

  // Override setInteractive: enable native DOM pointer events so the element
  // can be clicked directly (Phaser's canvas-based hit testing doesn't work
  // reliably for DOMElements whose size may be 0 at creation time).
  const _origSetInteractive = dom.setInteractive.bind(dom);
  dom.setInteractive = function (config) {
    const result = _origSetInteractive(config);
    if (config && config.useHandCursor) {
      el.style.cursor = 'pointer';
    }
    // Allow this element to capture mouse/touch events directly instead of
    // relying on Phaser's canvas-based hit testing.
    el.style.pointerEvents = 'auto';
    return result;
  };

  // Map Phaser-style pointer event names to native DOM events when the element
  // has pointer events enabled (i.e. after setInteractive is called).
  const _origOn = dom.on.bind(dom);
  dom.on = function (event, handler, context, ...rest) {
    if (el.style.pointerEvents !== 'none') {
      const domEvent =
        event === 'pointerdown' ? 'click'     :
        event === 'pointerover' ? 'mouseover' :
        event === 'pointerout'  ? 'mouseout'  : null;
      if (domEvent) {
        el.addEventListener(domEvent, handler);
        return this;
      }
    }
    return _origOn(event, handler, context, ...rest);
  };

  // Force initial size measurement so .width / .height are available
  dom.updateSize();

  return dom;
}
