const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the client name'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Please provide the client position/company'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide testimonial content']
    },
    image: {
        type: String,
        required: [true, 'Please provide client image']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);