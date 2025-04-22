const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const cloudinary = require("../config/cloudinary");

// Setup multer to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Submit application with resume upload
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { job, name, email, phone, coverLetter } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume file" });
    }

    // Convert resume buffer to base64 Data URI
    const fileDataUri = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary with correct resource type and format
    const resumeUpload = await cloudinary.uploader.upload(fileDataUri, {
      resource_type: "raw",
      folder: "resumes",
      public_id: `${Date.now()}-${name.replace(/\s+/g, "-")}`,
      format: "pdf",
      type: "upload",
      use_filename: true,
      unique_filename: false,
      flags: "attachment",
    });

    const application = await Application.create({
      job,
      name,
      email,
      phone,
      resume: resumeUpload.secure_url, // Store the secure URL from Cloudinary
      coverLetter,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(400)
      .json({ message: error.message || "Application submission failed" });
  }
});
// Get all applications (admin only)
router.get("/", protect, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job").populate("job.title")
      .sort("-appliedAt");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (admin only)
router.put("/:id/status", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = req.body.status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete application (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
