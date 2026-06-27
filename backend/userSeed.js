let User=require("./models/user")// Import user model
let bcrypt=require('bcrypt')// Import bcrypt for password hashing
require("./config/db")// Import database configuration
 let registerAdmin=async()=>{ // Function to register admin user
    try{
       
        let hashPassword=await(bcrypt.hash("admin",10))// Hash the password "admin" with salt rounds of 10
        let admin=new User({
            userId:"admin01",
            name:"admin",
            email:"admin@gmail.com",
            password:hashPassword,
            role:"admin",
        })
        await admin.save() // Save the admin user to the database
        console.log("Admin user created");

    }
    catch(err){
        console.log("User registeration error:",err);// Log any errors during user registration
    }
}

registerAdmin() // Call the user registration function