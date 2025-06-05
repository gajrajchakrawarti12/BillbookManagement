import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
 