const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login — FraudX',
    error: req.query.error || null,
    success: req.query.success || null
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Login — FraudX',
        error: 'Email and password are required.',
        success: null
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.render('auth/login', {
        title: 'Login — FraudX',
        error: 'Invalid email or password.',
        success: null
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login — FraudX',
        error: 'Invalid email or password.',
        success: null
      });
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      deviceId: user.deviceId
    };

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      title: 'Login — FraudX',
      error: 'Server error. Please try again.',
      success: null
    });
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register — FraudX',
    error: null
  });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.render('auth/register', {
        title: 'Register — FraudX',
        error: 'All fields are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'Register — FraudX',
        error: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.render('auth/register', {
        title: 'Register — FraudX',
        error: 'Password must be at least 6 characters.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register — FraudX',
        error: 'Email is already registered.'
      });
    }

    const user = await User.create({ name, email, password });

    // Create user profile
    const UserProfile = require('../models/UserProfile');
    await UserProfile.create({ userId: user._id });

    res.redirect('/login?success=Registration+successful!+Please+log+in.');
  } catch (err) {
    console.error('Register error:', err);
    res.render('auth/register', {
      title: 'Register — FraudX',
      error: 'Server error. Please try again.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login?success=You+have+been+logged+out.');
  });
};
