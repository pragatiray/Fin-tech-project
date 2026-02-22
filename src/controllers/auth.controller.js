
const   userModel = require('../models/userModel');
const   

function registerUser (req,res) {
    const {name,email,password} = req.body;
    const isExits = userModel.findOne({
        email:email
    });

    if(isExits){
        return res.status(422).json({  
            message:"Email already exists",
            status: fail
        });
    }
    
    const user =  userModel.create({
        name,
        email,  
        password
    });

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

    res.status(201).json({
        message:"User registered successfully",
        status:success,
        user:user
    });
}

module.exports = {
    registerUser
}