
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const emailService = require("../services/email.service");

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const isExists = await userModel.findOne({ email });

        if (isExists) {
            return res.status(422).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Create user
        const user = await userModel.create({
            name,
            email,
            password
        });

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
        await emailService.sendRegistrationEmail(user.email, user.name);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function userLoginController(req, res) {
    const { email, password } = req.body;

    try {
        // include password explicitly
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email or password is invalid"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Email or password is invalid"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
module.exports = {
    registerUser,
    userLoginController
}