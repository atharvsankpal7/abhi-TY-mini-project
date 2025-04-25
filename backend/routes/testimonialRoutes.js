const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Testimonial = require('../models/Testimonial');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Setup multer
const upload = multer({
    storage: multer.memoryStorage()
});

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort('-createdAt');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create testimonial (Admin only)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { name, position, content } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Convert image buffer to base64 Data URI
        const fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
            folder: 'testimonials',
            public_id: `${Date.now()}-${name.replace(/\s+/g, '-')}`,
        });

        const testimonial = await Testimonial.create({
            name,
            position,
            content,
            image: uploadResult.secure_url
        });

        res.status(201).json(testimonial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update testimonial (Admin only)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        const updateData = {
            name: req.body.name || testimonial.name,
            position: req.body.position || testimonial.position,
            content: req.body.content || testimonial.content
        };

        if (req.file) {
            // Convert image buffer to base64 Data URI
            const fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
                folder: 'testimonials',
                public_id: `${Date.now()}-${updateData.name.replace(/\s+/g, '-')}`,
            });

            updateData.image = uploadResult.secure_url;
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedTestimonial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete testimonial (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;