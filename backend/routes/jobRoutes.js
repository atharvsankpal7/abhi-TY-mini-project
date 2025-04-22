const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create job (Admin only)
router.post('/', protect, async (req, res) => {
    try {
        const job = await Job.create({
            ...req.body,
            postedBy: req.admin._id
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update job (Admin only)
router.put('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete job (Admin only)
router.delete('/:id',protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await Application.deleteMany({ job: req.params.id });
        await Job.findByIdAndRemove(req.params.id);
        res.json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 