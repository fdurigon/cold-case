// Typewriter-effect text renderer for atmospheric descriptions and dialog lines.

export default class DialogBox {
  constructor(scene, x, y, width, height, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    const pad = options.padding ?? 12;
    this._opts = {
      fontSize:        options.fontSize        ?? '13px',
      fontFamily:      options.fontFamily      ?? 'Georgia, serif',
      color:           options.color           ?? '#e8d5a3',
      bgColor:         options.bgColor         ?? 0x0d0d0d,
      bgAlpha:         options.bgAlpha         ?? 0.0,
      typewriterSpeed: options.typewriterSpeed ?? 40,  // chars/sec
      padding: pad
    };

    this._timer      = null;
    this._fullText   = '';
    this._idx        = 0;
    this._onComplete = null;
    this._bg         = null;
    this._textObj    = null;

    this._build();
  }

  _build() {
    const { bgColor, bgAlpha, padding, fontSize, fontFamily, color } = this._opts;

    if (bgAlpha > 0) {
      this._bg = this.scene.add.rectangle(
        this.x, this.y, this.width, this.height, bgColor, bgAlpha
      ).setOrigin(0, 0);
    }

    this._textObj = this.scene.add.text(
      this.x + padding,
      this.y + padding,
      '',
      {
        fontSize,
        fontFamily,
        color,
        wordWrap: { width: this.width - padding * 2 },
        lineSpacing: 5
      }
    ).setOrigin(0, 0);
  }

  setText(text, instant = false, onComplete = null) {
    this._onComplete = onComplete;
    this._fullText   = text;
    this._idx        = 0;
    this._textObj.setText('');

    if (this._timer) { this._timer.destroy(); this._timer = null; }

    if (instant || this._opts.typewriterSpeed <= 0) {
      this._textObj.setText(text);
      if (onComplete) onComplete();
      return;
    }

    const delay = 1000 / this._opts.typewriterSpeed;
    this._timer = this.scene.time.addEvent({
      delay,
      repeat: text.length - 1,
      callback: () => {
        this._idx++;
        this._textObj.setText(text.substring(0, this._idx));
        if (this._idx >= text.length && this._onComplete) {
          this._onComplete();
        }
      }
    });
  }

  skipToEnd() {
    if (this._timer) { this._timer.destroy(); this._timer = null; }
    this._idx = this._fullText.length;
    this._textObj.setText(this._fullText);
    if (this._onComplete) { this._onComplete(); this._onComplete = null; }
  }

  isTyping() {
    return this._idx < this._fullText.length;
  }

  clear() {
    if (this._timer) { this._timer.destroy(); this._timer = null; }
    this._fullText = '';
    this._idx = 0;
    this._textObj.setText('');
  }

  setVisible(v) {
    if (this._bg) this._bg.setVisible(v);
    this._textObj.setVisible(v);
  }

  setDepth(d) {
    if (this._bg) this._bg.setDepth(d);
    this._textObj.setDepth(d + 1);
    return this;
  }

  destroy() {
    if (this._timer) this._timer.destroy();
    if (this._bg)   this._bg.destroy();
    this._textObj.destroy();
  }

  get textObject() { return this._textObj; }
}
