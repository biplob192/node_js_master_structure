// src/index.js (bootstrapper)

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import config from "./config/config.js";
import connectDB from "./config/db.js";
import app from "./app.js";

// Connect to database
// connectDB();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// app.listen(config.app.port, () => {
//   console.log(`Server running at ${config.app.baseUrl}`);
// });

// Use the following code instead to ensure DB connection before starting server:
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    app.listen(config.app.port, () => {
      console.log(`Server running at ${config.app.baseUrl}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
