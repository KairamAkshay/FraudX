/**
 * Feature Engineering Service
 * Extracts behavioral features from a transaction and user profile
 */

const NORMAL_HOURS = { start: 7, end: 22 }; // 7 AM to 10 PM
const FREQUENCY_WINDOW_MINUTES = 5;
const FREQUENCY_THRESHOLD = 3;

/**
 * Extract features from a transaction relative to user profile
 * @param {Object} transaction
 * @param {Object} userProfile
 * @returns {Object} features
 */
exports.extractFeatures = function(transaction, userProfile) {
  const { amount, receiverId, deviceId, location, transactionTime } = transaction;

  // 1. Amount deviation from user average
  let amountDeviation = 0;
  if (userProfile.avgTransactionAmount > 0) {
    amountDeviation = (amount - userProfile.avgTransactionAmount) / userProfile.avgTransactionAmount;
  } else {
    amountDeviation = 0; // first transaction, no baseline
  }

  // 2. New receiver detection
  const newReceiver = !userProfile.knownReceivers.includes(receiverId);

  // 3. Device mismatch (new device)
  const newDevice = !userProfile.knownDevices.includes(deviceId);

  // 4. Location anomaly (new location)
  const locationAnomaly = userProfile.knownLocations.length > 0 &&
    !userProfile.knownLocations.includes(location);

  // 5. Time anomaly (outside normal hours 7AM-10PM)
  const hour = parseHour(transactionTime);
  const timeAnomaly = hour !== null && (hour < NORMAL_HOURS.start || hour > NORMAL_HOURS.end);

  // 6. Frequency spike: more than N transactions in last WINDOW minutes
  let frequencySpike = false;
  if (userProfile.transactionHistory && userProfile.transactionHistory.length > 0) {
    const windowStart = new Date(Date.now() - FREQUENCY_WINDOW_MINUTES * 60 * 1000);
    const recentCount = userProfile.transactionHistory.filter(
      t => new Date(t.timestamp) >= windowStart
    ).length;
    frequencySpike = recentCount >= FREQUENCY_THRESHOLD;
  }

  return {
    amountDeviation: parseFloat(amountDeviation.toFixed(4)),
    newReceiver,
    newDevice,
    locationAnomaly,
    timeAnomaly,
    frequencySpike,
    // Numeric versions for ML model
    amount: parseFloat(amount),
    hour: hour !== null ? hour : 12,
    recentTransactionCount: userProfile.totalTransactions
  };
};

/**
 * Parse hour from time string HH:MM or HH:MM:SS
 */
function parseHour(timeStr) {
  if (!timeStr) return null;
  // Handle both "14:30" and "14:30:00" formats
  const match = timeStr.match(/^(\d{1,2})/);
  if (match) return parseInt(match[1]);
  return null;
}
