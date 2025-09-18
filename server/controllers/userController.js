import User from '../models/users.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Enable debug logging for bcrypt
console.log('bcrypt module:', bcrypt);


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No users found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All users found",
      totalUsers: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Cannot get users",
      details: err.message
    });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error fetching user",
      details: err.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { email, password, userName, userType } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      userName,
      userType: userType || 'user', // Default to 'user' if not specified
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, userType: newUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Don't send password back
    const userToReturn = { ...newUser._doc };
    delete userToReturn.passwrd;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      data: userToReturn,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error creating user",
      details: err.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt with data:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials - email:', !!email, 'password:', '•'.repeat(password?.length || 0));
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Check if user exists
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
    if (!user) {
      console.log(`Login attempt failed - User not found: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log('User found, checking password...');
    // Check password - try both password and passwrd fields for compatibility
    const passwordToCheck = user.password || user.passwrd;
    if (!passwordToCheck) {
      console.log('No password found for user:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, passwordToCheck);
      console.log('Password comparison result:', isMatch);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during authentication',
        error: error.message
      });
    }
    
    if (!isMatch) {
      console.log(`Login attempt failed - Invalid password for user: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If we got here, password was correct - migrate passwrd to password if needed
    if (user.passwrd && !user.password) {
      user.password = user.passwrd;
      user.passwrd = undefined;
      await user.save();
      console.log('Migrated password for user:', email);
    }

    // Create JWT token with consistent _id field
    const token = jwt.sign(
      { _id: user._id, id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token for user:', user.email, 'expires in 1 day');

    // Don't send password back
    const userToReturn = { ...user._doc };
    delete userToReturn.passwrd;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userToReturn,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error logging in",
      details: err.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwrd = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Don't send password back
    const userToReturn = { ...user._doc };
    delete userToReturn.passwrd;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userToReturn,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error updating user",
      details: err.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error deleting user",
      details: err.message
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(200).json({
        success: true,
        message: 'Already logged out'
      });
    }

    // In a real app, you might want to add the token to a blacklist
    // For now, we'll just clear the cart from the client-side
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      // Add cart clearing instruction for the client
      clearCart: true
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: err.message
    });
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  logoutUser
};























// const db = require("./../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // 📋 get all users
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await db.query("SELECT * FROM users");

//     if (!users) {
//       res.status(404).json({
//         success: false,
//         error: "no users found",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: "All users found",
//       totalUsers: users[0].length,
//       data: users[0],
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: "cannot get users",
//       details: err.message,
//     });
//   }
// };

// //get user by id
// const getUserById = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     if (!userId) {
//       return res
//         .status(404)
//         .send({ success: false, error: "Invaled Provide id" });
//     }
//     const user = await db.query("SELECT * FROM users WHERE userId = ?", [
//       userId,
//     ]);

//     if (!user) {
//       return res.status(404).json({ success: false, error: "No User Found" });
//     }

//     res.status(200).json({
//       success: true,
//       data: user[0],
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "cannot get user by id", details: err.message });
//   }
// };

// // ➕ add new user
// const addUser = async (req, res) => {
//   try {
//     const { userName, email, password, userType } = req.body;
//     if (!userName || !email || !password || !userType) {
//       return res.status(400).send({
//         success: false,
//         message: "Please provide all fields",
//       });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const data = await db.query(
//       "INSERT INTO users (userName, email, passwrd, userType) VALUES (?,?,?,?)",
//       [userName, email, hashedPassword, userType]
//     );

//     if (!data) {
//       return res.status(500).send({
//         success: false,
//         message: "Error in creating user",
//       });
//     }

//     res.status(201).send({
//       success: true,
//       message: "User created successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: "Cannot create user",
//       details: err.message,
//     });
//   }
// };

// // 🔐 login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Please provide email and password." });
//     }

//     const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

//     if (userRows.length === 0) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     const user = userRows[0];

//     const isMatch = await bcrypt.compare(password, user.passwrd);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Create and sign a JWT
//     const token = jwt.sign({ id: user.userId, role: user.userType }, process.env.JWT_SECRET || 'your_default_secret', {
//       expiresIn: '1h',
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.userId,
//         name: user.userName,
//         email: user.email,
//         role: user.userType,
//         img: user.userImg,
//         balance: user.balance,
//         activity: user.activity,
//         // orders: user.orders,
//         // settings: user.settings,
//         // listings: user.listings,
//       },
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: "Error during login",
//       details: err.message,
//     });
//   }
// };

// // update user data

// const updateUser = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Check if user exists
//     const [userRows] = await db.query("SELECT * FROM users WHERE userId = ?", [
//       userId,
//     ]);
//     if (userRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     const { userName, email, password, userType } = req.body;

//     const updateFields = [];
//     const updateValues = [];

//     if (userName) {
//       updateFields.push("userName = ?");
//       updateValues.push(userName);
//     }
//     if (email) {
//       updateFields.push("email = ?");
//       updateValues.push(email);
//     }
//     if (userType) {
//       updateFields.push("userType = ?");
//       updateValues.push(userType);
//     }
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
//       updateFields.push("passwrd = ?");
//       updateValues.push(hashedPassword);
//     }

//     if (updateFields.length === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "No fields to update",
//       });
//     }

//     updateValues.push(userId);

//     // Update query
//     const data = await db.query(
//       `UPDATE users SET ${updateFields.join(", ")} WHERE userId = ?`,
//       updateValues
//     );

//     if (data[0].affectedRows === 0) {
//       return res.status(500).send({
//         success: false,
//         message: "Error in updating user",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "User updated successfully",
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({
//       success: false,
//       error: "Cannot update user",
//       details: err.message,
//     });
//   }
// };

// // 🗑️delete user
// const deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     if (!userId)
//       return res.status(400).send({
//         success: false,
//         error: "Invalid user ID",
//       });
//      await db.query("DELETE FROM users WHERE userId = ?", [userId]);

//     res.status(200).send({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: "Cannot delete user",
//       details: err.message,
//     });
//   }
// };

// module.exports = {
//   getAllUsers,
//   getUserById,
//   addUser,
//   loginUser,
//   updateUser,
//   deleteUser,
// };
