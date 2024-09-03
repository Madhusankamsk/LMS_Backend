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
            ref: "subjects",
            required: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            required: true,
        },
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        folder_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "folders",
        },
        duration: {
            type: String,
            required: true,
        },
        publish_date: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        rate_value: {
            type: Number,
        },
        paper_link: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        display_image_link: {
            type: String,
        },
        answer_link: {
            type: String,
        },
        video_link: {
            type: String,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        inactive_date: {
            type: Date,
            default: null,
        },
        is_deleted: {
            type: Boolean,
            required : true,
            default: false,
        },
        delete_date: {
            type: Date,
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

schema.index({ title: 1 }) // Indexing

const model = mongoose.model('papers', schema)
module.exports = model