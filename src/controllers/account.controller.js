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
module.exports = {
    createAccount,
    getUserAccountsController
};  