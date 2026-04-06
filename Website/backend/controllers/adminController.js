const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    const profiles = await UserProfile.find().lean();

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const usersWithProfiles = users.map(u => ({
      ...u,
      profile: profileMap[u._id.toString()] || null
    }));

    res.render('admin/users', {
      title: 'User Management — FraudX',
      users: usersWithProfiles
    });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.render('error', { title: 'Error', message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.redirect('/admin/users?error=Invalid+role');
    }

    // Prevent self-demotion
    if (id === req.session.user._id.toString()) {
      return res.redirect('/admin/users?error=Cannot+change+your+own+role');
    }

    await User.findByIdAndUpdate(id, { role });
    res.redirect('/admin/users?success=Role+updated+successfully');
  } catch (err) {
    console.error('Update role error:', err);
    res.redirect('/admin/users?error=' + encodeURIComponent(err.message));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.session.user._id.toString()) {
      return res.redirect('/admin/users?error=Cannot+delete+your+own+account');
    }

    await User.findByIdAndDelete(id);
    await UserProfile.findOneAndDelete({ userId: id });

    res.redirect('/admin/users?success=User+deleted+successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    res.redirect('/admin/users?error=' + encodeURIComponent(err.message));
  }
};
