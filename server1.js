// Import necessary packages
import dotenv from 'dotenv'; // Package for handling environment variables
dotenv.config(); // Load environment variables from .env file
import express from 'express'; // Framework for building web applications
import cors from 'cors'; // Middleware for enabling CORS (Cross-Origin Resource Sharing)
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import connectDB from './config/connectdb.js'; // Function to connect to the database
import userRoutes from './routes/userRoutes.js'; // Router for user-related routes
import PunchModel from './models/PunchUser.js'; // Model for PunchUser
import jwt from "jsonwebtoken";

import { startOfDay, endOfDay } from 'date-fns';

// Create an Express application
const app = express();
const port = process.env.PORT; // Get the port from environment variables
const DATABASE_URL = process.env.DATABASE_URL; // Get the database URL from environment variables

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// Connect to the database
connectDB(DATABASE_URL);

// Setup user routes
app.use("/api/user", userRoutes);

// Route to punch in
app.post('/punch/in', async (req, res) => {
  // Extract necessary data from the request body
  const { selectedOption } = req.body;

  const { token } = req.headers;
  const userInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log({ userInfo })
  // Log received data


  // Create new Date object for punch in time and convert to IST
  const punchInTime = new Date();
  const istDate = new Date(punchInTime.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST

  try {
    // Create a new punch record in the database
    await PunchModel.create({ userId: userInfo.userId, Location: selectedOption, punchType: 'in', time: istDate });

    res.json({ success: true, message: 'Punched in successfully' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to punch in' });
  }
});

// Route to punch out
app.post('/punch/out', async (req, res) => {
  // Extract necessary data from the request body
  const { selectedOption } = req.body;

  const { token } = req.headers;
  const userInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log({ userInfo })
  // Create new Date object for punch out time and convert to IST
  const punchOutTime = new Date();
  const istDate = new Date(punchOutTime.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST

  try {
    // Create a new punch record in the database
    await PunchModel.create({ userId: userInfo.userId, Location: selectedOption, punchType: 'out', time: istDate });

    res.json({ success: true, message: 'Punched out successfully' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to punch out' });
  }
});

// Route to get current date and time
app.get('/get-date', (req, res) => {
  const currentDate = new Date();
  const istDate = new Date(currentDate.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
  res.json({ date: istDate });
});

// Route to get data for punching in
app.get('/get-data/punch-in', async (req, res) => {
  try {
    const { token } = req.headers;
    const userInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);

         const todayStart = startOfDay(new Date());
         const todayEnd = endOfDay(new Date());
    // Fetch punch in data from the database
    const punchInData = await PunchModel.find({
       userId: userInfo.userId,
        punchType: 'in',
        time: { $gte: todayStart, $lte: todayEnd }
       }).sort({ time: -1 }).limit(10);

    // Additional data specific to punching in
    const additionalData = {
      message: 'Data for punching in',
      extraInfo: 'Additional info for punching in'
    };

    res.json({ success: true, data: punchInData, ...additionalData });
  } catch (error) {
    console.error('Error fetching punch in data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch punch in data' });
  }
});

// Route to get data for punching out
app.get('/get-data/punch-out', async (req, res) => {
  try {
    const { token } = req.headers;
    const userInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // Get start and end of the current day
         const todayStart = startOfDay(new Date());
         const todayEnd = endOfDay(new Date());

    // Fetch punch out data from the database
    const punchOutData = await PunchModel.find({ 
      userId: userInfo.userId,
       punchType: 'out',
       time: { $gte: todayStart, $lte: todayEnd }

       }).sort({ time: -1 }).limit(10);

    // Additional data specific to punching out
    const additionalData = {
      message: 'Data for punching out',
      extraInfo: 'Additional info for punching out'
    };

    res.json({ success: true, data: punchOutData, ...additionalData });
  } catch (error) {
    console.error('Error fetching punch out data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch punch out data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
