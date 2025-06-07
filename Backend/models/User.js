import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows multiple nulls
      trim: true,
      lowercase: true,
      required: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows multiple nulls
      trim: true,
      required: false,
    },
    image: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "STAFF"],
      default: "USER",
    },
    companyId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
