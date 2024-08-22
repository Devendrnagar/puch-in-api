// Import necessary modules
import UserModel from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define UserController class
class UserController {
  // Method to handle user registration
  static async userRegistration(req, res) {
    // Extract data from request body
    const { name, username, email, password } = req.body;
    try {
      // Check if user with provided email already exists
      const user = await UserModel.findOne({ email: email });
      if (user) {
        return res.status(400).send({
          message: "Records show this email is linked to another account."
        });
      }
      // Check if all required fields are provided
      if (name && username && email && password) {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // Create a new user document
        const doc = new UserModel({
          name: name,
          username: username,
          email: email,
          password: hashPassword,
        });
        // Save the user document to the database
        await doc.save();
        // Return success response
        return res.status(201).send({ "status": "success", "message": "Registration Success" });
      } else {
        // Send error response if any required field is missing
        return res.send({ "status": "failed", "message": "All fields are required" });
      }
    } catch (error) {
      // Log and send error response if registration fails
      console.log(error);
      return res.status(400).send({ "status": "failed", "message": "Unable to Register" });
    }
  }

  // Method to handle user login
  static async userLogin(req, res) {
    try {
      // Extract email and password from request body
      const { email, password } = req.body;
      // Check if email and password are provided
      if (email && password) {
        // Find the user by email
        const user = await UserModel.findOne({ email: email });
        // If user not found, send error message
        if (user) {
          // Compare passwords
          const isMatch = await bcrypt.compare(password, user.password);
          // If passwords match, generate JWT token and send success response
          if (isMatch) {
            const token = jwt.sign({
              userId: user._id,
              email: user.email,
              username: user.username,
              name: user.name,
              // Add more details as needed
            }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_ExpiresIN });
            return res.status(200).json({
              status: "success", message: "Login success", token,
              "userId": user._id,
              "name": user.name,
              "username": user.username,
              "email": user.email
            });
          } else {
            // If passwords don't match, send error message
            return res.status(401).json({ status: "failed", message: "Invalid email or password" });
          }
        } else {
          // If user not found, send error message
          return res.status(404).json({ status: "failed", message: "User not found" });
        }
      } else {
        // If email or password is missing, send error message
        return res.status(400).json({ status: "failed", message: "Email and password are required" });
      }
    } catch (error) {
      // Log and send generic error message if login fails
      console.error("Login error:", error);
      return res.status(500).json({ status: "failed", message: "Unable to login" });
    }
  }
}

// Export UserController class
export default UserController;