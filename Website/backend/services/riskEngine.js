/**
 * Risk Engine — Hybrid Scoring
 * Combines rule-based score with ML probability
 */

const RULES = {
  HIGH_AMOUNT_DEVIATION_MAJOR: { condition: f => f.amountDeviation > 3, score: 30, reason: 'Extreme amount deviation from normal' },
  HIGH_AMOUNT_DEVIATION: { condition: f => f.amountDeviation > 1.5, score: 20, reason: 'High amount deviation from user average' },
  NEW_RECEIVER: { condition: f => f.newReceiver, score: 15, reason: 'Transaction to unknown receiver' },
  NEW_DEVICE: { condition: f => f.newDevice, score: 15, reason: 'Transaction from unrecognized device' },
  TIME_ANOMALY: { condition: f => f.timeAnomaly, score: 10, reason: 'Transaction at unusual time' },
  FREQUENCY_SPIKE: { condition: f => f.frequencySpike, score: 20, reason: 'Unusual transaction frequency spike' },
  LOCATION_ANOMALY: { condition: f => f.locationAnomaly, score: 15, reason: 'Transaction from unusual location' }
};

/**
 * Calculate rule-based score (0–100)
 * @param {Object} features
 * @returns {number}
 */
exports.calculateRuleScore = function(features) {
  let totalScore = 0;
  for (const rule of Object.values(RULES)) {
    if (rule.condition(features)) {
      totalScore += rule.score;
    }
  }
  return Math.min(totalScore, 100);
};

/**
 * Get rule-triggered reasons
 * @param {Object} features
 * @returns {string[]}
 */
exports.getRuleReasons = function(features) {
  const reasons = [];
  for (const rule of Object.values(RULES)) {
    if (rule.condition(features)) {
      reasons.push(rule.reason);
    }
  }
  return reasons;
};

/**
 * Hybrid score: Rule Score + (ML Probability × 100)
 * Capped at 100
 * @param {number} ruleScore
 * @param {number} mlProbability
 * @returns {number}
 */
exports.calculateHybridScore = function(ruleScore, mlProbability) {
  const mlContribution = mlProbability * 100;
  // Weighted: 50% rule-based, 50% ML, then sum / 2 to keep 0-100
  const hybrid = (ruleScore * 0.5) + (mlContribution * 0.5);
  return Math.min(Math.round(hybrid * 10) / 10, 100);
};
