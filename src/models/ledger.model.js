const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Ledger entry must be associated with an account'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for a ledger entry'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'Ledger entry must be associated with a transaction'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['DEBIT', 'CREDIT'],
            message: 'Ledger type is required'
        },
        required: [true, 'Ledger type is required'],
        immutable: true
    },
    },
    {
        timestamps: true
});


function preventLedgerModification(next) {
    throw new Error('Ledger entries are immutable and cannot be modified after creation');
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('update', preventLedgerModification);


const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;