const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a job title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a job description']
    },
    requirements: {
        type: [String],
        required: [true, 'Please provide job requirements']
    },
    location: {
        type: String,
        required: [true, 'Please provide job location']
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        required: [true, 'Please provide job type']
    },
    salary: {
        type: String,
        required: [true, 'Please provide salary information']
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema); 