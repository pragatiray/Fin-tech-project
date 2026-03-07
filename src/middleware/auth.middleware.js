const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require("../models/blackList.model");

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: token is missing" 
            });
        }
        const isBlacklisted = await tokenBlacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: token is blacklisted"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: user not found" 
            });
        }

        req.user = user;
        return next();

    } catch (error) {
        console.log("JWT ERROR:", error.message);
        return res.status(401).json({ 
            success: false,
            message: "Unauthorized: invalid token",
            error: error.message
        });
    }
}


async function authSystemMiddleware(req, res, next) {

        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        try {
        if (!token) {   
            return res.status(401).json({
                message: "Unauthorized: token is missing"
            });
        }
        const isBlacklisted = await tokenBlacklistModel.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({   
                message: "Unauthorized: token is blacklisted"
            })
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");
        if (!user.systemUser) {
            return res.status(401).json({
                success: false,
                message: "Forbidden: user is not a system user"
            });
        }   
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized: token is invalid",
        });
    }
}
module.exports = { 
    authMiddleware, 
    authSystemMiddleware
};    