import saveManager from './SaveManager.js';

const TIERS = [
  { min: 0,   max: 20,       name: 'Renegado',            reduction: 0 },
  { min: 21,  max: 40,       name: 'Suspeito',             reduction: 0 },
  { min: 41,  max: 60,       name: 'Detetive',             reduction: 0 },
  { min: 61,  max: 80,       name: 'Investigador Sênior',  reduction: 1 },
  { min: 81,  max: 100,      name: 'Lenda',                reduction: 2 },
  { min: 101, max: Infinity, name: 'Inatingível',          reduction: 3 }
];

class ReputationSystem {
  getTierIndex(reputation) {
    return TIERS.findIndex(t => reputation >= t.min && reputation <= t.max);
  }

  getTierName(reputation) {
    const t = TIERS.find(t => reputation >= t.min && reputation <= t.max);
    return t ? t.name : 'Inatingível';
  }

  getTierReduction(reputation) {
    const t = TIERS.find(t => reputation >= t.min && reputation <= t.max);
    return t ? t.reduction : 3;
  }

  applyCorrectAccusation(caseData, evidenceFoundCount, withSufficientEvidence) {
    const rep = saveManager.getReputation();
    const base = caseData.solution.reputation_base_reward;
    const totalEvidence = caseData.evidence.length;
    let gain = base;

    if (withSufficientEvidence) {
      const thoroughness = Math.round((evidenceFoundCount / totalEvidence) * 50);
      gain = base + thoroughness;
    }

    saveManager.setReputation(rep + gain);
    saveManager.addReputationHistory(caseData.id, gain);
    return gain;
  }

  applyWrongAccusation() {
    const rep = saveManager.getReputation();
    saveManager.setReputation(rep - 40);
    saveManager.addReputationHistory('wrong_accusation', -40);
    return -40;
  }

  applyAcquittal() {
    const rep = saveManager.getReputation();
    saveManager.setReputation(rep - 20);
    return -20;
  }
}

export default new ReputationSystem();
