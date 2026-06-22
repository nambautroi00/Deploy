const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);

    process.exit(1);
  }
};

module.exports = connectDB;
