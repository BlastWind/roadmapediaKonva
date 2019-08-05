const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Create Schema
const RoadmapSchema = new Schema({
    data: {
        type: String,
        require: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    hearts: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    thumbnail: {
        data: Buffer,
        contentType: String,
        default: []
    },
    author_id: {
        type: String,
        required: true
    },
    is_draft: {
        type: Boolean
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

RoadmapSchema.index({ description: 'text', title: 'text', category: 'text' })

module.exports = User = mongoose.model('roadmap', RoadmapSchema)
