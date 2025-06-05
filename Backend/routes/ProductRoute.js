import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log("Fetching data for product:", id);
    const product = await Product.find({ companyId: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching data for product:", id, error);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.get("/id/:id", async (req, res) => {
  const id = req.params.id;
  try {
    console.log("Fetching data for product:", id);
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching data for product:", id, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  try {
    const product = await Product.findByIdAndUpdate({_id: id} , updateData, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating data for product:", id, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting data for product:", id, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
