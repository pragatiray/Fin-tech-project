
const mongoose = require('mongoose');

function connectDB () {
         mongoose.connect(process.env.MONGO_URI)
         .then(() => {
            console.log('MongoDB connected successfully')
         })
         .catch((error) => {           
             console.error('Error connecting to MongoDB:', error);
             process.exit(1);
         })
}        
       
module.exports = connectDB;