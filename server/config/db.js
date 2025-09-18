import mongoose from "mongoose";

 export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {});
    console.log(`MongoDB connected: `);


  } catch (error) {
    console.log(`MongoDB not connected: `);

    console.log(error);
  }
};





// const mysql = require('mysql2/promise');

// // Create a connection to the database
// const connection = mysql.createPool({
//   host: 'localhost', 
//   user: 'root', 
//   password:'2025',
//   database: 'flower_shop' 
// });



// module.exports = connection;

