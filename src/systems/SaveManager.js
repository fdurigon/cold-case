const STORAGE_KEY = 'cold_case_save';

const DEFAULT_SAVE = {
  version: 1,
  reputation: 50,
  reputation_history: [],
  completed_cases: {},
  active_case: null
};

class SaveManager {
  constructor() {
    this._data = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? JSON.parse(raw) : { ...DEFAULT_SAVE };
    } catch (e) {
      this._data = { ...DEFAULT_SAVE };
    }
    return this._data;
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
  }

  get data() {
    if (!this._data) this.load();
    return this._data;
  }

  getReputation() {
    return this.data.reputation;
  }

  setReputation(value) {
    this.data.reputation = Math.max(0, value);
    this._save();
  }

  getActiveCase() {
    return this.data.active_case;
  }

  setActiveCase(state) {
    this.data.active_case = state;
    this._save();
  }

  clearActiveCase() {
    this.data.active_case = null;
    this._save();
  }

  getCompletedCase(caseId) {
    return this.data.completed_cases[caseId] || null;
  }

  markCaseComplete(caseId, summary) {
    this.data.completed_cases[caseId] = summary;
    this.data.active_case = null;
    this._save();
  }

  addReputationHistory(caseId, delta) {
    this.data.reputation_history.push({
      case_id: caseId,
      delta,
      timestamp: Date.now()
    });
    this._save();
  }

  reset() {
    this._data = { ...DEFAULT_SAVE };
    this._save();
  }
}

export default new SaveManager();
