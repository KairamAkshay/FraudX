const riskEngine = require('./riskEngine');

/**
 * Decision Engine
 * Maps risk score to decision and risk level
 *
 * Score 0–25   → Low Risk    → allow
 * Score 26–50  → Medium Risk → otp
 * Score 51–75  → High Risk   → delay
 * Score 76–100 → Very High   → block
 */
exports.decide = function(riskScore, features) {
  const reasons = riskEngine.getRuleReasons(features);

  let decision, riskLevel;

  if (riskScore <= 25) {
    decision = 'allow';
    riskLevel = 'low';
    if (reasons.length === 0) reasons.push('Transaction appears normal');
  } else if (riskScore <= 50) {
    decision = 'otp';
    riskLevel = 'medium';
  } else if (riskScore <= 75) {
    decision = 'delay';
    riskLevel = 'high';
  } else {
    decision = 'block';
    riskLevel = 'very_high';
  }

  return { decision, riskLevel, reasons };
};
