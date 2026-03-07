const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/accountModel');
const emailService = require('../services/email.service');

/**
 * Create a new transaction 
 * THE 10-STEP TRANSACTION CREATION PROCESS:
 *  1.Validate request
 *  2.Validate idempotency key
 *  3.Check accounts status
 *  4.Derive sender balance for ledger
 *  5.Create transaction (PENDING)
 *  6.Create DEBIT ledger entry 
 *  7.Create CREDIT ledger entry
 *  8.Mark transaction COMPLETED
 *  9.Commit MongoDB session
 *  10.Send email notifications
 */

async function createTransaction(req, res) {

    //1.Validate request
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: fromAccount, toAccount, amount, idempotencyKey"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        });
    }

    /*
    * 2. Validate idempotency key
    */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (isTransactionAlreadyExists) {

        if (isTransactionAlreadyExists.status === 'COMPLETE') {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(200).json({
                message: "Transaction is still pending",
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(500).json({
                message: "Transaction has failed",
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === 'REVERSED') {
            return res.status(500).json({
                message: "Transaction has been reversed",
                transaction: isTransactionAlreadyExists
            });
        }
    }
    /*
    * 3. Check accounts status
    */
    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400).json({
            message: "fromAccount or toAccount is not active"
        });
    }

    /*
    * 4. Derive sender balance for ledger
    */

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance.Current balance is ${balance}.Required balance is ${amount}`
        });
    }

    /*
    * 5. Create transaction (PENDING)
    */
    const session = await transactionModel.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: 'PENDING'
    }], { session });

    await (() => {
        return new Promise(resolve => setTimeout(resolve, 10* 1000))
    }) ();

    const [creditLedgerEntry] = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: 'CREDIT'
    }], { session });

    const [debitLedgerEntry] = await ledgerModel.create([{
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: 'DEBIT'
        }], { session });
        transaction.status = 'COMPLETE';

    await transactionModel.findOneAndUpdate(
        {_id: transaction._id},
        {status: 'COMPLETE'},
        { session }
    )        

    await session.commitTransaction();
    session.endSession();

    /*   
    * 10.Send email notifications
    */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount,toAccount);
    res.status(201).json({  
        message: "Transaction completed successful",
        transaction
    });
}

async function createInitialFundsTransaction(req,res) {

    const {toAccount, amount, idempotencyKey} = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        res.status(400).json({
            message: "Missing required fields: toAccount, amount, idempotencyKey"
        });
    }
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });

    if (!toUserAccount) {
        res.status(400).json({
            message: "Invalid toAccount"
        });
    }
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    if (!fromUserAccount) {
        res.status(400).json({
            message: "System account not found for the user"
        });
    }

    const session = await transactionModel.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create([{
    fromAccount: fromUserAccount._id,
    toAccount: toAccount,
    amount,
    idempotencyKey,
    status: 'PENDING'
    }], { session });

    const [debitLedgerEntry] = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: 'DEBIT'
    }], { session });


    const [creditLedgerEntry] = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: 'CREDIT'
    }], { session });

    transaction.status = 'COMPLETE';
    await transaction.save({ session });


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        message: "Initial funds transaction completed successful",
        transaction 
    })

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    createInitialFundsTransaction
};