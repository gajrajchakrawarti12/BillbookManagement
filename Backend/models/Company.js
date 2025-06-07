import mongoose from "mongoose";


const addressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
  }
);

const companySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  gstin: { type: String, nullable: true },
  pan: { type: String, nullable: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String, nullable: true, required: false },
  address: { type: addressSchema},
  image: { type: String, nullable: true, required: false },
  digiImage: {type: String, required: false},
});

export default mongoose.model("Company", companySchema);
