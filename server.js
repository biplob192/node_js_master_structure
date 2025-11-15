// server.js

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Start the server
// import "./src/index.js"; // This will execute before dotenv.config() is executed
await import("./src/index.js"); // This will execute after dotenv.config() is executed