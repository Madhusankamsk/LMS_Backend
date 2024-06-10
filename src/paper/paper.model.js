const mongoose = require('mongoose')
const Config = require('../../config/config')

const schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_role",
            required: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_role",
            required: true,
        },
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_role",
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        publish_date: {
            type: Date,
            required: true,
        },
        is_free: {
            type: Boolean,
            default: false,
            required: true,
        },
        price: {
            type: String,
        },
        rate_value: {
            type: Number,
            required: true,
        },
        paper_link: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        answer_link: {
            type: String,
        },
        video_link: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        delete_date: {
            type: Date,
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

schema.index({ role: 1 }) // Indexing

const model = mongoose.model('paper', schema)
module.exports = model