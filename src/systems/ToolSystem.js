export const TOOLS = [
  { id: 'flashlight',      name: 'Lanterna' },
  { id: 'uv_light',        name: 'Luz Negra' },
  { id: 'fingerprint_kit', name: 'Kit de Digitais' },
  { id: 'magnifier',       name: 'Lupa' },
  { id: 'evidence_bag',    name: 'Saco de Evidências' },
  { id: 'camera',          name: 'Câmera' }
];

class ToolSystem {
  constructor() {
    this._equipped = null;
  }

  get tools() {
    return TOOLS;
  }

  get equipped() {
    return this._equipped;
  }

  equip(toolId) {
    this._equipped = this._equipped === toolId ? null : toolId;
    return this._equipped;
  }

  unequip() {
    this._equipped = null;
  }

  isEquipped(toolId) {
    return this._equipped === toolId;
  }

  // Returns: 'no_tool_required' | 'no_tool' | 'wrong_tool' | 'match'
  checkObject(obj) {
    if (obj.required_tool === null) return 'no_tool_required';
    if (!this._equipped) return 'no_tool';
    if (this._equipped !== obj.required_tool) return 'wrong_tool';
    return 'match';
  }
}

export default new ToolSystem();
