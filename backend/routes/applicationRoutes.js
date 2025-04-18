const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { protect } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const cloudinary = require('../config/cloudinary');

// Submit application - use multer middleware to handle file uploads
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        console.log(req.body); // This should now contain your form fields
        // console.log(req.file);  // This will contain your resume file
        
        const { job, name, email, phone, coverLetter } = req.body;
        
        // Convert file buffer to base64 string for Cloudinary
        const resumeBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        // Upload resume to Cloudinary
        const resumeUpload = await cloudinary.uploader.upload(resumeBase64, {
            resource_type: 'raw',
            folder: 'resumes'
        });
        
        const application = await Application.create({
            job,
            name,
            email,
            phone,
            resume: resumeUpload.secure_url,
            coverLetter
        });

        res.status(201).json(application);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// Get all applications (Admin only)
router.get('/', async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('job', 'title')
            .sort('-appliedAt');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update application status (Admin only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = req.body.status;
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 