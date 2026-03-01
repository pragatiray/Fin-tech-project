const express = require("express");
const router = express.Router();

const { registerUser,userLoginController } = require("../controllers/auth.controller");

router.post("/register", registerUser);

router.post("/login", userLoginController);

module.exports = router;