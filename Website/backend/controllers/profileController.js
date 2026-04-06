const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).lean();
    res.render('profile/index', {
      title: 'Profile — FraudX',
      profileUser: user,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, deviceId, location } = req.body;

    if (!name || !email) {
      return res.redirect('/profile?error=Name+and+email+are+required');
    }

    // Check if email taken by another user
    const existing = await User.findOne({ email, _id: { $ne: req.session.user._id } });
    if (existing) {
      return res.redirect('/profile?error=Email+is+already+in+use');
    }

    const updated = await User.findByIdAndUpdate(
      req.session.user._id,
      { name, email, deviceId, location },
      { new: true }
    );

    // Update session
    req.session.user.name = updated.name;
    req.session.user.email = updated.email;
    req.session.user.deviceId = updated.deviceId;

    res.redirect('/profile?success=Profile+updated+successfully');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.redirect('/profile?error=All+password+fields+are+required');
    }

    if (newPassword !== confirmPassword) {
      return res.redirect('/profile?error=New+passwords+do+not+match');
    }

    if (newPassword.length < 6) {
      return res.redirect('/profile?error=Password+must+be+at+least+6+characters');
    }

    const user = await User.findById(req.session.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.redirect('/profile?error=Current+password+is+incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.redirect('/profile?success=Password+changed+successfully');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
};
