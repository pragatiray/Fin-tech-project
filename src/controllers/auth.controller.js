
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
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

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    registerUser
}