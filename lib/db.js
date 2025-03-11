import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected ${conn.connection.host}`);
  } catch (err) {
    console.log(`❌ Error connecting to mongoDb`);
    process.exit(1);
  }
};

export default connectDB;
