const mongoose = require('mongoose')
const Config = require('../../config/config')

const schema = new mongoose.Schema(
    {
        name: {
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
        is_active: {
            type: Boolean,
            default: true,
            required: true,
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

schema.index({ name: 1 }) // Indexing

const model = mongoose.model('folders', schema)
module.exports = model