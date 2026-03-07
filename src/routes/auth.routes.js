const express = require("express");
const router = express.Router();

const { registerUser,userLoginController,userLogoutController} = require("../controllers/auth.controller");

router.post("/register", registerUser);

router.post("/login", userLoginController);

router.post("/logout", userLogoutController);

module.exports = router;