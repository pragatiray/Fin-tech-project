const accountModel = require('../models/accountModel');


async function createAccount(req, res) {

    const user = req.user; // Assuming user is attached to req by auth middleware
    try {
        const account = await accountModel.create({
            user: user._id,
        });
        res.status(201).json({
            account
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function getUserAccountsController(req, res) {
    const user = req.user; 
        const accounts = await accountModel.find({ user: user._id });   
        res.status(200).json({
            accounts
        });
}

async function getUserAccountsBalanceController(req, res) {
    const {accountId} = req.params;
        const accounts = await accountModel.find({
             _id: accountId,
             user: req.user._id
        });

        if(!accounts) {
            return res.status(404).json({
                message: "Account not found for the user"
            });
        }
        const balance = await accounts.getBalance();

        res.status(200).json({
            accountId,
            balance
        });
}

module.exports = {
    createAccount,
    getUserAccountsController,
    getUserAccountsBalanceController
};  