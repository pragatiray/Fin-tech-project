const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required for blacklisting'],
        unique: [true, 'Token is already blacklisted'],
        index: true
    },
}, {
    timestamps: true
});

tokenBlackListSchema.index({ createdAt: 1 }, { 
                   expireAfterSeconds: 60 * 60 * 24 * 3
     }); 

const tokenBlackListModel = mongoose.model('TokenBlackList', tokenBlackListSchema);

module.exports = tokenBlackListModel;