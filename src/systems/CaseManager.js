import saveManager from './SaveManager.js';

class CaseManager {
  constructor() {
    this._caseDef = null;
    this._state = null;
  }

  // Called by BootScene after loading the JSON
  loadCaseDefinition(caseData) {
    this._caseDef = caseData;
  }

  get definition() {
    return this._caseDef;
  }

  // Start fresh or resume from a saved state
  startCase(caseId) {
    const saved = saveManager.getActiveCase();
    if (saved && saved.case_id === caseId) {
      this._state = saved;
    } else {
      this._state = {
        case_id: caseId,
        visited_locations: [],
        found_evidence: [],
        revealed_suspects: this._caseDef.suspects
          .filter(s => s.visible_from_start)
          .map(s => s.id),
        searched_objects: [],
        used_dialogs: [],
        current_visit_searches: {},
        accusations_made: 0,
        last_evidence_count_at_accusation: 0
      };
      saveManager.setActiveCase(this._state);
    }
  }

  get state() {
    return this._state;
  }

  _persist() {
    saveManager.setActiveCase(this._state);
  }

  // --- Location ---

  visitLocation(locationId) {
    if (!this._state.visited_locations.includes(locationId)) {
      this._state.visited_locations.push(locationId);
    }
    this._state.current_visit_searches[locationId] = 0;
    this._persist();
  }

  leaveLocation(locationId) {
    delete this._state.current_visit_searches[locationId];
    this._persist();
  }

  getVisitSearchCount(locationId) {
    return this._state.current_visit_searches[locationId] || 0;
  }

  incrementVisitSearch(locationId) {
    this._state.current_visit_searches[locationId] =
      (this._state.current_visit_searches[locationId] || 0) + 1;
    this._persist();
  }

  hasVisited(locationId) {
    return this._state.visited_locations.includes(locationId);
  }

  // --- Evidence ---

  hasEvidence(evidenceId) {
    return this._state.found_evidence.includes(evidenceId);
  }

  findEvidence(evidenceId) {
    if (this.hasEvidence(evidenceId)) return false;
    this._state.found_evidence.push(evidenceId);

    // Reveal any suspect gated on this evidence
    this._caseDef.suspects.forEach(s => {
      if (s.revealed_by_evidence === evidenceId) {
        this.revealSuspect(s.id);
      }
    });

    this._persist();
    return true;
  }

  getFoundEvidence() {
    return this._state.found_evidence
      .map(id => this._caseDef.evidence.find(e => e.id === id))
      .filter(Boolean);
  }

  getTotalEvidenceCount() {
    return this._caseDef.evidence.length;
  }

  // --- Suspects ---

  revealSuspect(suspectId) {
    if (!this._state.revealed_suspects.includes(suspectId)) {
      this._state.revealed_suspects.push(suspectId);
      this._persist();
    }
  }

  getRevealedSuspects() {
    return this._state.revealed_suspects
      .map(id => this._caseDef.suspects.find(s => s.id === id))
      .filter(Boolean);
  }

  getSuspectById(suspectId) {
    return this._caseDef.suspects.find(s => s.id === suspectId) || null;
  }

  // --- Objects ---

  isObjectSearched(objectId) {
    return this._state.searched_objects.includes(objectId);
  }

  markObjectSearched(objectId) {
    if (!this._state.searched_objects.includes(objectId)) {
      this._state.searched_objects.push(objectId);
    }
    this._persist();
  }

  // --- Dialogs ---

  isDialogUsed(dialogId) {
    return this._state.used_dialogs.includes(dialogId);
  }

  markDialogUsed(dialogId) {
    if (!this._state.used_dialogs.includes(dialogId)) {
      this._state.used_dialogs.push(dialogId);
    }
    this._persist();
  }

  // --- Accusation ---

  recordAccusation() {
    this._state.accusations_made++;
    this._state.last_evidence_count_at_accusation = this._state.found_evidence.length;
    this._persist();
  }

  canAccuse() {
    if (this._state.accusations_made === 0) return true;
    return this._state.found_evidence.length > this._state.last_evidence_count_at_accusation;
  }

  checkSolution(suspectId) {
    return suspectId === this._caseDef.solution.suspect_id;
  }

  hasSufficientEvidence() {
    const required = this._caseDef.solution.required_evidence;
    return required.every(id => this._state.found_evidence.includes(id));
  }

  getEvidenceWeight() {
    return this._state.found_evidence.reduce((sum, id) => {
      const ev = this._caseDef.evidence.find(e => e.id === id);
      return sum + (ev ? ev.weight : 0);
    }, 0);
  }

  // tierIndex: 0-5 matching TIERS in ReputationSystem
  getPersuasionThreshold(tierIndex) {
    const weight = this.getEvidenceWeight();
    const reduction = tierIndex >= 3 ? tierIndex - 2 : 0;
    return Math.max(5, 20 - weight - reduction);
  }

  abandonCase() {
    this._state = null;
    saveManager.clearActiveCase();
  }
}

export default new CaseManager();
