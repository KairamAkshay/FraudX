const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, transactionController.getTransactions);
router.get('/simulate', isAuthenticated, transactionController.getSimulate);
router.post('/simulate', isAuthenticated, transactionController.postSimulate);
router.get('/search', isAuthenticated, transactionController.searchTransactions);

module.exports = router;
