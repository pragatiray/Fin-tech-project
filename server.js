
require('dotenv').config({ path: './src/.env' });
const app = require('./src/app');
const connectDB = require('./src/db');

connectDB();


 app.listen(3000, () => {
  console.log('Pragati, Your Server is running on port 3000');
});
