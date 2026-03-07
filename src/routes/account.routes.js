const express = require('express');
const accountController = require('../controllers/account.controller');
const {authMiddleware} = require('../middleware/auth.middleware');
const router = express.Router();
/**
 *  POST /api/accounts
 *  Create a new account
 * Protected Route: Requires authentication
*/

router.post('/',authMiddleware,accountController.createAccount);

/**
 * GET /api/accounts
 * Get all accounts for the authenticated user
 * Protected
 */

router.get('/', authMiddleware, accountController.getUserAccountsController);


router.get('/balance/:accountId', authMiddleware, accountController.getUserAccountsBalanceController);

module.exports = router;