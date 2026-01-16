// src/index.js (bootstrapper)
import config from "./config/config.js";
import connectDB from "./config/db.js";
import {connectRedis} from "./config/redis.js";
import app from "./app.js";

// Connect to database before starting server
const startServer = async () => {
  try {
    // Connect to DB
    await connectDB(); // Wait for DB connection

    // Connect to Redis
    // await connectRedis(); // Wait for Redis connection
    connectRedis(); // Fire-and-forget Redis connection

    // Start server
    app.listen(config.app.port, () => {
      console.log(`Server running at ${config.app.baseUrl}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

// Connect to database (1): Simplest way to connect to database
// connectDB();

// Connect to database (2): Connect to database with assigned port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// Connect to database (3): Connect to database with definged port in config
// app.listen(config.app.port, () => {
//   console.log(`Server running at ${config.app.baseUrl}`);
// });
