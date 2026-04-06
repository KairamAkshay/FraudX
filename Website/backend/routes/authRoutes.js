const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authController.postLogin);

router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, authController.postRegister);

router.get('/logout', authController.logout);

module.exports = router;
