import User from "../models/user.model.js";   
import bcrypt from "bcryptjs";               
import createTokenAndSaveCookie from "../jwt/generateToken.js";

// Signup function for user registration
export const signup = async (req, res) => {
  // Destructure the request body to get user input
  const { fullname, email, password, confirmPassword } = req.body;
  try {
    // Check if the password and confirmPassword fields match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });  // If they don't match, return a 400 error
    }

    // Check if the user already exists by searching the database for the email
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });  // If user already exists, return a 400 error
    }

    // Hash the password using bcrypt with a salt rounds value of 10
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new User instance with the hashed password
    const newUser = await new User({
      fullname,   // Set the fullname from the request
      email,      // Set the email from the request
      password: hashPassword,  // Set the hashed password
    });

    // Save the new user to the database
    await newUser.save();

    // If the user is successfully created
    if (newUser) {
      // Generate a JWT and save it as a cookie
      createTokenAndSaveCookie(newUser._id, res);

      // Respond with a success message and user details
      res.status(201).json({
        message: "User created successfully",  // Success message
        user: {
          _id: newUser._id,    // Include the user ID
          fullname: newUser.fullname,   // Include the user's full name
          email: newUser.email,    // Include the user's email
        },
      });
    }
  } catch (error) {
    // Log the error and respond with a 500 server error
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login function for user authentication
export const login = async (req, res) => {
  // Destructure the request body to get the email and password
  const { email, password } = req.body;
  try {
    // Find the user by email in the database
    const user = await User.findOne({ email });

    // Compare the password provided with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If user is not found or the passwords don't match
    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid user credential" });  // Return a 400 error for invalid credentials
    }

    // Generate a JWT and save it as a cookie for the logged-in user
    createTokenAndSaveCookie(user._id, res);

    // Respond with a success message and user details
    res.status(201).json({
      message: "User logged in successfully",  // Success message
      user: {
        _id: user._id,  // Include the user ID
        fullname: user.fullname,  // Include the user's full name
        email: user.email,    // Include the user's email
      },
    });
  } catch (error) {
    // Log the error and respond with a 500 server error
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout function to clear the JWT cookie
export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie from the user's browser
    res.clearCookie("jwt");

    // Respond with a success message
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    // Log the error and respond with a 500 server error
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get all users except the logged-in one
export const allUsers = async (req, res) => {
  try {
    // Get the logged-in user's ID from the request object (which should be populated by middleware)
    const loggedInUser = req.user._id;

    // Find all users except the logged-in user and exclude the password field
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },   // Filter out the logged-in user using the $ne (not equal) operator
    }).select("-password");  // Exclude the password field from the results

    // Respond with the list of users
    res.status(201).json(filteredUsers);
  } catch (error) {
    // Log the error in case of failure
    console.log("Error in allUsers Controller: " + error);
  }
};
