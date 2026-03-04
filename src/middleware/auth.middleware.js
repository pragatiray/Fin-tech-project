const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: token is missing" 
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
module.exports ={ authMiddleware};    