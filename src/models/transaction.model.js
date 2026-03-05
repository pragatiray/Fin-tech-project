const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must be associated with an account'],
        index: true
    },
    toAccount: {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must be associated with an account'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'COMPLETE', 'failed','REVERSED'],
            message: 'Status must be either PENDING, COMPLETE, failed, or REVERSED'
        },
        default: 'PENDING'
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount cannot be negative']
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required for creating a transactions'],
        unique: true,
        index: true
    }
 }, {
    timestamps: true
});

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;