const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Call Python Flask ML service to get fraud probability
 * Falls back to heuristic if service unavailable
 * @param {Object} features
 * @returns {number} probability between 0 and 1
 */
exports.predict = async function(features) {
  try {
    const payload = {
      amount_deviation: features.amountDeviation,
      new_receiver: features.newReceiver ? 1 : 0,
      new_device: features.newDevice ? 1 : 0,
      hour: features.hour,
      frequency: features.recentTransactionCount
    };

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, {
      timeout: 5000 // 5 second timeout
    });

    const prob = parseFloat(response.data.fraud_probability);
    return isNaN(prob) ? fallbackPredict(features) : prob;
  } catch (err) {
    console.warn('ML service unavailable, using fallback:', err.message);
    return fallbackPredict(features);
  }
};

/**
 * Simple heuristic fallback when ML service is down
 */
function fallbackPredict(features) {
  let score = 0.1; // base
  if (features.amountDeviation > 2) score += 0.3;
  else if (features.amountDeviation > 1) score += 0.15;
  if (features.newReceiver) score += 0.2;
  if (features.newDevice) score += 0.15;
  if (features.timeAnomaly) score += 0.1;
  if (features.frequencySpike) score += 0.2;
  if (features.locationAnomaly) score += 0.1;
  return Math.min(score, 0.99);
}
