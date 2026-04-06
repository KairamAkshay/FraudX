const Transaction = require('../models/Transaction');

exports.handleQuery = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();
    
    let responseText = '';
    let suggestedActions = [];
    
    // Fetch last transaction context
    const lastTx = await Transaction.findOne({ userId }).sort({ createdAt: -1 }).lean();

    if (lowerMessage.includes('safe')) {
      if (!lastTx) {
        responseText = "You have no recorded transactions yet. Your account is completely safe!";
      } else if (lastTx.riskScore < 50) {
        responseText = "According to our AI analysis, your recent activity looks safe. Always remain vigilant!";
      } else {
        responseText = "We noticed some high-risk activity in your recent transactions. I recommend reviewing them immediately.";
        suggestedActions = ["View All Transactions", "Edit Profile Settings"];
      }
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('why') || lowerMessage.includes('risk') || lowerMessage.includes('blocked') || lowerMessage.includes('#')) {
      if (!lastTx) {
        responseText = "I couldn't find any recent transactions for this account.";
      } else {
        responseText = `Here is the AI analysis for your recent transaction of <strong>$${lastTx.amount}</strong> to <strong>${lastTx.receiverId}</strong>:<br><br>`;
        responseText += `<strong>Risk Score:</strong> ${lastTx.riskScore}/100<br>`;
        responseText += `<strong>ML Probability:</strong> ${(lastTx.mlProbability * 100).toFixed(1)}%<br>`;
        responseText += `<strong>Decision:</strong> <span class="badge badge-${lastTx.decision}">${lastTx.decision.toUpperCase()}</span><br><br>`;
        
        if (lastTx.reasons && lastTx.reasons.length > 0) {
          responseText += `<strong>This transaction was flagged because:</strong><ul>`;
          lastTx.reasons.forEach(r => { responseText += `<li>${r}</li>`; });
          responseText += `</ul>`;
        } else {
          responseText += "Our AI didn't flag any extreme anomalies for this transaction. It falls within normal patterns.";
        }

        // Suggested actions based on decision
        if (lastTx.decision === 'block') {
          suggestedActions = ["Review Profile Activity", "Secure Account Features"];
        } else if (lastTx.decision === 'delay' || lastTx.decision === 'otp') {
          suggestedActions = ["Verify via OTP", "Cancel if you don't recognize this"];
        } else {
          suggestedActions = ["Proceed naturally"];
        }
      }
    } else {
      // Default fallback message
      responseText = "I am your Fraud Advisor Assistant. I can explain your recent transactions, identify risks, and verify your account safety. How can I help you today?";
      suggestedActions = ["Explain last transaction", "Is my account safe?", "Show risky activity"];
    }

    return res.json({
      text: responseText,
      actions: suggestedActions
    });

  } catch (err) {
    console.error('Chatbot logic error:', err);
    res.status(500).json({ error: 'Server encountered an error analyzing your request.' });
  }
};
