const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Setup multer
const upload = multer({
    storage: multer.memoryStorage()
});

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find()
            .sort('-createdAt')
            .populate('author', 'username');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create blog (Admin only)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Convert image buffer to base64 Data URI
        const fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
            folder: 'blogs',
            public_id: `${Date.now()}-${title.replace(/\s+/g, '-')}`,
        });

        const blog = await Blog.create({
            title,
            content,
            image: uploadResult.secure_url,
            author: req.admin._id
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update blog (Admin only)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const updateData = {
            title: req.body.title || blog.title,
            content: req.body.content || blog.content
        };

        if (req.file) {
            // Convert image buffer to base64 Data URI
            const fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
                folder: 'blogs',
                public_id: `${Date.now()}-${updateData.title.replace(/\s+/g, '-')}`,
            });

            updateData.image = uploadResult.secure_url;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('author', 'username');

        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete blog (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;