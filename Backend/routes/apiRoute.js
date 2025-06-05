// routes/apiRoute.js
import express from "express";
import userRoute from "./userRoute.js";
import fileRoute from "./fileRoute.js";
import companyRoute from "./CompanyRoute.js";
import customerRoute from "./customerRoute.js";
import productRoute from "./ProductRoute.js";
import invoiceRoute from "./invoiceRoute.js";

const router = express.Router();

// Example protected route
router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome to the dashboard" });
});

router.use("/users", userRoute);
router.use("/files", fileRoute);
router.use("/companies", companyRoute);
router.use("/customer", customerRoute);
router.use("/product", productRoute);
router.use("/invoice", invoiceRoute);

export default router;
