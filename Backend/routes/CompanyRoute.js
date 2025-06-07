import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const companyData = new Company(req.body);
  try {
    console.log(companyData);
    
    const company = await companyData.save();
    return res.json({ message: `Company created successfully`, company });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
// Example protected route
router.get("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    console.log(`Fetching company with ID: ${_id}`);
    const company = await Company.findOne({_id});
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.json({
      message: `Welcome to the dashboard, Company ${_id}`,
      company,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  console.log("Update data:", updateData);
  console.log(`Updating company: ${id} with data:`,id, updateData);

  try {
    const company = await Company.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.json({ message: `Comapany ${id} updated successfully`, company });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findOneAndDelete({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.json({ message: `Company ${id} deleted successfully`, company });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
