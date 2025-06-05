import express from "express";
import File from "../models/File.js"; // Assuming you have a File model defined
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/:id", async (req, res) => {
  const fileId = req.params.id;
  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("cross-origin-resource-policy", process.env.CLIENT_URL);
    res.send(file.data);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", upload.single("file"), async (req, res) => {
  const fileId = req.params.id;
  const file = req.file;
  console.log(fileId, file);
  

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
      },
      { new: true } // return the updated document
    );
    console.log(updatedFile);
    

    if (!updatedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    return res
      .status(200)
      .json({ message: "File updated successfully", file: updatedFile });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/files/ — Upload file
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFile = new File({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
    });

    await newFile.save();

    return res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.delete("/:id", async (req, res) => {
  const fileId = req.params.id;
  try {
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).json({ message: "File not found" });
    }
    res
      .status(200)
      .json({ message: "File deleted successfully", file: deletedFile });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
