// MongoDB (Mongoose)
// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error("MongoDB Connection Failed:", error.message);
//     process.exit(1); // Exit process with failure
//   }
// };

// export default connectDB;

// ========================================================================
// MySQL (Sequelize)
// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("MySQL Connected");
//   } catch (error) {
//     console.error("MySQL Connection Failed:", error.message);
//     process.exit(1);
//   }
// };

// export { sequelize, connectDB };

// ========================================================================
// In-Memory (for now)
const connectDB = async () => {
  console.log("Using in-memory database (no real DB connected).");
};

// Alternative in-memory MongoDB connection (for testing or temporary environments)
// -----------------------------------------------------------------------------
// Required packages:
// Run this command before using this:
//     npm install mongoose mongodb-memory-server
// -----------------------------------------------------------------------------
// import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";

// const connectDB = async () => {
//   try {
//     // 1. Create a new in-memory MongoDB instance
//     const mongoServer = await MongoMemoryServer.create();

//     // 2. Get the automatically generated connection URI
//     const mongoUri = mongoServer.getUri();

//     // 3. Connect Mongoose to the in-memory MongoDB instance
//     await mongoose.connect(mongoUri);

//     // 4. Log success message
//     console.log("In-Memory MongoDB Connected");
//   } catch (error) {
//     // 5. Log any errors and stop the process
//     console.error("In-Memory MongoDB Connection Failed:", error.message);
//     process.exit(1);
//   }
// };

// Export the connection function
export default connectDB;
