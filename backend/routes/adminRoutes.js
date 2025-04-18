const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Register admin
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin exists
        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create admin
        const admin = await Admin.create({
            username,
            password
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id)
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for admin
        const admin = await Admin.findOne({ username }).select('+password');
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Seed admin account
router.get('/seed', async (req, res) => {
    try {
        // Check if any admin exists
        const adminCount = await Admin.countDocuments();
        
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin account already exists' });
        }
        
        // Create default admin
        const admin = await Admin.create({
            username: 'admin',
            password: 'admin123'
        });

        if (admin) {
            res.status(201).json({
                message: 'Default admin account created successfully',
                _id: admin._id,
                username: admin.username
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = router; 