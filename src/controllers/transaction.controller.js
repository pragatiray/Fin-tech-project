const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');

/**
 * Create a new transaction 
 * THE 10-STEP TRANSACTION CREATION PROCESS:
 *  Validate request
 *  Validate idempotency key
 *  Check accounts status
 *  Derive sender balance for ledger
 * Create transaction (PENDING)
 * Create DEBIT ledger entry 
 * Create CREDIT ledger entry
 * Mark transaction as COMPLETE
 * Commit MongoDB session
 * Send email notifications
 */

async function createTransaction(req, res) {
  
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
   

}        

module.exports = {
    createTransaction
}