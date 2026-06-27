let mongoose=require('mongoose'); // Import 
require('dotenv').config();
mongoose
.connect(process.env.MONGODB_URL)// Connect to MongoDB database named EMS
.then(() => {
    console.log("Database is connected"); // Log successful connection

})
.catch((err)=>{
    console.log("Database connection error:",err); // Log any connection errors
})
 