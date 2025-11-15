// src/index.js (bootstrapper)

import config from "./config/config.js";
import connectDB from "./config/db.js";
import app from "./app.js";

// Connect to database before starting server
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
