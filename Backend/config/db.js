import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI ?? "mongodb+srv://gajrajchakrawarti12:M5n6RBP8YDjaheYr@cluster0.gwfuz.mongodb.net/billbook";
  if (!uri) throw new Error("MONGODB_URI is missing in environment variables.");

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
