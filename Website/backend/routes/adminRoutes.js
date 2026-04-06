const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/users', isAuthenticated, isAdmin, adminController.getUsers);
router.post('/users/:id/role', isAuthenticated, isAdmin, adminController.updateRole);
router.delete('/users/:id', isAuthenticated, isAdmin, adminController.deleteUser);

module.exports = router;
